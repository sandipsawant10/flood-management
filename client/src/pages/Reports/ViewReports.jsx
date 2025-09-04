import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, MapPin, Clock, Search, Filter } from "lucide-react";

const ViewReports = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const mockReports = [
    {
      id: "1",
      location: "Mumbai, Maharashtra",
      severity: "High",
      description: "Heavy flooding on Western Express Highway",
      time: "2 hours ago",
      votes: 15,
    },
    {
      id: "2",
      location: "Chennai, Tamil Nadu",
      severity: "Medium",
      description: "Waterlogging in residential areas",
      time: "4 hours ago",
      votes: 8,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flood Reports</h1>
          <p className="text-gray-600">
            Browse and validate community flood reports
          </p>
        </div>

        <Link
          to="/report-flood"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Report Flood
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports by location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.severity === "High"
                      ? "bg-red-100 text-red-800"
                      : report.severity === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {report.severity} Severity
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{report.location}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Clock className="w-4 h-4 mr-1" />
                <span>{report.time}</span>
              </div>

              <p className="text-gray-900 mb-3">{report.description}</p>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {report.votes} community votes
                </div>

                <Link
                  to={`/reports/${report.id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mockReports.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Reports Found
          </h3>
          <p className="text-gray-600 mb-4">
            No flood reports have been submitted yet.
          </p>
          <Link
            to="/report-flood"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Submit First Report
          </Link>
        </div>
      )}
    </div>
  );
};

export default ViewReports;
