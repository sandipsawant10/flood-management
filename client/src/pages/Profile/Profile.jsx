import React from "react";
import ProfileSettings from "./ProfileSettings"; // adjust the path if needed
import { useAuthStore } from "../../store/authStore";
import { User, Award, Calendar } from "lucide-react";

const Profile = () => {
  const { user } = useAuthStore();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
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
      </div>

      {/* Profile Settings */}
      <ProfileSettings />
    </div>
  );
};

export default Profile;
