import Department from '../models/Department.js';
import Scheme from '../models/Scheme.js';
import { createSystemNotification, recordAuditLog } from '../services/notifications/notificationService.js';

// Helper to slugify
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-');
};

export const getAllDepartments = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' && req.user?.role === 'ADMIN' ? {} : { isActive: true };

    const departments = await Department.find(filter).sort({ departmentName: 1 }).lean();

    // Attach scheme count for each department
    const deptIds = departments.map((d) => d._id);
    const schemeCounts = await Scheme.aggregate([
      { $match: { departmentId: { $in: deptIds }, isActive: true } },
      { $group: { _id: '$departmentId', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    schemeCounts.forEach((sc) => {
      countMap[sc._id.toString()] = sc.count;
    });

    const result = departments.map((dept) => ({
      ...dept,
      activeSchemeCount: countMap[dept._id.toString()] || 0,
    }));

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const query = isObjectId ? { _id: id } : { slug: id };
    const department = await Department.findOne(query);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const activeSchemeCount = await Scheme.countDocuments({
      departmentId: department._id,
      isActive: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...department.toObject(),
        activeSchemeCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentSchemes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { search, category, page = 1, limit = 12 } = req.query;

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const deptQuery = isObjectId ? { _id: id } : { slug: id };
    const department = await Department.findOne(deptQuery);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const schemeFilter = {
      departmentId: department._id,
      isActive: true,
    };

    if (category && category !== 'All') {
      schemeFilter.category = category;
    }

    if (search) {
      schemeFilter.$or = [
        { schemeName: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { targetBeneficiaries: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [schemes, total] = await Promise.all([
      Scheme.find(schemeFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('departmentId', 'departmentName slug ministryName'),
      Scheme.countDocuments(schemeFilter),
    ]);

    return res.status(200).json({
      success: true,
      department,
      data: schemes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Department
export const createDepartment = async (req, res, next) => {
  try {
    const { departmentName, slug, description, ministryName, officialWebsite, contactInformation, isActive } = req.body;

    if (!departmentName || !ministryName) {
      return res.status(400).json({ success: false, message: 'Department name and ministry name are required.' });
    }

    const generatedSlug = (slug || slugify(departmentName)).toLowerCase();
    const existing = await Department.findOne({
      $or: [{ departmentName: departmentName.trim() }, { slug: generatedSlug }],
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'A department with this name or slug already exists.' });
    }

    const newDept = await Department.create({
      departmentName: departmentName.trim(),
      slug: generatedSlug,
      description: description || '',
      ministryName: ministryName.trim(),
      officialWebsite: officialWebsite || '',
      contactInformation: contactInformation || {},
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await recordAuditLog({
      userId: req.user._id,
      action: 'CREATE_DEPARTMENT',
      entityType: 'Department',
      entityId: newDept._id,
      details: { name: newDept.departmentName },
    });

    await createSystemNotification({
      eventType: 'DEPARTMENT_CREATED',
      title: 'Department Added',
      description: `New department "${newDept.departmentName}" was registered.`,
      relatedEntityType: 'Department',
      relatedEntityId: newDept._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: newDept,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Department
export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departmentName, slug, description, ministryName, officialWebsite, contactInformation, isActive } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    if (departmentName) department.departmentName = departmentName.trim();
    if (slug) department.slug = slug.toLowerCase().trim();
    if (description !== undefined) department.description = description;
    if (ministryName) department.ministryName = ministryName.trim();
    if (officialWebsite !== undefined) department.officialWebsite = officialWebsite;
    if (contactInformation) department.contactInformation = contactInformation;
    if (isActive !== undefined) {
      department.isActive = Boolean(isActive);
      // Safe deactivation alert: warn or update associated schemes
      if (!department.isActive) {
        const associatedSchemes = await Scheme.countDocuments({ departmentId: id });
        console.warn(`[Department Deactivation] ${associatedSchemes} schemes associated with deactivated dept ${id}`);
      }
    }

    await department.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'UPDATE_DEPARTMENT',
      entityType: 'Department',
      entityId: department._id,
      details: { name: department.departmentName, isActive: department.isActive },
    });

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete or Deactivate Department
export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const associatedCount = await Scheme.countDocuments({ departmentId: id });
    if (associatedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${associatedCount} active or inactive scheme(s) linked to it. Please deactivate the department or reassign schemes first.`,
      });
    }

    await Department.findByIdAndDelete(id);

    await recordAuditLog({
      userId: req.user._id,
      action: 'DELETE_DEPARTMENT',
      entityType: 'Department',
      entityId: id,
      details: { name: department.departmentName },
    });

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
