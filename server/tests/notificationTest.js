/**
 * Notification System Test Script
 * 
 * This script tests the notification system across all channels:
 * - Email notifications
 * - SMS notifications
 * - In-app notifications
 */

require('dotenv').config();
const notificationService = require('../services/notificationService');
const mongoose = require('mongoose');
const User = require('../models/User');
const Alert = require('../models/Alert');
const Notification = require('../models/Notification');

// Test user data
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test User',
  email: process.env.TEST_EMAIL || 'test@example.com',
  phone: process.env.TEST_PHONE || '+1234567890',
  preferences: {
    notifications: {
      email: true,
      sms: true,
      pushNotifications: true
    }
  },
  location: {
    state: 'Test State',
    district: 'Test District'
  }
};

// Test alert data
const testAlert = {
  _id: new mongoose.Types.ObjectId(),
  title: 'Test Flood Alert',
  message: 'This is a test flood alert for notification system testing.',
  severity: 'high',
  targetArea: {
    state: 'Test State',
    district: 'Test District'
  },
  createdAt: new Date()
};

// Connect to MongoDB
async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// Test email notification
async function testEmailNotification() {
  console.log('\n🧪 Testing Email Notification...');
  try {
    const result = await notificationService.sendEmail(
      testUser.email,
      '🧪 Test Email Notification',
      `<h1>Test Email</h1>
      <p>This is a test email from the Flood Disaster Management System.</p>
      <p>If you received this email, the email notification system is working correctly.</p>
      <p>Time: ${new Date().toISOString()}</p>`
    );
    
    console.log('✅ Email notification test successful!');
    console.log(`📧 Email sent to: ${testUser.email}`);
    console.log(`📝 Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Email notification test failed:', error);
    return false;
  }
}

// Test SMS notification
async function testSMSNotification() {
  console.log('\n🧪 Testing SMS Notification...');
  try {
    if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN || !process.env.TWILIO_PHONE) {
      console.warn('⚠️ Twilio credentials not configured. Skipping SMS test.');
      return 'skipped';
    }
    
    const result = await notificationService.sendSMS(
      testUser.phone,
      '🧪 Test SMS from Flood Disaster Management System. If received, SMS notifications are working.'
    );
    
    console.log('✅ SMS notification test successful!');
    console.log(`📱 SMS sent to: ${testUser.phone}`);
    console.log(`📝 Message SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error('❌ SMS notification test failed:', error);
    return false;
  }
}

// Test in-app notification
async function testInAppNotification() {
  console.log('\n🧪 Testing In-App Notification...');
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.error('❌ Cannot test in-app notifications without database connection');
      return false;
    }
    
    // Create test notification
    const notification = await notificationService.createInAppNotification({
      recipient: testUser._id,
      title: '🧪 Test In-App Notification',
      message: 'This is a test in-app notification from the system.',
      type: 'info',
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('✅ In-app notification test successful!');
    console.log(`📝 Notification ID: ${notification._id}`);
    console.log(`👤 Recipient: ${notification.recipient}`);
    console.log(`📌 Title: ${notification.title}`);
    
    // Clean up test notification
    await Notification.findByIdAndDelete(notification._id);
    console.log('🧹 Test notification cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ In-app notification test failed:', error);
    return false;
  }
}

// Test alert notification (combines all channels)
async function testAlertNotification() {
  console.log('\n🧪 Testing Alert Notification (All Channels)...');
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.error('❌ Cannot test alert notifications without database connection');
      return false;
    }
    
    // Test the createAlertNotification method
    const results = await notificationService.createAlertNotification([testUser], testAlert);
    
    console.log('✅ Alert notification test completed!');
    console.log('📊 Results:', JSON.stringify(results, null, 2));
    
    // Clean up test notifications
    await Notification.deleteMany({ 
      recipient: testUser._id,
      'relatedItem.type': 'alert',
      'relatedItem.id': testAlert._id
    });
    console.log('🧹 Test notifications cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Alert notification test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Notification System Tests');
  console.log('======================================');
  
  const results = {
    email: await testEmailNotification(),
    sms: await testSMSNotification(),
    inApp: await testInAppNotification(),
    alert: await testAlertNotification()
  };
  
  console.log('\n📋 Test Summary');
  console.log('======================================');
  console.log(`Email Notifications: ${results.email ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`SMS Notifications: ${results.sms === true ? '✅ PASS' : results.sms === 'skipped' ? '⚠️ SKIPPED' : '❌ FAIL'}`);
  console.log(`In-App Notifications: ${results.inApp ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Alert Notifications: ${results.alert ? '✅ PASS' : '❌ FAIL'}`);
  
  // Disconnect from MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
  
  process.exit(0);
}

// Run the tests
runAllTests().catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
});