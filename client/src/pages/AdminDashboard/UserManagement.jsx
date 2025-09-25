import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  UserPlus,
  RefreshCcw,
  Download,
  X,
} from "lucide-react";
import adminService from "../../services/adminService";

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Form state for new/edit user
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "citizen",
    municipality: "",
    status: "active",
  });

  // Mock data for municipalities
  const municipalities = [
    { id: 1, name: "North Municipality" },
    { id: 2, name: "South Municipality" },
    { id: 3, name: "East Municipality" },
    { id: 4, name: "West Municipality" },
    { id: 5, name: "Central Municipality" },
  ];

  // User roles
  const userRoles = [
    { value: "admin", label: "Admin", description: "Full system access" },
    {
      value: "municipal_admin",
      label: "Municipal Admin",
      description: "Municipality-level administration",
    },
    {
      value: "rescuer",
      label: "Rescue Team",
      description: "Emergency response personnel",
    },
    { value: "citizen", label: "Citizen", description: "Regular user" },
    {
      value: "analyst",
      label: "Analyst",
      description: "Data analysis permissions",
    },
  ];

  // User statuses
  const userStatuses = [
    { value: "active", label: "Active", color: "green" },
    { value: "pending", label: "Pending Verification", color: "yellow" },
    { value: "suspended", label: "Suspended", color: "red" },
    { value: "inactive", label: "Inactive", color: "gray" },
  ];

  // Fetch users with filters and sorting
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "users",
      searchTerm,
      roleFilter,
      statusFilter,
      sortField,
      sortOrder,
    ],
    queryFn: () =>
      adminService.getUsers({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        sortField,
        sortOrder,
      }),
    // Mock data for now
    placeholderData: {
      users: [
        {
          id: 1,
          name: "John Smith",
          email: "john.smith@example.com",
          phone: "+1 555-123-4567",
          role: "admin",
          municipality: "Central Municipality",
          status: "active",
          reportsSubmitted: 12,
          lastActive: "2025-09-23T10:30:00Z",
        },
        {
          id: 2,
          name: "Sarah Johnson",
          email: "sarah.j@example.com",
          phone: "+1 555-987-6543",
          role: "municipal_admin",
          municipality: "North Municipality",
          status: "active",
          reportsSubmitted: 5,
          lastActive: "2025-09-22T16:45:00Z",
        },
        {
          id: 3,
          name: "Mike Williams",
          email: "mike.w@example.com",
          phone: "+1 555-234-5678",
          role: "rescuer",
          municipality: "East Municipality",
          status: "active",
          reportsSubmitted: 0,
          lastActive: "2025-09-24T09:15:00Z",
        },
        {
          id: 4,
          name: "Emily Davis",
          email: "emily.davis@example.com",
          phone: "+1 555-345-6789",
          role: "citizen",
          municipality: "South Municipality",
          status: "pending",
          reportsSubmitted: 3,
          lastActive: "2025-09-20T14:20:00Z",
        },
        {
          id: 5,
          name: "Robert Wilson",
          email: "robert.w@example.com",
          phone: "+1 555-456-7890",
          role: "citizen",
          municipality: "West Municipality",
          status: "suspended",
          reportsSubmitted: 8,
          lastActive: "2025-09-15T11:10:00Z",
        },
        {
          id: 6,
          name: "Jennifer Brown",
          email: "jennifer.b@example.com",
          phone: "+1 555-567-8901",
          role: "analyst",
          municipality: "Central Municipality",
          status: "active",
          reportsSubmitted: 0,
          lastActive: "2025-09-24T13:50:00Z",
        },
      ],
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData) => adminService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setShowAddUserModal(false);
      resetForm();
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (userData) => adminService.updateUser(userData.id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setShowAddUserModal(false);
      setUserToEdit(null);
      resetForm();
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setShowDeleteConfirmation(false);
      setUserToDelete(null);
    },
  });

  // Reset form
  const resetForm = () => {
    setUserForm({
      name: "",
      email: "",
      phone: "",
      role: "citizen",
      municipality: "",
      status: "active",
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (userToEdit) {
      updateUserMutation.mutate({
        ...userForm,
        id: userToEdit.id,
      });
    } else {
      createUserMutation.mutate(userForm);
    }
  };

  // Open edit user modal
  const handleEditUser = (user) => {
    setUserToEdit(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      municipality: user.municipality,
      status: user.status,
    });
    setShowAddUserModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Get role label and color
  const getRoleInfo = (roleValue) => {
    const role = userRoles.find((r) => r.value === roleValue);
    let bgColor = "";

    switch (roleValue) {
      case "admin":
        bgColor = "bg-purple-100 text-purple-800 border-purple-200";
        break;
      case "municipal_admin":
        bgColor = "bg-blue-100 text-blue-800 border-blue-200";
        break;
      case "rescuer":
        bgColor = "bg-orange-100 text-orange-800 border-orange-200";
        break;
      case "analyst":
        bgColor = "bg-green-100 text-green-800 border-green-200";
        break;
      default:
        bgColor = "bg-gray-100 text-gray-800 border-gray-200";
    }

    return {
      label: role?.label || roleValue,
      bgColor,
    };
  };

  // Get status color
  const getStatusInfo = (statusValue) => {
    const status = userStatuses.find((s) => s.value === statusValue);
    let bgColor = "";
    let icon = null;

    switch (statusValue) {
      case "active":
        bgColor = "bg-green-100 text-green-800 border-green-200";
        icon = <CheckCircle className="w-3 h-3 mr-1" />;
        break;
      case "pending":
        bgColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
        icon = <AlertCircle className="w-3 h-3 mr-1" />;
        break;
      case "suspended":
        bgColor = "bg-red-100 text-red-800 border-red-200";
        icon = <UserX className="w-3 h-3 mr-1" />;
        break;
      default:
        bgColor = "bg-gray-100 text-gray-800 border-gray-200";
        icon = <UserX className="w-3 h-3 mr-1" />;
    }

    return {
      label: status?.label || statusValue,
      bgColor,
      icon,
    };
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
        <p>Error loading users. Please try again later.</p>
        <button
          onClick={() => refetch()}
          className="mt-2 flex items-center text-sm font-medium text-red-700"
        >
          <RefreshCcw className="w-4 h-4 mr-1" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="text-gray-500 mt-1">
                Manage users, roles, and permissions
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                onClick={() => {
                  resetForm();
                  setUserToEdit(null);
                  setShowAddUserModal(true);
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add New User
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {userRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCheck className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {userStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => refetch()}
                className="bg-white border border-gray-300 rounded-md p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Refresh"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
              <button
                className="bg-white border border-gray-300 rounded-md p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Export Users"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                className="bg-white border border-gray-300 rounded-md p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Filter Options"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    <span>Name</span>
                    {sortField === "name" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact Info
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center">
                    <span>Role</span>
                    {sortField === "role" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Municipality
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    {sortField === "status" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("lastActive")}
                >
                  <div className="flex items-center">
                    <span>Last Active</span>
                    {sortField === "lastActive" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersData.users.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const statusInfo = getStatusInfo(user.status);

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${roleInfo.bgColor}`}
                      >
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.municipality}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${statusInfo.bgColor}`}
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.lastActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteConfirmation(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-white">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:text-gray-500">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:text-gray-500">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{usersData.users.length}</span> of{" "}
                <span className="font-medium">{usersData.users.length}</span>{" "}
                users
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  <ChevronUp className="h-5 w-5 transform rotate-90" />
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-primary-500 text-sm font-medium bg-primary-50 text-primary-600">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  <ChevronDown className="h-5 w-5 transform rotate-90" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {userToEdit ? "Edit User" : "Add New User"}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => {
                  setShowAddUserModal(false);
                  setUserToEdit(null);
                  resetForm();
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-4 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                    value={userForm.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                    value={userForm.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                    value={userForm.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700"
                  >
                    User Role
                  </label>
                  <select
                    name="role"
                    id="role"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                    value={userForm.role}
                    onChange={handleInputChange}
                    required
                  >
                    {userRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="municipality"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Municipality
                  </label>
                  <select
                    name="municipality"
                    id="municipality"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                    value={userForm.municipality}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a Municipality</option>
                    {municipalities.map((municipality) => (
                      <option key={municipality.id} value={municipality.name}>
                        {municipality.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Account Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                    value={userForm.status}
                    onChange={handleInputChange}
                    required
                  >
                    {userStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show password fields only for new users */}
                {!userToEdit && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex items-center">
                      <input
                        id="send-invitation"
                        name="send-invitation"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label
                        htmlFor="send-invitation"
                        className="ml-2 block text-sm text-blue-800"
                      >
                        Send email invitation with password setup link
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  disabled={
                    createUserMutation.isLoading || updateUserMutation.isLoading
                  }
                >
                  {createUserMutation.isLoading ||
                  updateUserMutation.isLoading ? (
                    <span className="flex items-center">
                      <RefreshCcw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Processing...
                    </span>
                  ) : userToEdit ? (
                    "Save Changes"
                  ) : (
                    "Create User"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setUserToEdit(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">
                Delete User
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 text-center">
                  Are you sure you want to delete the user "{userToDelete?.name}
                  "? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  if (userToDelete) {
                    deleteUserMutation.mutate(userToDelete.id);
                  }
                }}
                disabled={deleteUserMutation.isLoading}
              >
                {deleteUserMutation.isLoading ? (
                  <span className="flex items-center">
                    <RefreshCcw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setUserToDelete(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
