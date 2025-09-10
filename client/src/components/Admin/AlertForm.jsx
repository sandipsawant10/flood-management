import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Send, MapPin, Users, AlertTriangle } from 'lucide-react';

const AlertForm = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'medium',
    area: '',
    targetAudience: 'all',
    expiresIn: '24'
  });

  const sendAlert = useMutation({
    mutationFn: async (alertData) => {
      // API call to send alert
      return alertData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['alerts']);
      setFormData({
        title: '',
        message: '',
        severity: 'medium',
        area: '',
        targetAudience: 'all',
        expiresIn: '24'
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    sendAlert.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Issue Alert or Bulletin</h2>
        <p className="mt-1 text-gray-600">Send emergency updates and notifications to affected areas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Alert Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Alert Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        {/* Alert Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            name="message"
            id="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        {/* Severity Level */}
        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
            Severity Level
          </label>
          <select
            name="severity"
            id="severity"
            value={formData.severity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="low">Low - Information Only</option>
            <option value="medium">Medium - Caution Required</option>
            <option value="high">High - Immediate Action Required</option>
          </select>
        </div>

        {/* Target Area */}
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700">
            Target Area
          </label>
          <input
            type="text"
            name="area"
            id="area"
            value={formData.area}
            onChange={handleChange}
            placeholder="e.g., Downtown, North District"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        {/* Target Audience */}
        <div>
          <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
            Target Audience
          </label>
          <select
            name="targetAudience"
            id="targetAudience"
            value={formData.targetAudience}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Users</option>
            <option value="residents">Residents Only</option>
            <option value="rescuers">Rescue Teams</option>
            <option value="officials">Municipal Officials</option>
          </select>
        </div>

        {/* Expiration Time */}
        <div>
          <label htmlFor="expiresIn" className="block text-sm font-medium text-gray-700">
            Alert Duration
          </label>
          <select
            name="expiresIn"
            id="expiresIn"
            value={formData.expiresIn}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="1">1 hour</option>
            <option value="4">4 hours</option>
            <option value="12">12 hours</option>
            <option value="24">24 hours</option>
            <option value="48">48 hours</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sendAlert.isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {sendAlert.isLoading ? (
              <>
                <span className="animate-spin mr-2">⌛</span>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Alert
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview Card */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Preview</h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className={`p-2 rounded-full ${getSeverityColor(formData.severity)}`}>
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">{formData.title || 'Alert Title'}</h4>
              <p className="text-gray-600 mt-1">{formData.message || 'Alert message will appear here'}</p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {formData.area || 'Target Area'}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {formData.targetAudience}
                </span>
                <span className="flex items-center">
                  <Bell className="w-4 h-4 mr-1" />
                  Expires in {formData.expiresIn}h
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getSeverityColor = (severity) => {
  const colors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500'
  };
  return colors[severity] || colors.medium;
};

export default AlertForm;