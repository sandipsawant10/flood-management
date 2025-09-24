import React from "react";
import {
  AlertTriangle,
  CloudOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import useOffline from "../../hooks/useOffline";

/**
 * Component that wraps forms to provide offline submission capability
 * and user feedback about submission status
 */
const OfflineFormWrapper = ({
  children,
  submissionState,
  offlineSubmissionSupported = true,
}) => {
  const { online } = useOffline();

  // Get appropriate messaging based on state
  const getMessage = () => {
    if (!online) {
      if (!offlineSubmissionSupported) {
        return {
          type: "error",
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          title: "Internet Connection Required",
          message:
            "This form requires an internet connection to submit. Please try again when you're back online.",
        };
      }

      return {
        type: "warning",
        icon: <CloudOff className="w-5 h-5 text-amber-500" />,
        title: "Offline Mode",
        message:
          "You are currently offline. Your form will be saved and submitted automatically when you reconnect.",
      };
    }

    if (submissionState) {
      if (submissionState.status === "success") {
        return {
          type: "success",
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          title: submissionState.title || "Submission Successful",
          message:
            submissionState.message ||
            "Your information has been submitted successfully.",
        };
      }

      if (submissionState.status === "error") {
        return {
          type: "error",
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          title: submissionState.title || "Submission Failed",
          message:
            submissionState.message ||
            "There was an error submitting your information. Please try again.",
        };
      }

      if (submissionState.status === "pending") {
        return {
          type: "pending",
          title: submissionState.title || "Submitting...",
          message:
            submissionState.message ||
            "Please wait while your information is being submitted.",
        };
      }

      if (submissionState.status === "offline-queued") {
        return {
          type: "warning",
          icon: <CloudOff className="w-5 h-5 text-amber-500" />,
          title: submissionState.title || "Saved Offline",
          message:
            submissionState.message ||
            "Your information has been saved and will be submitted when you reconnect.",
        };
      }
    }

    return null;
  };

  const messageInfo = getMessage();

  const getColorsByType = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "pending":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  return (
    <div className="relative">
      {!online && !offlineSubmissionSupported && (
        <div className="absolute inset-0 bg-gray-200/60 z-10 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm">
            <div className="flex items-center text-amber-600 mb-3">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-medium">
                Internet Connection Required
              </h3>
            </div>
            <p className="text-gray-600">
              This form requires an internet connection to submit. Please
              connect to the internet and try again.
            </p>
          </div>
        </div>
      )}

      {messageInfo && (
        <div
          className={`mb-4 p-3 border rounded-md ${getColorsByType(
            messageInfo.type
          )}`}
        >
          <div className="flex items-center">
            {messageInfo.icon && (
              <span className="mr-2">{messageInfo.icon}</span>
            )}
            <div>
              <h4 className="font-medium">{messageInfo.title}</h4>
              <p className="text-sm">{messageInfo.message}</p>
            </div>
          </div>
        </div>
      )}

      {children}

      {!online && offlineSubmissionSupported && (
        <div className="mt-4 text-sm text-gray-500 flex items-center">
          <CloudOff className="w-4 h-4 mr-1 inline" />
          <span>
            You are currently offline. This form works offline and will be
            submitted automatically when you reconnect.
          </span>
        </div>
      )}
    </div>
  );
};

export default OfflineFormWrapper;
