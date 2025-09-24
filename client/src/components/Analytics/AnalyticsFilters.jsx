import React, { useState, useEffect } from "react";
import {
  CalendarRange,
  Filter,
  MapPin,
  AlertTriangle,
  User,
  Download,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

const AnalyticsFilters = ({
  onFilterChange,
  availableLocations = [],
  isLoading = false,
  defaultFilters = {},
}) => {
  // Default filter state
  const [filters, setFilters] = useState({
    timeRange: defaultFilters.timeRange || "7d",
    severity: defaultFilters.severity || [],
    locations: defaultFilters.locations || [],
    reportType: defaultFilters.reportType || "all",
    verificationStatus: defaultFilters.verificationStatus || "all",
    dateStart: defaultFilters.dateStart || "",
    dateEnd: defaultFilters.dateEnd || "",
    reportedBy: defaultFilters.reportedBy || "",
    ...defaultFilters,
  });

  // State for custom date range visibility
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  // State to track if filter panel is expanded (for mobile view)
  const [isExpanded, setIsExpanded] = useState(false);

  // Apply filters when they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    const updatedFilters = { ...filters, timeRange: range };

    // Reset custom date range if preset is selected
    if (range !== "custom") {
      updatedFilters.dateStart = "";
      updatedFilters.dateEnd = "";
      setShowCustomDateRange(false);
    } else {
      setShowCustomDateRange(true);
    }

    setFilters(updatedFilters);
  };

  // Handle severity filter change (multi-select)
  const handleSeverityChange = (severity) => {
    const newSeverities = filters.severity.includes(severity)
      ? filters.severity.filter((s) => s !== severity)
      : [...filters.severity, severity];

    setFilters({ ...filters, severity: newSeverities });
  };

  // Handle location filter change (multi-select)
  const handleLocationChange = (location) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter((l) => l !== location)
      : [...filters.locations, location];

    setFilters({ ...filters, locations: newLocations });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      timeRange: "7d",
      severity: [],
      locations: [],
      reportType: "all",
      verificationStatus: "all",
      dateStart: "",
      dateEnd: "",
      reportedBy: "",
    });
    setShowCustomDateRange(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Analytics Filters
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={resetFilters}
            className="text-sm text-gray-600 hover:text-red-600 flex items-center"
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-1" />
            Reset
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden text-blue-600"
          >
            {isExpanded ? "Hide" : "Show"} Filters
          </button>
        </div>
      </div>

      <div className={`space-y-4 ${isExpanded ? "block" : "hidden md:block"}`}>
        {/* Time Range Selector */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <CalendarRange className="w-4 h-4 mr-1" />
            Time Range
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTimeRangeChange("7d")}
              className={`px-3 py-1.5 text-xs rounded-full ${
                filters.timeRange === "7d"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => handleTimeRangeChange("30d")}
              className={`px-3 py-1.5 text-xs rounded-full ${
                filters.timeRange === "30d"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => handleTimeRangeChange("90d")}
              className={`px-3 py-1.5 text-xs rounded-full ${
                filters.timeRange === "90d"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => handleTimeRangeChange("1y")}
              className={`px-3 py-1.5 text-xs rounded-full ${
                filters.timeRange === "1y"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              1 Year
            </button>
            <button
              onClick={() => handleTimeRangeChange("custom")}
              className={`px-3 py-1.5 text-xs rounded-full ${
                filters.timeRange === "custom"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Custom Date Range */}
          {showCustomDateRange && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.dateStart}
                  onChange={(e) =>
                    setFilters({ ...filters, dateStart: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.dateEnd}
                  onChange={(e) =>
                    setFilters({ ...filters, dateEnd: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Severity Filter */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Severity
            </label>
            <div className="space-y-2">
              {["critical", "high", "medium", "low"].map((severity) => (
                <div key={severity} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`severity-${severity}`}
                    checked={filters.severity.includes(severity)}
                    onChange={() => handleSeverityChange(severity)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`severity-${severity}`}
                    className="ml-2 text-sm text-gray-700 capitalize"
                  >
                    {severity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Report Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={filters.reportType}
              onChange={(e) =>
                setFilters({ ...filters, reportType: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm"
            >
              <option value="all">All Reports</option>
              <option value="flood">Flood Reports</option>
              <option value="damage">Damage Reports</option>
              <option value="rescue">Rescue Requests</option>
              <option value="aid">Aid Requests</option>
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Status
            </label>
            <select
              value={filters.verificationStatus}
              onChange={(e) =>
                setFilters({ ...filters, verificationStatus: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Location Search */}
          <div className="md:col-span-2">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              Location
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search locations..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10 text-sm"
              />
              <Search className="h-5 w-5 text-gray-400 absolute right-3 top-2" />
            </div>
            {availableLocations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {availableLocations.map((location) => (
                  <button
                    key={location}
                    onClick={() => handleLocationChange(location)}
                    className={`px-2 py-1 text-xs rounded-full flex items-center ${
                      filters.locations.includes(location)
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {location}
                    {filters.locations.includes(location) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reporter Filter */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 mr-1" />
              Reported By
            </label>
            <input
              type="text"
              placeholder="User ID, name or role..."
              value={filters.reportedBy}
              onChange={(e) =>
                setFilters({ ...filters, reportedBy: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => onFilterChange(filters)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </>
            )}
          </button>
          <button
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md text-sm flex items-center hover:bg-gray-200"
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;
