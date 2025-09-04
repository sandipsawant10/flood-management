import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Settings,
  Bell,
  Shield,
  Save,
  Camera,
  Loader2,
  CheckCircle,
  Award,
  Calendar,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const ProfileSettings = () => {
  const { user, updateUser, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    communityUpdates: true,
    weatherAlerts: true,
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        district: user.location?.district || "",
        state: user.location?.state || "",
        address: user.location?.address || "",
      });

      if (user.preferences?.notifications) {
        setNotificationSettings(user.preferences.notifications);
      }
    }
  }, [user, reset]);

  const onSubmitProfile = async (data) => {
    const profileData = {
      ...data,
      location: {
        district: data.district,
        state: data.state,
        address: data.address,
        coordinates: user?.location?.coordinates || [],
      },
    };

    const result = await updateUser(profileData);
    if (result.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error(result.error || "Failed to update profile");
    }
  };

  const onSubmitNotifications = async () => {
    const result = await updateUser({
      preferences: {
        notifications: notificationSettings,
      },
    });

    if (result.success) {
      toast.success("Notification preferences updated!");
    } else {
      toast.error("Failed to update preferences");
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Puducherry",
    "Chandigarh",
    "Andaman and Nicobar Islands",
    "Dadra and Nagar Haveli",
    "Daman and Diu",
    "Lakshadweep",
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {profileImage || user?.avatar ? (
                <img
                  src={profileImage || user.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-700 rounded-full p-1 cursor-pointer hover:bg-blue-800">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="ml-6">
            <h1 className="text-3xl font-bold">
              {user?.name || "User Profile"}
            </h1>
            <p className="text-blue-100 mt-1">{user?.email}</p>
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
                  Member since {new Date(user?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile Information
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "notifications"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Notifications
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "security"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Security
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form
              onSubmit={handleSubmit(onSubmitProfile)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Personal Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        {...register("name", { required: "Name is required" })}
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <Controller
                      name="phone"
                      control={control}
                      rules={{
                        required: "Phone number is required",
                        validate: (value) =>
                          isValidPhoneNumber(value) || "Invalid phone number",
                      }}
                      render={({ field }) => (
                        <PhoneInput
                          {...field}
                          defaultCountry="IN"
                          placeholder="Enter phone number"
                          className="block w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Location Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District *
                    </label>
                    <input
                      {...register("district", {
                        required: "District is required",
                      })}
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your district"
                    />
                    {errors.district && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.district.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <select
                      {...register("state", { required: "State is required" })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address (Optional)
                    </label>
                    <textarea
                      {...register("address")}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your detailed address"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Notification Preferences
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Choose how you want to receive alerts and updates from
                  FloodGuard.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "emailAlerts",
                    title: "Email Alerts",
                    description:
                      "Receive flood warnings and critical alerts via email",
                    icon: <Mail className="w-5 h-5" />,
                  },
                  {
                    key: "smsAlerts",
                    title: "SMS Alerts",
                    description:
                      "Get emergency notifications via SMS (carrier charges may apply)",
                    icon: <Phone className="w-5 h-5" />,
                  },
                  {
                    key: "pushNotifications",
                    title: "Push Notifications",
                    description: "Browser notifications for real-time updates",
                    icon: <Bell className="w-5 h-5" />,
                  },
                  {
                    key: "communityUpdates",
                    title: "Community Updates",
                    description:
                      "Updates about new reports and community activities",
                    icon: <User className="w-5 h-5" />,
                  },
                  {
                    key: "weatherAlerts",
                    title: "Weather Alerts",
                    description: "Weather-related flood risk notifications",
                    icon: <AlertTriangle className="w-5 h-5" />,
                  },
                ].map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 text-gray-400 mt-1">
                        {setting.icon}
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {setting.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings[setting.key]}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            [setting.key]: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={onSubmitNotifications}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Account Security
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Manage your account security settings and password.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">
                      Account Verified
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your account has been verified and is secure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Change Password
                    </h4>
                    <p className="text-sm text-gray-600">
                      Update your account password for better security
                    </p>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showChangePassword ? "Cancel" : "Change"}
                  </button>
                </div>

                {showChangePassword && (
                  <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Update Password
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Trust Score
                    </h4>
                    <p className="text-sm text-gray-600">
                      Your community contribution score:{" "}
                      {user?.trustScore || 100}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {user?.trustScore || 100}
                    </div>
                    <div className="text-xs text-gray-500">Excellent</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Account Status
                    </h4>
                    <p className="text-sm text-gray-600">
                      Your account verification status
                    </p>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-green-600">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
