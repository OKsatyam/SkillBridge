import Notification from '../models/Notification.js';
import { emitToUser } from '../sockets/index.js';

export const notify = async (userId, type, message, link) => {
  const notification = await Notification.create({ user: userId, type, message, link });
  emitToUser(userId, 'notify:new', notification);
  return notification;
};

export const listMyNotifications = async (userId) => {
  return Notification.find({ user: userId }).sort('-createdAt').limit(50);
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  notification.read = true;
  await notification.save();
  return notification;
};
