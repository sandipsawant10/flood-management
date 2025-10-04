import React, { useState } from "react";

console.log("[DEBUG] ViewReports component is rendering");
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Calendar,
  Users,
  Droplets,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  ExternalLink,
  Loader2,
  Search,
  Filter,
  SortDesc,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { floodReportService } from "../../services/floodReportService";
import toast from "react-hot-toast";

const ViewReports = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // React Query v5 object syntax
  const {
    data: reportsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "flood-reports",
      searchTerm,
      selectedState,
      selectedSeverity,
      selectedStatus,
      sortBy,
    ],
    queryFn: async () => {
      const params = {
        search: searchTerm || undefined,
        state: selectedState || undefined,
        severity: selectedSeverity || undefined,
        status: selectedStatus || undefined,
        sortBy,
        limit: 20,
      };
      console.log("[DEBUG] Fetching reports with params:", params);
      const result = await floodReportService.getReports(params);
      console.log("[DEBUG] API result:", result);
      return result;
    },
  });

  const reports = reportsData?.reports || [];

  const handleValidation = async (reportId, vote) => {
    try {
      await floodReportService.voteOnReport(reportId, vote);
      toast.success(
        `Report ${vote === "upvote" ? "upvoted" : "downvoted"} successfully`
      );
      refetch();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to validate report"
      );
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
        <div className="flex items-center mb-4">
          <Droplets className="w-8 h-8 mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Flood Reports</h1>
            <p className="text-blue-100 mt-1">
              View and validate community flood reports
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search reports by location or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button (Mobile) */}
          <div className="md:hidden">
            <button
              onClick={() =>
                document.getElementById("filters").classList.toggle("hidden")
              }
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center">
            <SortDesc className="w-5 h-5 text-gray-500 mr-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="severity_high">Highest Severity</option>
              <option value="severity_low">Lowest Severity</option>
              <option value="most_validated">Most Validated</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div id="filters" className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* State Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All States</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Severity
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">
              Error loading reports: {error.message}
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reports found
            </h3>
            <p className="text-gray-600 mb-6">
              No flood reports match your current filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedState("");
                setSelectedSeverity("");
                setSelectedStatus("");
                setSortBy("newest");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => {
              console.log("[DEBUG] Report object:", report);
              return (
                <div
                  key={report._id || report.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Report Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                          report.severity
                        )}`}
                      >
                        {report.severity.charAt(0).toUpperCase() +
                          report.severity.slice(1)}
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(report.status)}
                        <span className="text-xs ml-1 capitalize">
                          {report.status}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1 truncate">
                      {report.location.district}, {report.location.state}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">
                        {report.location.address}
                      </span>
                    </div>
                  </div>

                  {/* Report Content */}
                  <div className="p-4">
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {report.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{report.validations || 0} validations</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleValidation(report._id || report.id, "upvote")
                          }
                          className="flex items-center px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100"
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          <span className="text-xs">Confirm</span>
                        </button>
                        <button
                          onClick={() =>
                            handleValidation(
                              report._id || report.id,
                              "downvote"
                            )
                          }
                          className="flex items-center px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100"
                        >
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          <span className="text-xs">Dispute</span>
                        </button>
                      </div>
                      <Link
                        to={`/reports/${report._id || report.id}`}
                        className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        <span className="text-xs">View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReports;
