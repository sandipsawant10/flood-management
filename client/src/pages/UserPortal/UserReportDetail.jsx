import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  MapPin,
  ArrowLeft,
  Calendar,
  User,
  DropletIcon,
  Clock,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  MessageSquare,
  ThumbsUp,
  Flag,
  Share2,
} from "lucide-react";
import { floodReportService } from "../../services/floodReportService";
import InteractiveFloodMap from "../../components/Maps/InteractiveFloodMap";

// Fix missing DropletIcon if needed
const Droplet = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const UserReportDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();

  // Debug log for reportId
  console.log("[UserReportDetail] reportId param:", reportId);

  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["report-detail", reportId],
    queryFn: () => {
      console.log("[UserReportDetail] Fetching report", reportId);
      return floodReportService.getReportById(reportId);
    },
    enabled: !!reportId,
  });

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get verification status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" /> Verified
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-2" /> Pending Verification
          </span>
        );
      case "disputed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-2" /> Disputed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Get severity level badge
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "critical":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-4 h-4 mr-2" /> Critical
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            <AlertTriangle className="w-4 h-4 mr-2" /> High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-4 h-4 mr-2" /> Medium
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <AlertTriangle className="w-4 h-4 mr-2" /> Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {severity}
          </span>
        );
    }
  };

  // Get water level description based on level
  const getWaterLevelDescription = (level) => {
    const descriptions = {
      low: "Ankle deep (0.1-0.5m)",
      medium: "Knee deep (0.5-1m)",
      high: "Waist deep (1-1.5m)",
      critical: "Chest or above (>1.5m)",
    };
    return descriptions[level] || level;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Error state
  if (error || !report) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
        <p>
          Error loading report details. The report may not exist or you may not
          have permission to view it.
        </p>
        <button
          onClick={() => navigate("/portal/reports")}
          className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Reports
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/portal/reports")}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Reports
          </button>
          <div className="flex items-center space-x-2">
            {getStatusBadge(report.verificationStatus)}
            {getSeverityBadge(report.severity)}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Flood Report - {report.location.district}, {report.location.state}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(report.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            <span>{report.reportedBy?.name || "Anonymous"}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span>
              {report.location.address ||
                `${report.location.district}, ${report.location.state}`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Map */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="h-64">
              {report.location.coordinates && (
                <InteractiveFloodMap
                  height="100%"
                  center={[
                    report.location.coordinates[1],
                    report.location.coordinates[0],
                  ]}
                  zoom={15}
                  highlightReport={report._id}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-gray-700">{report.description}</p>
          </div>

          {/* Media */}
          {report.media && report.media.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-gray-600" /> Media (
                {report.media.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {report.media.map((media, index) => (
                  <div
                    key={index}
                    className="rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={media.url}
                      alt={`Flood report image ${index + 1}`}
                      className="w-full h-32 object-cover"
                      onClick={() => window.open(media.url, "_blank")}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Flood Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-medium mb-3">Flood Details</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-sm text-gray-500">Severity</p>
                <p className="text-gray-900 capitalize">{report.severity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Water Level</p>
                <p className="text-gray-900 capitalize">
                  {report.waterLevel} -{" "}
                  {getWaterLevelDescription(report.waterLevel)}
                </p>
              </div>
              {report.depth && (
                <div>
                  <p className="text-sm text-gray-500">Depth</p>
                  <p className="text-gray-900">{report.depth} meters</p>
                </div>
              )}
              {report.verificationCount > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Verifications</p>
                  <p className="text-gray-900">
                    {report.verificationCount} users
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Impact Assessment */}
          {report.impact && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-medium mb-3">Impact Assessment</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {report.impact.affectedPeople && (
                  <div>
                    <p className="text-sm text-gray-500">People Affected</p>
                    <p className="text-gray-900">
                      {report.impact.affectedPeople}
                    </p>
                  </div>
                )}
                {report.impact.damagedProperties && (
                  <div>
                    <p className="text-sm text-gray-500">Properties Damaged</p>
                    <p className="text-gray-900">
                      {report.impact.damagedProperties}
                    </p>
                  </div>
                )}
                {report.impact.economicLoss && (
                  <div>
                    <p className="text-sm text-gray-500">Economic Loss</p>
                    <p className="text-gray-900">
                      ₹{report.impact.economicLoss.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              {report.impact.blockedRoads &&
                report.impact.blockedRoads.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Blocked Roads</p>
                    <ul className="list-disc list-inside text-gray-900 pl-1">
                      {report.impact.blockedRoads.map((road, index) => (
                        <li key={index}>{road}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {/* Emergency Tags */}
          {report.tags && report.tags.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-medium mb-3">Emergency Tags</h2>
              <div className="flex flex-wrap gap-2">
                {report.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 rounded-full text-sm bg-red-50 text-red-700 border border-red-100"
                  >
                    {tag
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-medium mb-3">Report Actions</h2>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </button>
              <button className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100">
                <ThumbsUp className="w-4 h-4 mr-2" /> Confirm Report
              </button>
              <button className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100">
                <Flag className="w-4 h-4 mr-2" /> Dispute
              </button>
              <button className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100">
                <MessageSquare className="w-4 h-4 mr-2" /> Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReportDetail;
