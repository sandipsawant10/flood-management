const NotificationService = require('./notificationService');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Mock nodemailer
jest.mock('nodemailer');
nodemailer.createTransport.mockReturnValue({
  sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-email-id' }),
});

// Mock twilio
jest.mock('twilio');
twilio.mockReturnValue({
  messages: {
    create: jest.fn().mockResolvedValue({ sid: 'mock-sms-sid' }),
  },
});

describe('NotificationService', () => {
  let notificationService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Set up mock environment variables
    process.env.EMAIL_SERVICE = 'mockService';
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'password123';
    process.env.FROM_EMAIL = 'mock@example.com';
    process.env.TWILIO_SID = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    process.env.TWILIO_TOKEN = 'your_twilio_auth_token';
    process.env.TWILIO_PHONE = '+15017122661';

    notificationService = new NotificationService();
  });

  describe('sendEmail', () => {
    test('should send an email successfully', async () => {
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const html = '<p>Test HTML</p>';

      const result = await notificationService.sendEmail(to, subject, html);

      expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
      expect(notificationService.emailTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(notificationService.emailTransporter.sendMail).toHaveBeenCalledWith({
        from: 'mock@example.com',
        to,
        subject,
        html,
      });
      expect(result).toEqual({ messageId: 'mock-email-id' });
    });
  });

  describe('sendSMS', () => {
    test('should send an SMS successfully', async () => {
      const to = '+1234567890';
      const message = 'Test SMS Message';

      const result = await notificationService.sendSMS(to, message);

      expect(twilio).toHaveBeenCalledWith(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      expect(notificationService.smsClient.messages.create).toHaveBeenCalledTimes(1);
      expect(notificationService.smsClient.messages.create).toHaveBeenCalledWith({
        body: message,
        from: process.env.TWILIO_PHONE,
        to,
      });
      expect(result).toEqual({ sid: 'mock-sms-sid' });
    });

    test('should return null if SMS service is not configured', async () => {
      process.env.TWILIO_SID = ''; // Unset TWILIO_SID to simulate unconfigured SMS
      notificationService = new NotificationService(); // Re-initialize service

      const to = '+1234567890';
      const message = 'Test SMS Message';

      const result = await notificationService.sendSMS(to, message);

      expect(notificationService.smsClient).toBeNull();
      expect(twilio().messages.create).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('sendFloodAlert', () => {
    test('should send email for flood alert if preferences allow', async () => {
      const user = {
        _id: 'user123',
        email: 'user1@example.com',
        preferences: { notifications: { email: true } },
        save: jest.fn(),
      };
      const alert = { title: 'Flood Alert', message: 'Heavy rain expected.', severity: 'moderate' };

      await notificationService.sendFloodAlert([user], alert);

      expect(notificationService.emailTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(notificationService.emailTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: user.email, subject: expect.any(String) })
      );
      expect(notificationService.smsClient.messages.create).not.toHaveBeenCalled();
      expect(user.save).toHaveBeenCalledTimes(1);
    });

    test('should send SMS for critical flood alert if preferences allow', async () => {
      const user = {
        _id: 'user456',
        email: 'user2@example.com',
        phone: '+19876543210',
        preferences: { notifications: { sms: true } },
        save: jest.fn(),
      };
      const alert = { title: 'Critical Flood', message: 'Evacuate now!', severity: 'critical' };

      await notificationService.sendFloodAlert([user], alert);

      expect(notificationService.emailTransporter.sendMail).not.toHaveBeenCalled(); // Not email preferred
      expect(notificationService.smsClient.messages.create).toHaveBeenCalledTimes(1);
      expect(notificationService.smsClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({ to: user.phone, body: expect.stringContaining('FLOOD ALERT') })
      );
      expect(user.save).toHaveBeenCalledTimes(1);
    });

    test('should not send email or SMS if preferences disable them', async () => {
      const user = {
        _id: 'user789',
        email: 'user3@example.com',
        phone: '+11231231234',
        preferences: { notifications: { email: false, sms: false } },
        save: jest.fn(),
      };
      const alert = { title: 'Flood Alert', message: 'Test message', severity: 'critical' };

      await notificationService.sendFloodAlert([user], alert);

      expect(notificationService.emailTransporter.sendMail).not.toHaveBeenCalled();
      expect(notificationService.smsClient.messages.create).not.toHaveBeenCalled();
      expect(user.save).toHaveBeenCalledTimes(1);
    });

    test('should log error if notification fails', async () => {
      const user = {
        _id: 'user101',
        email: 'fail@example.com',
        preferences: { notifications: { email: true } },
        save: jest.fn(),
      };
      const alert = { title: 'Flood Alert', message: 'Error test', severity: 'moderate' };

      // Make sendMail throw an error
      notificationService.emailTransporter.sendMail.mockRejectedValueOnce(new Error('Email failed'));

      // Mock logger.error to check if it's called
      const loggerErrorSpy = jest.spyOn(require('../middleware/errorHandler').logger, 'error');

      const results = await notificationService.sendFloodAlert([user], alert);

      expect(loggerErrorSpy).toHaveBeenCalled();
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Email failed');
      expect(user.save).toHaveBeenCalledTimes(1);

      loggerErrorSpy.mockRestore(); // Clean up the spy
    });
  });
});