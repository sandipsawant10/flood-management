import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ProfileSettings from "./ProfileSettings"; // adjust the path if needed
import { useAuthStore } from "../../store/authStore";
import { User, Award, Calendar, Edit, Save, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { profileService } from "../../services/profileService";

const Profile = () => {
  const { user: authUser, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  
  // Fetch user profile data
  const { data: user, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: profileService.getUserProfile,
    initialData: authUser,
    staleTime: 300000, // 5 minutes
  });
  
  // Update profile mutation
  const { mutate: updateProfile, isLoading: isUpdating } = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (data) => {
      updateUser(formData); // Update local state
      setIsEditing(false);
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
  };

  // Start editing mode
  const handleEditClick = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || ""
    });
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Submit profile updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData) {
      updateProfile(formData);
    }
  };

  // Update notification preferences mutation
  const { mutate: updateNotifications, isLoading: isUpdatingNotifications } = useMutation({
    mutationFn: profileService.updateNotificationPreferences,
    onSuccess: (data) => {
      toast.success("Notification preferences updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update notification preferences");
    },
  });

  const handleNotificationToggle = (type) => {
    if (!user || !user.preferences) return;
    
    const updatedNotifications = {
      ...user.preferences.notifications,
      [type]: !user.preferences.notifications[type]
    };
    
    // Update local state immediately for responsive UI
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        notifications: updatedNotifications
      }
    };
    updateUser(updatedUser);
    
    // Send to server
    updateNotifications(updatedNotifications);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {isLoadingProfile ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 mr-2 animate-spin text-blue-600" />
          <span className="text-lg font-medium">Loading profile...</span>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <div className="ml-6">
                  <h1 className="text-3xl font-bold">{user?.name || "User Name"}</h1>
                  <p className="text-blue-100 mt-1">
                    {user?.email || "user@email.com"}
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        Trust Score: {user?.trustScore || 100}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        Member since {formatDate(user?.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className="flex items-center bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit Profile Form */}
      {isEditing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Profile</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <input
                  type="text"
                  id="avatar"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                  disabled={isUpdating}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Notification Preferences */}
      {!isLoadingProfile && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive alerts via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={user?.preferences?.notifications?.emailAlerts}
                  onChange={() => handleNotificationToggle("emailAlerts")}
                  disabled={isUpdatingNotifications}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-gray-500">Receive alerts on your device</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={user?.preferences?.notifications?.pushNotifications}
                  onChange={() => handleNotificationToggle("pushNotifications")}
                  disabled={isUpdatingNotifications}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">SMS Notifications</h3>
                <p className="text-sm text-gray-500">Receive alerts via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={user?.preferences?.notifications?.smsAlerts}
                  onChange={() => handleNotificationToggle("smsAlerts")}
                  disabled={isUpdatingNotifications}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
            </div>
            
            {isUpdatingNotifications && (
              <div className="flex items-center justify-center mt-2 text-blue-600">
                <Loader2 size={16} className="animate-spin mr-2" />
                <span>Updating preferences...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Settings */}
      <ProfileSettings />
    </div>
  );
};

export default Profile;
