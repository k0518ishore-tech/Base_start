import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  searchQuery: {
    type: String,
    trim: true,
    default: '',
  },
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  interactionType: {
    type: String,
    enum: ['SEARCH', 'VIEW', 'FILTER'],
    default: 'SEARCH',
  },
  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheme',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
export default SearchHistory;
