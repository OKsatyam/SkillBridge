import { listMyNotifications, markAsRead } from '../services/notification.service.js';

export const listNotificationsHandler = async (req, res, next) => {
  try {
    const notifications = await listMyNotifications(req.user._id);
    res.status(200).json({ success: true, data: { notifications }, message: 'Notifications fetched successfully' });
  } catch (err) {
    next(err);
  }
};

export const markReadHandler = async (req, res, next) => {
  try {
    const notification = await markAsRead(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: { notification }, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
};
