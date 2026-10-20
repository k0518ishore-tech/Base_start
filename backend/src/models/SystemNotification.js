import mongoose from 'mongoose';

const systemNotificationSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  relatedEntityType: {
    type: String,
    default: '',
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const SystemNotification = mongoose.model('SystemNotification', systemNotificationSchema);
export default SystemNotification;
