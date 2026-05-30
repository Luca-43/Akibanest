const Notification = require('../models/Notification');

exports.createNotification = async ({ organization, recipient, recipientType, type, title, message, data }) => {
  try {
    await Notification.create({ organization, recipient, recipientType, type, title, message, data });
  } catch (e) {
    console.log('Notification error:', e.message);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      organization: req.user.organization._id,
      recipient: req.user._id,
    }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    res.json({ success: true, unreadCount, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { organization: req.user.organization._id, recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};