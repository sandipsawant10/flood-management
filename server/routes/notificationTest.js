const express = require('express');
const router = express.Router();
const { auth: authenticateToken } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const User = require('../models/User');
const { logger } = require('../middleware/errorHandler');

/**
 * @route POST /api/notifications/test
 * @desc Test notification delivery across different channels
 * @access Private
 */
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { userId, channels, title, message, type } = req.body;
    
    // Only allow users to test notifications for themselves
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only test notifications for your own account' });
    }
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const results = {
      email: null,
      sms: null,
      inApp: null,
      timestamp: new Date().toISOString()
    };
    
    // Send email notification if requested
    if (channels.email) {
      try {
        const emailResult = await notificationService.sendEmail(
          user.email,
          `[TEST] ${title}`,
          `<h1>${title}</h1><p>${message}</p><p>This is a test notification sent at ${new Date().toLocaleString()}</p>`
        );
        results.email = { success: true, messageId: emailResult.messageId };
      } catch (error) {
        logger.error('Test email notification failed:', error);
        results.email = { success: false, error: error.message };
      }
    }
    
    // Send SMS notification if requested
    if (channels.sms) {
      if (!user.phone) {
        results.sms = { success: false, error: 'User has no phone number' };
      } else {
        try {
          const smsResult = await notificationService.sendSMS(
            user.phone,
            `[TEST] ${title}: ${message}`
          );
          results.sms = { success: true, sid: smsResult.sid };
        } catch (error) {
          logger.error('Test SMS notification failed:', error);
          results.sms = { success: false, error: error.message };
        }
      }
    }
    
    // Create in-app notification if requested
    if (channels.inApp) {
      try {
        const notification = await notificationService.createInAppNotification({
          recipient: user._id,
          title: `[TEST] ${title}`,
          message,
          type: 'info',
          metadata: {
            test: true,
            timestamp: new Date().toISOString()
          }
        });
        results.inApp = { success: true, notificationId: notification._id };
      } catch (error) {
        logger.error('Test in-app notification failed:', error);
        results.inApp = { success: false, error: error.message };
      }
    }
    
    return res.status(200).json(results);
  } catch (error) {
    logger.error('Notification test failed:', error);
    return res.status(500).json({ message: 'Failed to test notifications', error: error.message });
  }
});

module.exports = router;