const nodemailer = require("nodemailer");
const twilio = require("twilio");
const { logger } = require("../middleware/errorHandler");
const Notification = require("../models/Notification");

class NotificationService {
  constructor() {
    // Email setup
    this.emailTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // SMS setup (optional)
    this.smsClient = process.env.TWILIO_SID
      ? twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
      : null;
  }

  async sendFloodAlert(users, alert) {
    const results = [];

    for (const user of users) {
      try {
        // Send email notification
        if (user.preferences?.notifications?.email === true) {
          await this.sendEmail(
            user.email,
            `🚨 Flood Alert: ${alert.title}`,
            this.generateAlertHTML(alert, user)
          );
          results.push({ userId: user._id, type: "email", success: true });
        }

        // Send SMS for critical alerts
        if (
          alert.severity === "critical" &&
          user.phone &&
          user.preferences?.notifications?.sms === true
        ) {
          await this.sendSMS(
            user.phone,
            `FLOOD ALERT: ${alert.title}. ${alert.message}. Stay safe!`
          );
          results.push({ userId: user._id, type: "sms", success: true });
        }

        // Update user's last notification time
        user.lastNotificationAt = new Date();
        await user.save();
      } catch (error) {
        logger.error(`Notification failed for user ${user._id}:`, error);
        results.push({
          userId: user._id,
          type: "error",
          success: false,
          error: error.message,
        });
        // Update user's last notification time even if notification fails
        user.lastNotificationAt = new Date();
        await user.save();
      }
    }

    return results;
  }

  async sendEmail(to, subject, html) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || "Aqua Assists <noreply@Aqua Assists.in>",
      to,
      subject,
      html,
    };

    const info = await this.emailTransporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  }

  async sendSMS(to, message) {
    if (!this.smsClient) {
      logger.warn("SMS service not configured");
      return null;
    }

    const result = await this.smsClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to,
    });

    logger.info(`SMS sent: ${result.sid}`);
    return result;
  }

  generateAlertHTML(alert, user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flood Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🚨 Flood Alert</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Emergency Notification</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none;">
          <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #DC2626; margin: 0 0 10px 0; font-size: 20px;">${
              alert.title
            }</h2>
            <p style="margin: 0; font-size: 16px; color: #374151;"><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #374151; margin: 0 0 15px 0;">Alert Message</h3>
            <p style="color: #6B7280; line-height: 1.6; margin: 0;">${
              alert.message
            }</p>
          </div>

          ${
            alert.instructions && alert.instructions.length > 0
              ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">Safety Instructions</h3>
              <ul style="color: #6B7280; line-height: 1.6; padding-left: 20px;">
                ${alert.instructions
                  .map(
                    (instruction) =>
                      `<li style="margin-bottom: 8px;">${instruction}</li>`
                  )
                  .join("")}
              </ul>
            </div>
          `
              : ""
          }

          <div style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 20px; margin: 25px 0;">
            <h3 style="color: #DC2626; margin: 0 0 15px 0;">Emergency Contacts</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 15px;">
              <div><strong>Police:</strong> 100</div>
              <div><strong>Medical:</strong> 108</div>
              <div><strong>Fire:</strong> 101</div>
              <div><strong>Disaster Mgmt:</strong> 1070</div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; margin: 0 0 10px 0;">Stay safe, ${
              user.name
            }!</p>
            <p style="color: #9CA3AF; font-size: 14px; margin: 0;">
              Aqua Assists Team | Protecting India's Communities
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Welcome email for new users
  async sendWelcomeEmail(user) {
    const html = `
      <h1>Welcome to Aqua Assists, ${user.name}!</h1>
      <p>Thank you for joining India's largest flood disaster management community.</p>
      <p>Your account is now active and you can:</p>
      <ul>
        <li>Report flood conditions in your area</li>
        <li>Receive real-time flood alerts</li>
        <li>Access emergency services</li>
        <li>Help validate community reports</li>
      </ul>
      <p>Stay safe and help protect your community!</p>
      <p>Best regards,<br>Aqua Assists Team</p>
    `;

    return this.sendEmail(
      user.email,
      "Welcome to Aqua Assists - Your Account is Ready!",
      html
    );
  }

  // Report verification notification
  async sendReportVerificationEmail(user, report, status) {
    const statusMessages = {
      verified: {
        subject: "✅ Your Flood Report Has Been Verified",
        message:
          "Your flood report has been verified by our team and is now visible to the community.",
      },
      disputed: {
        subject: "⚠️ Your Flood Report Needs Review",
        message:
          "Your flood report requires additional verification. Please check the details and resubmit if necessary.",
      },
    };

    const { subject, message } = statusMessages[status];

    const html = `
      <h1>${subject}</h1>
      <p>Hello ${user.name},</p>
      <p>${message}</p>
      <p><strong>Report Details:</strong></p>
      <ul>
        <li>Location: ${report.location.district}, ${report.location.state}</li>
        <li>Severity: ${report.severity}</li>
        <li>Submitted: ${report.createdAt.toLocaleDateString()}</li>
      </ul>
      <p>Thank you for helping keep your community safe!</p>
    `;

    // Create in-app notification
    await this.createInAppNotification({
      recipient: user._id,
      title: statusMessages[status].subject,
      message: statusMessages[status].message,
      type: status === "verified" ? "success" : "info",
      relatedItem: {
        type: "floodReport",
        id: report._id,
      },
    });

    return this.sendEmail(user.email, subject, html);
  }

  // Create in-app notification
  async createInAppNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      logger.info(
        `In-app notification created for user ${notificationData.recipient}`
      );
      return notification;
    } catch (error) {
      logger.error(`Failed to create in-app notification:`, error);
      throw error;
    }
  }

  // Create in-app notification for multiple users
  async createBulkInAppNotifications(recipients, notificationData) {
    try {
      const notifications = [];

      for (const recipient of recipients) {
        const notification = new Notification({
          ...notificationData,
          recipient,
        });
        notifications.push(notification);
      }

      await Notification.insertMany(notifications);
      logger.info(
        `Bulk in-app notifications created for ${recipients.length} users`
      );
      return notifications;
    } catch (error) {
      logger.error(`Failed to create bulk in-app notifications:`, error);
      throw error;
    }
  }

  // Create alert notification (email, SMS, and in-app)
  async createAlertNotification(users, alert) {
    try {
      // Send email and SMS notifications
      const deliveryResults = await this.sendFloodAlert(users, alert);

      // Create in-app notifications
      const recipients = users.map((user) => user._id);
      await this.createBulkInAppNotifications(recipients, {
        title: `🚨 Flood Alert: ${alert.title}`,
        message: alert.message,
        type: "alert",
        relatedItem: {
          type: "alert",
          id: alert._id,
        },
        metadata: {
          severity: alert.severity,
          location: alert.location,
        },
      });

      return deliveryResults;
    } catch (error) {
      logger.error(`Failed to create alert notifications:`, error);
      throw error;
    }
  }

  /**
   * Send emergency status update notifications
   * @param {Object} emergency - Emergency document
   * @returns {Object} Result of notification creation
   */
  async sendEmergencyStatusUpdate(emergency) {
    try {
      // Get the latest status update
      const latestStatus =
        emergency.statusHistory[emergency.statusHistory.length - 1];

      // Format message based on status
      const statusMessages = {
        reported: "An emergency has been reported",
        assigned: "Emergency services have been assigned",
        in_progress: "Emergency services are responding",
        resolved: "The emergency has been resolved",
        cancelled: "The emergency alert has been cancelled",
      };

      const statusEmojis = {
        reported: "🚨",
        assigned: "🚑",
        in_progress: "🔴",
        resolved: "✅",
        cancelled: "⚠️",
      };

      const title = `${
        statusEmojis[emergency.status] || "🔔"
      } Emergency Update`;
      const message = `${
        statusMessages[emergency.status] || "Status updated"
      }: ${emergency.description}`;

      // Find users who need to be notified (reporter, assigned team, and admins)
      let notificationUsers = [];

      // Always notify the person who reported the emergency
      if (emergency.reportedBy) {
        notificationUsers.push(emergency.reportedBy);
      }

      // If there's an assigned team, notify team members
      if (emergency.assignedTeam) {
        const rescueTeam = await mongoose
          .model("RescueTeam")
          .findById(emergency.assignedTeam);
        if (rescueTeam && rescueTeam.leader) {
          notificationUsers.push(rescueTeam.leader);
        }
      }

      // Create in-app notifications
      if (notificationUsers.length > 0) {
        await this.createBulkInAppNotifications(notificationUsers, {
          title,
          message,
          type: "emergency_update",
          relatedItem: {
            type: "emergency",
            id: emergency._id,
          },
          metadata: {
            status: emergency.status,
            severity: emergency.severity,
            updatedAt: latestStatus.timestamp,
          },
        });
      }

      // For critical emergencies, also send email notifications
      if (emergency.severity === "critical" || emergency.severity === "high") {
        const users = await mongoose.model("User").find({
          _id: { $in: notificationUsers },
        });

        for (const user of users) {
          if (user.preferences?.notifications?.email) {
            const html = `
              <h2>${title}</h2>
              <p>${message}</p>
              <p><strong>Status:</strong> ${emergency.status}</p>
              <p><strong>Severity:</strong> ${emergency.severity}</p>
              <p><strong>Location:</strong> ${
                emergency.coordinates?.address || "Not specified"
              }</p>
              <p><strong>Updated:</strong> ${latestStatus.timestamp}</p>
            `;

            await this.sendEmail(user.email, title, html);
          }
        }
      }

      return { success: true, recipientCount: notificationUsers.length };
    } catch (error) {
      logger.error(
        `Failed to send emergency status update notifications:`,
        error
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification for low resource alert
   * @param {Object} resource - Resource document
   * @returns {Object} Result of notification creation
   */
  async sendLowResourceAlert(resource) {
    try {
      const title = `⚠️ Low Resource Alert: ${resource.name}`;
      const message = `${resource.name} is running low (${resource.quantity} remaining). Please restock soon.`;

      // Find admins and rescuers to notify
      const adminUsers = await mongoose
        .model("User")
        .find({
          role: { $in: ["admin", "rescuer"] },
        })
        .limit(10);

      if (!adminUsers || adminUsers.length === 0) {
        return { success: false, message: "No admin users found to notify" };
      }

      // Create in-app notifications
      const recipients = adminUsers.map((user) => user._id);
      await this.createBulkInAppNotifications(recipients, {
        title,
        message,
        type: "resource_alert",
        relatedItem: {
          type: "resource",
          id: resource._id,
        },
        metadata: {
          resourceName: resource.name,
          quantity: resource.quantity,
          threshold: resource.threshold,
          team: resource.team,
        },
      });

      return { success: true, recipientCount: recipients.length };
    } catch (error) {
      logger.error(`Failed to send low resource alert notifications:`, error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = NotificationService;
