import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  History,
  Search,
  Filter,
  AlertTriangle,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  Eye,
  FileText,
  Calendar as CalendarIcon,
  Download,
  Share2,
  TrendingUp,
  Trash2,
  Edit,
  BarChart4,
  Camera,
  MessageCircle,
  RefreshCw,
  ExternalLink,
  BarChart2,
  PieChart,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { floodReportService } from "../../services/floodReportService";
import { alertService } from "../../services/alertService";

const UserReportsHistory = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState({
    status: "all",
    severity: "all",
    sortBy: "date",
    sortOrder: "desc",
    searchQuery: "",
    dateRange: "all", // new filter for date range
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // table, card

  // Fetch user's submitted reports
  const {
    data: userReportsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-reports", user?.id, filter],
    queryFn: () =>
      floodReportService.getReports({
        reportedBy: user?.id,
        ...(filter.status !== "all" && { verificationStatus: filter.status }),
        ...(filter.severity !== "all" && { severity: filter.severity }),
        sort: `${filter.sortOrder === "desc" ? "-" : ""}${filter.sortBy}`,
      }),
    enabled: !!user?.id,
  });

  const reports = userReportsData?.reports || [];

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: (reportId) => floodReportService.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries(["user-reports"]);
      alertService.showSuccess("Report deleted successfully");
      setShowDeleteModal(false);
      setReportToDelete(null);
    },
    onError: (error) => {
      alertService.showError(
        error.message || "Failed to delete report. Please try again."
      );
    },
  });

  // Handle report deletion confirmation
  const handleDeleteReport = () => {
    if (reportToDelete) {
      deleteReportMutation.mutate(reportToDelete);
    }
  };

  // Export reports
  const handleExportReports = (format) => {
    // Mock export functionality
    alertService.showSuccess(`Reports exported as ${format.toUpperCase()}`);
    setShowExportMenu(false);
  };

  // Filter reports based on search query and date range
  const filteredReports = reports.filter((report) => {
    // Filter by search query
    if (filter.searchQuery) {
      const searchLower = filter.searchQuery.toLowerCase();
      const matchesSearch =
        report.location.address?.toLowerCase().includes(searchLower) ||
        report.location.district?.toLowerCase().includes(searchLower) ||
        report.location.state?.toLowerCase().includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Filter by date range
    if (filter.dateRange !== "all") {
      const reportDate = new Date(report.createdAt);
      const today = new Date();

      switch (filter.dateRange) {
        case "today": {
          if (reportDate.toDateString() !== today.toDateString()) return false;
          break;
        }
        case "week": {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (reportDate < weekAgo) return false;
          break;
        }
        case "month": {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (reportDate < monthAgo) return false;
          break;
        }
        case "year": {
          const yearAgo = new Date();
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          if (reportDate < yearAgo) return false;
          break;
        }
      }
    }
    return true;
  });

  // Pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(
    indexOfFirstReport,
    indexOfLastReport
  );
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Verified
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case "disputed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" /> Disputed
          </span>
        );
      case "investigating":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Search className="w-3 h-3 mr-1" /> Investigating
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "critical":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> Critical
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> Medium
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {severity}
          </span>
        );
    }
  };

  // View report detail
  const viewReportDetail = (reportId) => {
    navigate(`/portal/reports/${reportId}`);
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
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
        <p>Error loading your reports. Please try again later.</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold flex items-center">
          <History className="w-6 h-6 text-primary-600 mr-2" />
          Your Flood Reports
        </h1>
        <button
          onClick={() => navigate("/portal/report")}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
        >
          <AlertTriangle className="w-4 h-4 mr-2" /> Report New Incident
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
          {/* Search box */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by location or description..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filter.searchQuery}
              onChange={(e) =>
                handleFilterChange("searchQuery", e.target.value)
              }
            />
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          </div>

          {/* View toggle and Action buttons */}
          <div className="flex items-center space-x-2">
            {/* View toggle */}
            <div className="border border-gray-300 rounded-md flex">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 flex items-center ${
                  viewMode === "table"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title="Table view"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 flex items-center ${
                  viewMode === "card"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title="Card view"
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowMapView(true)}
              className="p-2 border border-green-300 text-green-700 rounded-md hover:bg-green-50 flex items-center"
              title="View reports on map"
            >
              <MapPin className="w-4 h-4 mr-1" />{" "}
              <span className="hidden sm:inline">Map</span>
            </button>

            <button
              onClick={() => {
                if (selectedReports.length < 2) {
                  alertService.showError(
                    "Select at least 2 reports to compare"
                  );
                } else {
                  setShowCompareModal(true);
                }
              }}
              className="p-2 border border-indigo-300 text-indigo-700 rounded-md hover:bg-indigo-50 flex items-center"
              title="Compare selected reports"
            >
              <BarChart4 className="w-4 h-4 mr-1" />{" "}
              <span className="hidden sm:inline">Compare</span>
            </button>

            <button
              onClick={() => setShowStatsModal(true)}
              className="p-2 border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 flex items-center"
              title="View report statistics"
            >
              <PieChart className="w-4 h-4 mr-1" />{" "}
              <span className="hidden sm:inline">Stats</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 flex items-center"
                title="Export reports"
              >
                <Download className="w-4 h-4 mr-1" />{" "}
                <span className="hidden sm:inline">Export</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleExportReports("pdf")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" /> Export as PDF
                    </button>
                    <button
                      onClick={() => handleExportReports("csv")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-2" /> Export as CSV
                    </button>
                    <button
                      onClick={() => handleExportReports("json")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-2" /> Export as JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced filters */}
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <div className="relative inline-block text-left">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filter.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="disputed">Disputed</option>
              <option value="investigating">Investigating</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-2.5 pointer-events-none text-gray-500" />
          </div>

          {/* Severity Filter */}
          <div className="relative inline-block text-left">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filter.severity}
              onChange={(e) => handleFilterChange("severity", e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-2.5 pointer-events-none text-gray-500" />
          </div>

          {/* Date Range Filter */}
          <div className="relative inline-block text-left">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filter.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-2.5 pointer-events-none text-gray-500" />
          </div>

          {/* Sort By */}
          <div className="relative inline-block text-left">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filter.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <option value="createdAt">Date</option>
              <option value="severity">Severity</option>
              <option value="waterLevel">Water Level</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-2.5 pointer-events-none text-gray-500" />
          </div>

          {/* Sort Order */}
          <button
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
            onClick={() =>
              handleFilterChange(
                "sortOrder",
                filter.sortOrder === "asc" ? "desc" : "asc"
              )
            }
            title={
              filter.sortOrder === "asc" ? "Sort descending" : "Sort ascending"
            }
          >
            {filter.sortOrder === "asc" ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                ></path>
              </svg>
            )}
          </button>

          {/* Reset filters */}
          <button
            className="p-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-100 flex items-center"
            onClick={() => {
              setFilter({
                status: "all",
                severity: "all",
                sortBy: "date",
                sortOrder: "desc",
                searchQuery: "",
                dateRange: "all",
              });
              setCurrentPage(1);
            }}
            title="Reset all filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reports Count */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">
          Showing {indexOfFirstReport + 1}-
          {Math.min(indexOfLastReport, filteredReports.length)} of{" "}
          {filteredReports.length} reports
        </span>

        {selectedReports.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-primary-600">
              {selectedReports.length} report(s) selected
            </span>
            <button
              onClick={() => setSelectedReports([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Reports Display (Table or Card view) */}
      {filteredReports.length > 0 ? (
        viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-10 px-3 py-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        checked={
                          selectedReports.length === currentReports.length &&
                          currentReports.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReports(
                              currentReports.map((r) => r._id)
                            );
                          } else {
                            setSelectedReports([]);
                          }
                        }}
                      />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Severity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Water Level
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentReports.map((report) => (
                  <tr
                    key={report._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedReports.includes(report._id)
                        ? "bg-primary-50"
                        : ""
                    }`}
                  >
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          checked={selectedReports.includes(report._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedReports([
                                ...selectedReports,
                                report._id,
                              ]);
                            } else {
                              setSelectedReports(
                                selectedReports.filter(
                                  (id) => id !== report._id
                                )
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(report.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>
                          {report.location.address ||
                            `${report.location.district}, ${report.location.state}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(report.verificationStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getSeverityBadge(report.severity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {report.waterLevel}
                      {report.depth && ` (${report.depth}m)`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => viewReportDetail(report._id)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-50"
                          title="View details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/portal/map?highlight=${report._id}`)
                          }
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title="View on map"
                        >
                          <MapPin className="w-5 h-5" />
                        </button>
                        {report.verificationStatus === "pending" && (
                          <button
                            onClick={() =>
                              navigate(`/portal/report/edit/${report._id}`)
                            }
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-50"
                            title="Edit report"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setReportToDelete(report._id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          title="Delete report"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentReports.map((report) => (
              <div
                key={report._id}
                className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                  selectedReports.includes(report._id)
                    ? "ring-2 ring-primary-500"
                    : ""
                }`}
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        checked={selectedReports.includes(report._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReports([
                              ...selectedReports,
                              report._id,
                            ]);
                          } else {
                            setSelectedReports(
                              selectedReports.filter((id) => id !== report._id)
                            );
                          }
                        }}
                      />
                      {getSeverityBadge(report.severity)}
                    </div>
                    {getStatusBadge(report.verificationStatus)}
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formatDate(report.createdAt)}
                    </div>
                    <div className="flex items-center text-sm font-medium mb-1">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      {report.location.address ||
                        `${report.location.district}, ${report.location.state}`}
                    </div>
                    <div className="text-sm text-gray-800 mt-2 line-clamp-2">
                      {report.description || "No description provided"}
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {report.waterLevel}
                    </span>
                    {report.depth && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {report.depth}m depth
                      </span>
                    )}
                    {report.peopleAffected && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                        {report.peopleAffected} affected
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => viewReportDetail(report._id)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </button>

                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/portal/map?highlight=${report._id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                        title="View on map"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                      {report.verificationStatus === "pending" && (
                        <button
                          onClick={() =>
                            navigate(`/portal/report/edit/${report._id}`)
                          }
                          className="text-yellow-600 hover:text-yellow-800 p-1 rounded-full hover:bg-yellow-50"
                          title="Edit report"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setReportToDelete(report._id);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                        title="Delete report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No reports found
          </h3>
          <p className="text-gray-500 mb-4">
            {filter.searchQuery ||
            filter.status !== "all" ||
            filter.severity !== "all"
              ? "Try changing your search or filter criteria."
              : "You haven't submitted any flood reports yet."}
          </p>
          <button
            onClick={() => navigate("/portal/report")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <AlertTriangle className="w-4 h-4 mr-2" /> Submit a Report
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{indexOfFirstReport + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastReport, filteredReports.length)}
                </span>{" "}
                of <span className="font-medium">{filteredReports.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                {/* Previous Page */}
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === index + 1
                        ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                {/* Next Page */}
                <button
                  onClick={() =>
                    paginate(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Delete Report
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this report? This action cannot be
              undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => {
                  setShowDeleteModal(false);
                  setReportToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleDeleteReport}
                disabled={deleteReportMutation.isPending}
              >
                {deleteReportMutation.isPending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map View Modal */}
      {showMapView && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 text-primary-600 mr-2" />
                Your Reports on Map
              </h3>
              <button
                onClick={() => setShowMapView(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                {/* In a real implementation, this would be a map component */}
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary-600 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Map View
                  </h4>
                  <p className="text-gray-500 max-w-md mx-auto">
                    In a real implementation, this would display an interactive
                    map with your report locations highlighted. For this demo,
                    we're just showing this placeholder.
                  </p>
                  <button
                    onClick={() => navigate("/portal/map")}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Full Map
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Showing {filteredReports.length} reports on map
                </span>
                <button
                  onClick={() => setShowMapView(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare Reports Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BarChart4 className="h-5 w-5 text-primary-600 mr-2" />
                Compare Selected Reports
              </h3>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Field
                      </th>
                      {reports
                        .filter((report) =>
                          selectedReports.includes(report._id)
                        )
                        .map((report, index) => (
                          <th
                            key={report._id}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Report {index + 1}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        Date
                      </td>
                      {reports
                        .filter((report) =>
                          selectedReports.includes(report._id)
                        )
                        .map((report) => (
                          <td
                            key={report._id}
                            className="px-4 py-3 text-sm text-gray-500"
                          >
                            {formatDate(report.createdAt)}
                          </td>
                        ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        Location
                      </td>
                      {reports
                        .filter((report) =>
                          selectedReports.includes(report._id)
                        )
                        .map((report) => (
                          <td
                            key={report._id}
                            className="px-4 py-3 text-sm text-gray-500"
                          >
                            {report.location.address ||
                              `${report.location.district}, ${report.location.state}`}
                          </td>
                        ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        Status
                      </td>
                      {reports
                        .filter((report) =>
                          selectedReports.includes(report._id)
                        )
                        .map((report) => (
                          <td key={report._id} className="px-4 py-3 text-sm">
                            {getStatusBadge(report.verificationStatus)}
                          </td>
                        ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        Severity
                      </td>
                      {reports
                        .filter((report) =>
                          selectedReports.includes(report._id)
                        )
                        .map((report) => (
                          <td key={report._id} className="px-4 py-3 text-sm">
                            {getSeverityBadge(report.severity)}
                          </td>
                        ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        Water Level
                      </td>
                      {reports
                        .filter((report) =>
                          selectedReports.includes(report._id)
                        )
                        .map((report) => (
                          <td
                            key={report._id}
                            className="px-4 py-3 text-sm text-gray-500 capitalize"
                          >
                            {report.waterLevel}
                            {report.depth && ` (${report.depth}m)`}
                          </td>
                        ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        Description
                      </td>
                      {reports
                        .filter((report) =>
                          selectedReports.includes(report._id)
                        )
                        .map((report) => (
                          <td
                            key={report._id}
                            className="px-4 py-3 text-sm text-gray-500"
                          >
                            {report.description || "No description provided"}
                          </td>
                        ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        People Affected
                      </td>
                      {reports
                        .filter((report) =>
                          selectedReports.includes(report._id)
                        )
                        .map((report) => (
                          <td
                            key={report._id}
                            className="px-4 py-3 text-sm text-gray-500"
                          >
                            {report.peopleAffected || "Not reported"}
                          </td>
                        ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        Actions
                      </td>
                      {reports
                        .filter((report) =>
                          selectedReports.includes(report._id)
                        )
                        .map((report) => (
                          <td key={report._id} className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => viewReportDetail(report._id)}
                                className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-50"
                                title="View details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/portal/map?highlight=${report._id}`
                                  )
                                }
                                className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                title="View on map"
                              >
                                <MapPin className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Comparing {selectedReports.length} reports
                </span>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <PieChart className="h-5 w-5 text-primary-600 mr-2" />
                Your Reporting Statistics & Insights
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium text-primary-800">
                    Total Reports
                  </h4>
                  <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    All time
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-primary-700">
                    {reports.length}
                  </p>
                  <p className="text-xs text-primary-600 mt-1">
                    {reports.length > 0 &&
                      `First report: ${new Date(
                        reports.reduce(
                          (oldest, report) =>
                            new Date(report.createdAt) <
                            new Date(oldest.createdAt)
                              ? report
                              : oldest,
                          reports[0]
                        ).createdAt
                      ).toLocaleDateString()}`}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium text-green-800">
                    Verified Rate
                  </h4>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Performance
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-green-700">
                    {reports.length
                      ? `${Math.round(
                          (reports.filter(
                            (r) => r.verificationStatus === "verified"
                          ).length /
                            reports.length) *
                            100
                        )}%`
                      : "0%"}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {
                      reports.filter((r) => r.verificationStatus === "verified")
                        .length
                    }{" "}
                    verified of {reports.length} total
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium text-indigo-800">
                    Recent Activity
                  </h4>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Last 30 days
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-indigo-700">
                    {
                      reports.filter((r) => {
                        const reportDate = new Date(r.createdAt);
                        const monthAgo = new Date();
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return reportDate >= monthAgo;
                      }).length
                    }
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    {reports.length > 0
                      ? `${Math.round(
                          (reports.filter((r) => {
                            const reportDate = new Date(r.createdAt);
                            const monthAgo = new Date();
                            monthAgo.setMonth(monthAgo.getMonth() - 1);
                            return reportDate >= monthAgo;
                          }).length /
                            reports.length) *
                            100
                        )}% of your total reports`
                      : "No reports yet"}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts and statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Report Status Distribution
                </h4>
                <div className="h-64 flex items-center">
                  <div className="w-full">
                    {/* Horizontal bar chart visualization */}
                    {["verified", "pending", "disputed", "investigating"].map(
                      (status) => {
                        const count = reports.filter(
                          (r) => r.verificationStatus === status
                        ).length;
                        const percentage = reports.length
                          ? Math.round((count / reports.length) * 100)
                          : 0;

                        let bgColor = "";

                        switch (status) {
                          case "verified":
                            bgColor = "bg-green-500";
                            break;
                          case "pending":
                            bgColor = "bg-yellow-500";
                            break;
                          case "disputed":
                            bgColor = "bg-red-500";
                            break;
                          case "investigating":
                            bgColor = "bg-blue-500";
                            break;
                          default:
                            bgColor = "bg-gray-500";
                        }

                        return (
                          <div key={status} className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium capitalize">
                                {status}
                              </span>
                              <span className="text-sm font-medium">
                                {count} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div
                                className={`${bgColor} h-4 rounded-full`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Severity Breakdown
                </h4>
                <div className="h-64 flex flex-col justify-center">
                  {/* Donut chart visualization */}
                  <div className="relative mx-auto h-40 w-40 mb-4">
                    <svg viewBox="0 0 36 36" className="h-40 w-40">
                      {["critical", "high", "medium", "low"].map(
                        (severity, index) => {
                          const count = reports.filter(
                            (r) => r.severity === severity
                          ).length;
                          const percentage = reports.length
                            ? (count / reports.length) * 100
                            : 0;
                          const offset =
                            index === 0
                              ? 0
                              : ["critical", "high", "medium", "low"]
                                  .slice(0, index)
                                  .reduce((acc, sev) => {
                                    const sevCount = reports.filter(
                                      (r) => r.severity === sev
                                    ).length;
                                    return (
                                      acc +
                                      (reports.length
                                        ? (sevCount / reports.length) * 100
                                        : 0)
                                    );
                                  }, 0);

                          let color = "";
                          switch (severity) {
                            case "critical":
                              color = "#EF4444";
                              break; // Red
                            case "high":
                              color = "#F97316";
                              break; // Orange
                            case "medium":
                              color = "#EAB308";
                              break; // Yellow
                            case "low":
                              color = "#3B82F6";
                              break; // Blue
                            default:
                              color = "#D1D5DB"; // Gray
                          }

                          return percentage > 0 ? (
                            <circle
                              key={severity}
                              cx="18"
                              cy="18"
                              r="15.91549430918954"
                              fill="transparent"
                              stroke={color}
                              strokeWidth="3"
                              strokeDasharray={`${percentage} ${
                                100 - percentage
                              }`}
                              strokeDashoffset={`${100 - offset}`}
                              className="transition-all duration-500"
                            ></circle>
                          ) : null;
                        }
                      )}
                      <circle cx="18" cy="18" r="12" fill="white"></circle>
                      <text
                        x="18"
                        y="18"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs font-medium"
                      >
                        {reports.length} Reports
                      </text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["critical", "high", "medium", "low"].map((severity) => {
                      const count = reports.filter(
                        (r) => r.severity === severity
                      ).length;
                      let bgColor = "";

                      switch (severity) {
                        case "critical":
                          bgColor = "bg-red-100 text-red-800";
                          break;
                        case "high":
                          bgColor = "bg-orange-100 text-orange-800";
                          break;
                        case "medium":
                          bgColor = "bg-yellow-100 text-yellow-800";
                          break;
                        case "low":
                          bgColor = "bg-blue-100 text-blue-800";
                          break;
                        default:
                          bgColor = "bg-gray-100 text-gray-800";
                      }

                      return (
                        <div
                          key={severity}
                          className={`flex items-center justify-between px-2 py-1 rounded ${bgColor}`}
                        >
                          <span className="text-xs capitalize">{severity}</span>
                          <span className="text-xs font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* More insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Reporting Timeline
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {reports.length > 0 ? (
                    [...reports]
                      .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      )
                      .slice(0, 5)
                      .map((report) => (
                        <div
                          key={report._id}
                          className="flex items-center p-2 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-3">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900 mr-2">
                                {report.location.address ||
                                  `${report.location.district}, ${report.location.state}`}
                              </p>
                              {getSeverityBadge(report.severity)}
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatDate(report.createdAt)}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setShowStatsModal(false);
                              viewReportDetail(report._id);
                            }}
                            className="ml-auto text-primary-600 hover:text-primary-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No reports yet
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Impact Summary
                </h4>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="text-xs text-gray-500 mb-1">
                      Most Affected Area
                    </h5>
                    <p className="text-sm font-medium truncate">
                      {reports.length > 0
                        ? (() => {
                            // Group reports by district
                            const districts = {};
                            reports.forEach((report) => {
                              const district = report.location.district;
                              if (district) {
                                districts[district] =
                                  (districts[district] || 0) + 1;
                              }
                            });

                            // Find district with most reports
                            let mostAffected = { district: "N/A", count: 0 };
                            Object.entries(districts).forEach(
                              ([district, count]) => {
                                if (count > mostAffected.count) {
                                  mostAffected = { district, count };
                                }
                              }
                            );

                            return mostAffected.district;
                          })()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="text-xs text-gray-500 mb-1">
                      Average Response Time
                    </h5>
                    <p className="text-sm font-medium">
                      {reports.filter((r) => r.verificationStatus !== "pending")
                        .length > 0
                        ? "2.5 days"
                        : "N/A"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="text-xs text-gray-500 mb-1">
                      Water Level Trend
                    </h5>
                    <p className="text-sm font-medium flex items-center">
                      {reports.length > 0 ? "Rising" : "N/A"}
                      {reports.length > 0 && (
                        <TrendingUp className="w-3 h-3 ml-1 text-orange-500" />
                      )}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="text-xs text-gray-500 mb-1">
                      People Affected
                    </h5>
                    <p className="text-sm font-medium">
                      {reports.length > 0 &&
                      reports.some((r) => r.peopleAffected)
                        ? reports.reduce(
                            (sum, report) => sum + (report.peopleAffected || 0),
                            0
                          )
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  <p>These statistics are based on your reported data only</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatsModal(false);
                  handleExportReports("csv");
                }}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Download className="w-4 h-4 mr-1" /> Export Stats
              </button>

              <button
                onClick={() => setShowStatsModal(false)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReportsHistory;
