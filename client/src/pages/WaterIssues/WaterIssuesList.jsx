import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Droplet,
  Filter,
  Search,
  AlertTriangle,
  Map,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Loader2,
  Construction,
  RefreshCw,
  CalendarDays,
  MapPin,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { waterIssueService } from "../../services/waterIssueService";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import { useAuthStore } from "../../store/authStore";

const WaterIssuesList = () => {
  const { user } = useAuthStore();

  // State for issues and filtering
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    district: "",
    state: "",
    issueType: "",
    severity: "",
    status: "",
    verificationStatus: "",
    startDate: "",
    endDate: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [loadingVote, setLoadingVote] = useState(null);

  // Fetch water issues
  const fetchWaterIssues = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page,
        limit: pagination.limit,
      };

      const response = await waterIssueService.getIssues(params);
      setIssues(response.data.issues);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Error fetching water issues:", err);
      setError("Failed to load water issues. Please try again later.");
      toast.error("Failed to load water issues");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWaterIssues(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault();
    fetchWaterIssues(1);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      district: "",
      state: "",
      issueType: "",
      severity: "",
      status: "",
      verificationStatus: "",
      startDate: "",
      endDate: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      fetchWaterIssues(newPage);
    }
  };

  // Handle vote
  const handleVote = async (issueId, voteType) => {
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }

    try {
      setLoadingVote(issueId);
      const response = await waterIssueService.voteOnIssue(issueId, voteType);

      // Update vote count in the local state
      setIssues(
        issues.map((issue) =>
          issue._id === issueId
            ? {
                ...issue,
                communityVotes: {
                  upvotes: response.data.upvotes,
                  downvotes: response.data.downvotes,
                  voters: [...(issue.communityVotes?.voters || [])],
                },
              }
            : issue
        )
      );

      toast.success(response.message);
    } catch (err) {
      console.error("Error voting:", err);
      toast.error(
        err.response?.data?.message || "Failed to register your vote"
      );
    } finally {
      setLoadingVote(null);
    }
  };

  // Helper to render issue severity badge
  const renderSeverityBadge = (severity) => {
    const badgeClasses = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          badgeClasses[severity] || "bg-gray-100 text-gray-800"
        }`}
      >
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  // Helper to render issue status badge
  const renderStatusBadge = (status) => {
    const statusClasses = {
      reported: "bg-blue-100 text-blue-800",
      "under-investigation": "bg-purple-100 text-purple-800",
      acknowledged: "bg-indigo-100 text-indigo-800",
      "in-progress": "bg-amber-100 text-amber-800",
      scheduled: "bg-cyan-100 text-cyan-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };

    const statusDisplay = {
      reported: "Reported",
      "under-investigation": "Under Investigation",
      acknowledged: "Acknowledged",
      "in-progress": "In Progress",
      scheduled: "Scheduled",
      resolved: "Resolved",
      closed: "Closed",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {statusDisplay[status] || status}
      </span>
    );
  };

  // Helper to render issue type icon
  const renderIssueTypeIcon = (issueType) => {
    switch (issueType) {
      case "supply-interruption":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "low-pressure":
        return <Droplet className="w-5 h-5 text-amber-500" />;
      case "water-quality":
        return <AlertTriangle className="w-5 h-5 text-purple-500" />;
      case "contamination":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "leakage":
        return <Droplet className="w-5 h-5 text-blue-500" />;
      case "infrastructure":
        return <Construction className="w-5 h-5 text-gray-500" />;
      default:
        return <Droplet className="w-5 h-5 text-cyan-500" />;
    }
  };

  // Helper to format issue type for display
  const formatIssueType = (issueType) => {
    const types = {
      "supply-interruption": "Supply Interruption",
      "low-pressure": "Low Pressure",
      "water-quality": "Water Quality",
      contamination: "Contamination",
      leakage: "Water Leakage",
      infrastructure: "Infrastructure Problem",
      other: "Other Issue",
    };

    return types[issueType] || issueType;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Droplet className="w-6 h-6 mr-2 text-cyan-600" />
            Water Issues
          </h1>
          <p className="text-gray-600 mt-1">
            Community-reported water supply and quality issues
          </p>
        </div>
        <div className="mt-4 sm:mt-0 space-x-3 flex">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <Link
            to="/water-issues/report"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Report Issue
          </Link>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Filter Water Issues
          </h2>
          <form
            onSubmit={applyFilters}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* District */}
            <div>
              <label
                htmlFor="district"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                District
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={filters.district}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter district"
              />
            </div>

            {/* State */}
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={filters.state}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter state"
              />
            </div>

            {/* Issue Type */}
            <div>
              <label
                htmlFor="issueType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Issue Type
              </label>
              <select
                id="issueType"
                name="issueType"
                value={filters.issueType}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">All Types</option>
                <option value="supply-interruption">Supply Interruption</option>
                <option value="low-pressure">Low Pressure</option>
                <option value="water-quality">Water Quality</option>
                <option value="contamination">Contamination</option>
                <option value="leakage">Water Leakage</option>
                <option value="infrastructure">Infrastructure Problem</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <label
                htmlFor="severity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Severity
              </label>
              <select
                id="severity"
                name="severity"
                value={filters.severity}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="under-investigation">Under Investigation</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="in-progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Verification Status */}
            <div>
              <label
                htmlFor="verificationStatus"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Verification
              </label>
              <select
                id="verificationStatus"
                name="verificationStatus"
                value={filters.verificationStatus}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="disputed">Disputed</option>
                <option value="false">False</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                From Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                To Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            {/* Sort Options */}
            <div className="md:col-span-3 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="sortBy"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sort By
                </label>
                <select
                  id="sortBy"
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="createdAt">Date Reported</option>
                  <option value="severity">Severity</option>
                  <option value="urgencyLevel">Urgency</option>
                  <option value="communityVotes.upvotes">Most Upvoted</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="sortOrder"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sort Order
                </label>
                <select
                  id="sortOrder"
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="md:col-span-3 flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                Reset
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Water Issues List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading water issues...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Droplet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No water issues found
          </h3>
          <p className="text-gray-600 mb-6">
            No water issues match your current filter criteria. Try adjusting
            the filters or report a new issue.
          </p>
          <Link
            to="/water-issues/report"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Report a Water Issue
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
            <ul className="divide-y divide-gray-200">
              {issues.map((issue) => (
                <li key={issue._id}>
                  <Link
                    to={`/water-issues/${issue._id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {renderIssueTypeIcon(issue.issueType)}
                          <p className="text-sm font-medium text-cyan-700 truncate">
                            {formatIssueType(issue.issueType)}
                          </p>
                          {renderSeverityBadge(issue.severity)}
                          {renderStatusBadge(issue.status)}
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="text-sm text-gray-900 font-medium line-clamp-1">
                            {issue.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex items-center text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>
                              {issue.location.address
                                ? issue.location.address
                                : `${issue.location.district}, ${issue.location.state}`}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <div className="flex items-center">
                            <CalendarDays className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>
                              <time dateTime={issue.createdAt}>
                                {formatDistanceToNow(
                                  new Date(issue.createdAt),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </time>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Community votes */}
                      <div className="mt-2 flex items-center space-x-4">
                        <button
                          className="flex items-center text-sm text-gray-500 hover:text-cyan-600"
                          onClick={(e) => {
                            e.preventDefault();
                            handleVote(issue._id, "up");
                          }}
                          disabled={loadingVote === issue._id}
                        >
                          {loadingVote === issue._id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <ThumbsUp className="h-4 w-4 mr-1" />
                          )}
                          {issue.communityVotes?.upvotes || 0}
                        </button>
                        <button
                          className="flex items-center text-sm text-gray-500 hover:text-red-600"
                          onClick={(e) => {
                            e.preventDefault();
                            handleVote(issue._id, "down");
                          }}
                          disabled={loadingVote === issue._id}
                        >
                          {loadingVote === issue._id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 mr-1" />
                          )}
                          {issue.communityVotes?.downvotes || 0}
                        </button>

                        {issue.municipalityResponse?.respondedAt && (
                          <div className="flex items-center text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            <span>Municipality Responded</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-md">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pagination.page === i + 1
                            ? "z-10 bg-cyan-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WaterIssuesList;
