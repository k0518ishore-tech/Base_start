import SearchHistory from '../models/SearchHistory.js';

export const logSearch = async (req, res, next) => {
  try {
    const { searchQuery, filters, schemeId, interactionType } = req.body;

    if (!req.user) {
      return res.status(200).json({ success: true, message: 'Skipped for anonymous' });
    }

    const entry = await SearchHistory.create({
      userId: req.user._id,
      searchQuery: searchQuery ? searchQuery.trim() : '',
      filters: filters || {},
      schemeId: schemeId || null,
      interactionType: interactionType || 'SEARCH',
    });

    return res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

export const getRecentSearches = async (req, res, next) => {
  try {
    const history = await SearchHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('schemeId', 'schemeName slug category');

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
