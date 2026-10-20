import Bookmark from '../models/Bookmark.js';
import Scheme from '../models/Scheme.js';

export const getMyBookmarks = async (req, res, next) => {
  try {
    const { search } = req.query;

    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'schemeId',
        populate: { path: 'departmentId', select: 'departmentName slug ministryName' },
      });

    let results = bookmarks.filter((b) => b.schemeId != null);

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      results = results.filter((b) =>
        b.schemeId.schemeName.toLowerCase().includes(q) ||
        b.schemeId.category.toLowerCase().includes(q) ||
        (b.reminder?.message && b.reminder.message.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const addBookmark = async (req, res, next) => {
  try {
    const { schemeId } = req.body;

    if (!schemeId) {
      return res.status(400).json({ success: false, message: 'Scheme ID is required' });
    }

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    // Check duplicate
    const existing = await Bookmark.findOne({ userId: req.user._id, schemeId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Scheme is already bookmarked.',
        data: existing,
      });
    }

    const bookmark = await Bookmark.create({
      userId: req.user._id,
      schemeId,
    });

    return res.status(201).json({
      success: true,
      message: 'Scheme bookmarked successfully.',
      data: bookmark,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleBookmark = async (req, res, next) => {
  try {
    const { schemeId } = req.params;

    const existing = await Bookmark.findOne({ userId: req.user._id, schemeId });
    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        isBookmarked: false,
        message: 'Scheme removed from bookmarks.',
      });
    }

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    const newBookmark = await Bookmark.create({
      userId: req.user._id,
      schemeId,
    });

    return res.status(201).json({
      success: true,
      isBookmarked: true,
      message: 'Scheme added to bookmarks.',
      data: newBookmark,
    });
  } catch (error) {
    next(error);
  }
};

export const removeBookmark = async (req, res, next) => {
  try {
    const { schemeId } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({
      userId: req.user._id,
      schemeId,
    });

    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
