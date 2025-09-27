import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Activity,
  Plus,
} from "lucide-react";
import axiosInstance from "../../services/axiosConfig";
import toast from "react-hot-toast";

const ManageRescuers = () => {
  const [rescuers, setRescuers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rescuers");
  const [filters, setFilters] = useState({
    status: "",
    specialty: "",
    availability: "",
    search: "",
  });

  useEffect(() => {
    if (activeTab === "rescuers") {
      fetchRescuers();
    } else {
      fetchTeams();
    }
  }, [activeTab, filters]);

  const fetchRescuers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await axiosInstance.get(
        `/admin/rescuers/members?${params}`
      );
      setRescuers(response.data || []);
    } catch (error) {
      console.error("Error fetching rescuers:", error);
      toast.error("Failed to load rescuers");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/rescuers/teams");
      setTeams(response.data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load rescue teams");
    } finally {
      setLoading(false);
    }
  };

  const updateRescuerStatus = async (rescuerId, status) => {
    try {
      await axiosInstance.put(`/admin/rescuers/${rescuerId}/status`, {
        status,
      });
      toast.success("Rescuer status updated successfully");
      fetchRescuers();
    } catch (error) {
      console.error("Error updating rescuer status:", error);
      toast.error("Failed to update rescuer status");
    }
  };

  const updateTeamStatus = async (teamId, status) => {
    try {
      await axiosInstance.put(`/admin/rescuers/teams/${teamId}/status`, {
        status,
      });
      toast.success("Team status updated successfully");
      fetchTeams();
    } catch (error) {
      console.error("Error updating team status:", error);
      toast.error("Failed to update team status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Rescuer Management
        </h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Team
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("rescuers")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "rescuers"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Individual Rescuers
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "teams"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Rescue Teams
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          {activeTab === "rescuers" && (
            <select
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.availability}
              onChange={(e) =>
                setFilters({ ...filters, availability: e.target.value })
              }
            >
              <option value="">All Availability</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="off-duty">Off Duty</option>
            </select>
          )}
          <button
            onClick={() =>
              setFilters({
                status: "",
                specialty: "",
                availability: "",
                search: "",
              })
            }
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "rescuers" ? (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rescuer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rescuers.map((rescuer) => (
                  <tr key={rescuer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {rescuer.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {rescuer.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {rescuer.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rescuer.specialty || "General Rescue"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={rescuer.status || "active"}
                        onChange={(e) =>
                          updateRescuerStatus(rescuer._id, e.target.value)
                        }
                        className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rescuer.availability === "available"
                            ? "bg-green-100 text-green-800"
                            : rescuer.availability === "busy"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {rescuer.availability || "available"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {rescuer.location?.district || "N/A"},{" "}
                        {rescuer.location?.state || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        View Details
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team._id}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-lg">{team.name}</h3>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    team.status === "active"
                      ? "bg-green-100 text-green-800"
                      : team.status === "busy"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {team.status || "active"}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {team.members?.length || 0} members
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {team.location?.district || "N/A"},{" "}
                  {team.location?.state || "N/A"}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="h-4 w-4" />
                  Specialties:{" "}
                  {team.specialties?.join(", ") || "General Rescue"}
                </div>
                {team.lastDeployment && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Last deployed:{" "}
                    {new Date(team.lastDeployment).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  value={team.status || "active"}
                  onChange={(e) => updateTeamStatus(team._id, e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="busy">Busy</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  View Team
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {((activeTab === "rescuers" && rescuers.length === 0) ||
        (activeTab === "teams" && teams.length === 0)) && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeTab} found
          </h3>
          <p className="text-gray-500">
            No {activeTab} match your current filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageRescuers;
