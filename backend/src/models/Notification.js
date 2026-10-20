import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  notificationType: {
    type: String,
    enum: ['REMINDER', 'SCHEME_UPDATE', 'FEEDBACK_REPLY', 'SYSTEM'],
    default: 'SYSTEM',
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  relatedSchemeId: {
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

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
