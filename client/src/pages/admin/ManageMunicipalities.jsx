import React, { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axiosInstance from "../../services/axiosConfig";
import toast from "react-hot-toast";

const ManageMunicipalities = () => {
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    state: "",
    search: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMunicipality, setNewMunicipality] = useState({
    name: "",
    email: "",
    phone: "",
    district: "",
    state: "",
    address: "",
  });

  useEffect(() => {
    fetchMunicipalities();
  }, [filters]);

  const fetchMunicipalities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        role: "municipality", // Filter for municipality users
      });
      const response = await axiosInstance.get(`/admin/users?${params}`);
      setMunicipalities(response.data.data?.users || []);
    } catch (error) {
      console.error("Error fetching municipalities:", error);
      toast.error("Failed to load municipalities");
    } finally {
      setLoading(false);
    }
  };

  const approveMunicipality = async (municipalityId) => {
    try {
      await axiosInstance.put(`/admin/users/${municipalityId}`, {
        status: "approved",
        isVerified: true,
      });
      toast.success("Municipality approved successfully");
      fetchMunicipalities();
    } catch (error) {
      console.error("Error approving municipality:", error);
      toast.error("Failed to approve municipality");
    }
  };

  const rejectMunicipality = async (municipalityId) => {
    try {
      await axiosInstance.put(`/admin/users/${municipalityId}`, {
        status: "rejected",
        isVerified: false,
      });
      toast.success("Municipality rejected");
      fetchMunicipalities();
    } catch (error) {
      console.error("Error rejecting municipality:", error);
      toast.error("Failed to reject municipality");
    }
  };

  const addMunicipality = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/auth/register", {
        ...newMunicipality,
        role: "municipality",
        password: "temp123", // Temporary password - should be changed on first login
        location: {
          district: newMunicipality.district,
          state: newMunicipality.state,
          address: newMunicipality.address,
          coordinates: [0, 0], // Default coordinates
        },
      });
      toast.success("Municipality added successfully");
      setShowAddForm(false);
      setNewMunicipality({
        name: "",
        email: "",
        phone: "",
        district: "",
        state: "",
        address: "",
      });
      fetchMunicipalities();
    } catch (error) {
      console.error("Error adding municipality:", error);
      toast.error("Failed to add municipality");
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
          <Building2 className="h-6 w-6" />
          Municipality Management
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Municipality
        </button>
      </div>

      {/* Add Municipality Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New Municipality</h2>
            <form onSubmit={addMunicipality} className="space-y-4">
              <input
                type="text"
                placeholder="Municipality Name"
                required
                value={newMunicipality.name}
                onChange={(e) =>
                  setNewMunicipality({
                    ...newMunicipality,
                    name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={newMunicipality.email}
                onChange={(e) =>
                  setNewMunicipality({
                    ...newMunicipality,
                    email: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                required
                value={newMunicipality.phone}
                onChange={(e) =>
                  setNewMunicipality({
                    ...newMunicipality,
                    phone: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="District"
                required
                value={newMunicipality.district}
                onChange={(e) =>
                  setNewMunicipality({
                    ...newMunicipality,
                    district: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="State"
                required
                value={newMunicipality.state}
                onChange={(e) =>
                  setNewMunicipality({
                    ...newMunicipality,
                    state: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Address"
                value={newMunicipality.address}
                onChange={(e) =>
                  setNewMunicipality({
                    ...newMunicipality,
                    address: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Municipality
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search municipalities..."
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
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="text"
            placeholder="Filter by state..."
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          />
          <button
            onClick={() => setFilters({ status: "", state: "", search: "" })}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Municipalities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {municipalities.map((municipality) => (
          <div
            key={municipality._id}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-lg">{municipality.name}</h3>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  municipality.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : municipality.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {municipality.status || "pending"}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                {municipality.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                {municipality.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {municipality.location?.district || municipality.district},{" "}
                {municipality.location?.state || municipality.state}
              </div>
              {municipality.createdAt && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Registered:{" "}
                  {new Date(municipality.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>

            {(municipality.status === "pending" || !municipality.status) && (
              <div className="flex gap-2">
                <button
                  onClick={() => approveMunicipality(municipality._id)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => rejectMunicipality(municipality._id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </div>
            )}

            {municipality.status === "approved" && (
              <div className="text-center text-sm text-green-600 font-medium">
                ✓ Approved Municipality
              </div>
            )}

            {municipality.status === "rejected" && (
              <div className="text-center">
                <button
                  onClick={() => approveMunicipality(municipality._id)}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Reconsider Approval
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {municipalities.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No municipalities found
          </h3>
          <p className="text-gray-500">
            No municipalities match your current filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageMunicipalities;
