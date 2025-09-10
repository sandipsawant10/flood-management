import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, AlertTriangle, MapPin, Clock } from 'lucide-react';

const FloodReportTable = () => {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  // Mock data - replace with actual API calls
  const { data: reports, isLoading } = useQuery({
    queryKey: ['floodReports', filter],
    queryFn: async () => {
      const response = await fetch(`/api/flood-reports?status=${filter === 'all' ? '' : filter}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  });

  const updateReportStatus = useMutation({
    mutationFn: async ({ reportId, status }) => {
      const response = await fetch(`/api/flood-reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update report status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['floodReports']);
    }
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        icon: Clock,
        class: 'bg-yellow-100 text-yellow-800'
      },
      verified: {
        icon: CheckCircle,
        class: 'bg-green-100 text-green-800'
      },
      rejected: {
        icon: XCircle,
        class: 'bg-red-100 text-red-800'
      }
    };

    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
        <badge.icon className="w-4 h-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const classes = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[severity]}`}>
        <AlertTriangle className="w-4 h-4 mr-1" />
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading reports...</div>;
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-4">
          {['all', 'pending', 'verified', 'rejected'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${filter === filterOption ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports?.map((report) => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    {report.location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getSeverityBadge(report.severity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(report.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.description ? report.description.substring(0, 70) + "..." : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.reporter}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(report.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateReportStatus.mutate({ reportId: report.id, status: 'verified' })}
                      className="text-green-600 hover:text-green-900"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => updateReportStatus.mutate({ reportId: report.id, status: 'rejected' })}
                      className="text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FloodReportTable;