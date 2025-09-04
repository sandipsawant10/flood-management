import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import {
  MapPin,
  Calendar,
  Users,
  Droplets,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const ViewReports = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch reports with filters
  const {
    data: reportsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    [
      "flood-reports",
      searchTerm,
      selectedState,
      selectedSeverity,
      selectedStatus,
      sortBy,
    ],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedState) params.append("state", selectedState);
      if (selectedSeverity) params.append("severity", selectedSeverity);
      if (selectedStatus) params.append("status", selectedStatus);
      params.append("sortBy", sortBy);
      params.append("limit", "20");

      const response = await fetch(`/api/flood-reports?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch reports");
      return response.json();
    }
  );

  const reports = reportsData?.data || [];

  // Handle report validation
  const handleValidation = async (reportId, action) => {
    try {
      const response = await fetch(`/api/flood-reports/${reportId}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error("Failed to validate report");

      toast.success(
        `Report ${action === "upvote" ? "upvoted" : "downvoted"} successfully`
      );
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      critical: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[severity] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "disputed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const indianStates = [
    "Andhra Pradesh",
    "Assam",
    "Bihar",
    "Gujarat",
    "Karnataka",
    "Kerala",
    "Maharashtra",
    "Odisha",
    "Tamil Nadu",
    "West Bengal",
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Community Flood Reports</h1>
            <p className="text-blue-100 mt-1">
              Real-time flood conditions reported by community members
            </p>
          </div>
          <Link
            to="/report-flood"
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-medium"
          >
            Report Flood
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All States</option>
            {indianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="disputed">Disputed</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="severity">By Severity</option>
            <option value="location">By Location</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading reports...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Error Loading Reports
            </h3>
            <p className="text-red-600">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <Droplets className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No Reports Found
            </h3>
            <p className="text-gray-500 mb-6">
              No flood reports match your current filters. Try adjusting your
              search criteria.
            </p>
            <Link
              to="/report-flood"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <Droplets className="w-4 h-4 mr-2" />
              Report a Flood
            </Link>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="font-medium">
                          {report.location?.district}, {report.location?.state}
                        </span>
                      </div>

                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                          report.severity
                        )}`}
                      >
                        {report.severity?.toUpperCase()}
                      </div>

                      <div className="flex items-center">
                        {getStatusIcon(report.verificationStatus)}
                        <span className="text-xs text-gray-500 ml-1 capitalize">
                          {report.verificationStatus || "pending"}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Water Level:{" "}
                      {report.waterLevel?.replace("-", " ") || "Not specified"}
                    </h3>

                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {report.description}
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>
                          {report.impact?.affectedPeople || 0} affected
                        </span>
                      </div>

                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span>Urgency: {report.urgencyLevel || 0}/10</span>
                      </div>
                    </div>
                  </div>

                  {/* Media Preview */}
                  {report.mediaFiles && report.mediaFiles.length > 0 && (
                    <div className="ml-6">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={report.mediaFiles[0]}
                          alt="Flood condition"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {report.mediaFiles.length > 1 && (
                        <span className="text-xs text-gray-500 mt-1 block">
                          +{report.mediaFiles.length - 1} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    {/* Validation Actions */}
                    <button
                      onClick={() => handleValidation(report._id, "upvote")}
                      className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {report.validationVotes?.upvotes || 0}
                      </span>
                    </button>

                    <button
                      onClick={() => handleValidation(report._id, "downvote")}
                      className="flex items-center text-red-600 hover:text-red-700 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {report.validationVotes?.downvotes || 0}
                      </span>
                    </button>

                    <div className="flex items-center text-gray-500">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {report.comments?.length || 0} comments
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500">
                      By: {report.reportedBy?.name || "Anonymous"}
                    </span>

                    <Link
                      to={`/reports/${report._id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View Details
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {reports.length >= 20 && (
        <div className="text-center pt-6">
          <button
            onClick={() => {
              /* Implement pagination */
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Load More Reports
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewReports;
