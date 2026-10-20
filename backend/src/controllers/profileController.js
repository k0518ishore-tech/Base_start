import UserProfile from '../models/UserProfile.js';
import User from '../models/User.js';

export const getMyProfile = async (req, res, next) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await UserProfile.create({ userId: req.user._id });
    }

    return res.status(200).json({
      success: true,
      profile,
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      dateOfBirth,
      gender,
      state,
      district,
      annualFamilyIncome,
      education,
      occupation,
      employmentStatus,
      community,
      disabilityStatus,
      otherDetails,
    } = req.body;

    // 1. Update User basic info if provided
    if (fullName || phone !== undefined) {
      const userUpdate = {};
      if (fullName) userUpdate.fullName = fullName.trim();
      if (phone !== undefined) userUpdate.phone = phone.trim();
      await User.findByIdAndUpdate(req.user._id, userUpdate);
    }

    // 2. Update User Profile
    const profileFields = {
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || '',
      state: state || '',
      district: district || '',
      annualFamilyIncome: annualFamilyIncome !== undefined && annualFamilyIncome !== null && annualFamilyIncome !== ''
        ? Number(annualFamilyIncome)
        : null,
      education: education || '',
      occupation: occupation || '',
      employmentStatus: employmentStatus || '',
      community: community || '',
      disabilityStatus: Boolean(disabilityStatus),
      otherDetails: otherDetails || {},
    };

    let profile = await UserProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: profileFields },
      { new: true, upsert: true, runValidators: true }
    );

    const updatedUser = await User.findById(req.user._id).select('-passwordHash');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
