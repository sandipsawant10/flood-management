import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserPlus,
  UserMinus,
  UserCog,
  Shield,
  ShieldAlert,
  Search,
  Filter,
  RefreshCcw,
  FileText,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  MoreVertical,
  Download,
  CheckSquare,
} from "lucide-react";
import { adminService } from "../services/adminService";

/**
 * AdvancedUserManagement component for managing users with role-based permissions
 */
const AdvancedUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  // We'll implement role management directly in the form instead of using a modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkActionMenuOpen, setBulkActionMenuOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    status: "active",
    municipality: "",
    address: "",
    permissions: {
      canViewReports: true,
      canCreateReports: true,
      canEditReports: false,
      canDeleteReports: false,
      canViewAnalytics: false,
      canManageUsers: false,
      canConfigureSystem: false,
      canAccessAPI: false,
      canViewEmergencyContacts: true,
    },
  });

  // Roles configuration
  const roles = useMemo(
    () => [
      {
        id: "admin",
        name: "Administrator",
        description: "Full access to all system features",
        color: "bg-red-100 text-red-800",
        icon: <Shield className="h-4 w-4" />,
      },
      {
        id: "manager",
        name: "Municipal Manager",
        description: "Manages municipal resources and response teams",
        color: "bg-purple-100 text-purple-800",
        icon: <UserCog className="h-4 w-4" />,
      },
      {
        id: "rescuer",
        name: "Rescue Team",
        description: "First responders with field access",
        color: "bg-amber-100 text-amber-800",
        icon: <ShieldAlert className="h-4 w-4" />,
      },
      {
        id: "analyst",
        name: "Analyst",
        description: "Data analysis and reporting capabilities",
        color: "bg-blue-100 text-blue-800",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: "user",
        name: "User",
        description: "Basic reporting and alerts access",
        color: "bg-green-100 text-green-800",
        icon: <Users className="h-4 w-4" />,
      },
    ],
    []
  );

  // Status types
  const statusTypes = [
    { id: "active", name: "Active", color: "bg-green-100 text-green-800" },
    { id: "inactive", name: "Inactive", color: "bg-gray-100 text-gray-800" },
    { id: "suspended", name: "Suspended", color: "bg-red-100 text-red-800" },
    {
      id: "pending",
      name: "Pending Verification",
      color: "bg-yellow-100 text-yellow-800",
    },
  ];

  // Permission sets by role
  const rolePermissions = useMemo(
    () => ({
      admin: {
        canViewReports: true,
        canCreateReports: true,
        canEditReports: true,
        canDeleteReports: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canConfigureSystem: true,
        canAccessAPI: true,
        canViewEmergencyContacts: true,
      },
      manager: {
        canViewReports: true,
        canCreateReports: true,
        canEditReports: true,
        canDeleteReports: false,
        canViewAnalytics: true,
        canManageUsers: false,
        canConfigureSystem: false,
        canAccessAPI: false,
        canViewEmergencyContacts: true,
      },
      rescuer: {
        canViewReports: true,
        canCreateReports: true,
        canEditReports: true,
        canDeleteReports: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canConfigureSystem: false,
        canAccessAPI: false,
        canViewEmergencyContacts: true,
      },
      analyst: {
        canViewReports: true,
        canCreateReports: false,
        canEditReports: false,
        canDeleteReports: false,
        canViewAnalytics: true,
        canManageUsers: false,
        canConfigureSystem: false,
        canAccessAPI: true,
        canViewEmergencyContacts: false,
      },
      user: {
        canViewReports: true,
        canCreateReports: true,
        canEditReports: false,
        canDeleteReports: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canConfigureSystem: false,
        canAccessAPI: false,
        canViewEmergencyContacts: true,
      },
    }),
    []
  );

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        // In a real implementation, we'd pass all these parameters to the API
        const response = await adminService.getUsers({
          page,
          pageSize,
          search: searchQuery,
          status: statusFilter !== "all" ? statusFilter : undefined,
          role: roleFilter !== "all" ? roleFilter : undefined,
          sort: sortBy,
          order: sortOrder,
        });

        setUsers(response.users || []);
        setTotalUsers(response.total || response.users?.length || 0);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Could not load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [
    page,
    pageSize,
    searchQuery,
    statusFilter,
    roleFilter,
    sortBy,
    sortOrder,
  ]);

  // Handle role change
  const handleRoleChange = (e) => {
    const role = e.target.value;
    setUserForm({
      ...userForm,
      role,
      permissions: rolePermissions[role] || rolePermissions.user,
    });
  };

  // Handle permission toggle
  const handlePermissionToggle = (permission) => {
    setUserForm({
      ...userForm,
      permissions: {
        ...userForm.permissions,
        [permission]: !userForm.permissions[permission],
      },
    });
  };

  // Reset form
  const resetForm = () => {
    setUserForm({
      name: "",
      email: "",
      phone: "",
      role: "user",
      status: "active",
      municipality: "",
      address: "",
      permissions: rolePermissions.user,
    });
    setEditMode(false);
    setSelectedUser(null);
  };

  // Handle saving user (create or update)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editMode && selectedUser) {
        // Update existing user
        await adminService.updateUser(selectedUser._id, userForm);

        // Update the user in the local state
        setUsers(
          users.map((user) =>
            user._id === selectedUser._id ? { ...user, ...userForm } : user
          )
        );
      } else {
        // Create new user
        const newUser = await adminService.createUser(userForm);
        setUsers([...users, newUser]);
        setTotalUsers(totalUsers + 1);
      }

      resetForm();
    } catch (err) {
      console.error("Failed to save user:", err);
      setError(
        `Failed to ${editMode ? "update" : "create"} user. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role || "user",
      status: user.status || "active",
      municipality: user.municipality || "",
      address: user.address || "",
      permissions: user.permissions || rolePermissions[user.role || "user"],
    });
    setEditMode(true);
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      await adminService.deleteUser(selectedUser._id);
      setUsers(users.filter((user) => user._id !== selectedUser._id));
      setTotalUsers(totalUsers - 1);
      setShowDeleteModal(false);
      resetForm();
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError("Could not delete user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle user status change
  const handleStatusChange = async (userId, newStatus) => {
    setLoading(true);
    try {
      await adminService.updateUserStatus(userId, newStatus);
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (err) {
      console.error("Failed to update user status:", err);
      setError("Could not update user status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (!selectedUsers.length) return;

    setLoading(true);
    try {
      switch (action) {
        case "delete":
          await adminService.bulkDeleteUsers(selectedUsers);
          setUsers(users.filter((user) => !selectedUsers.includes(user._id)));
          setTotalUsers(totalUsers - selectedUsers.length);
          break;
        case "activate":
          await adminService.bulkUpdateUserStatus(selectedUsers, "active");
          setUsers(
            users.map((user) =>
              selectedUsers.includes(user._id)
                ? { ...user, status: "active" }
                : user
            )
          );
          break;
        case "deactivate":
          await adminService.bulkUpdateUserStatus(selectedUsers, "inactive");
          setUsers(
            users.map((user) =>
              selectedUsers.includes(user._id)
                ? { ...user, status: "inactive" }
                : user
            )
          );
          break;
        default:
          break;
      }

      setSelectedUsers([]);
      setBulkActionMenuOpen(false);
    } catch (err) {
      console.error(`Failed to perform bulk action: ${action}`, err);
      setError("Could not perform the selected action on multiple users.");
    } finally {
      setLoading(false);
    }
  };

  // Handle sort change
  const handleSort = (field) => {
    // If clicking the same field, toggle the order
    if (field === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New field, set it and default to ascending order
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Handle user selection for bulk actions
  const handleUserSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Handle select/deselect all
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user._id));
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalUsers / pageSize);

  // Export user data
  const handleExportData = () => {
    // In a real implementation, this would call an API endpoint to generate
    // and download the file
    const filename = `user-data-${new Date().toISOString().slice(0, 10)}.csv`;
    alert(`Exporting user data as CSV. Filename: ${filename}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          User Management
        </h2>

        <div className="flex space-x-2">
          <button
            onClick={handleExportData}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded text-sm font-medium flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Export Data
          </button>

          <button
            onClick={() => {
              resetForm();
              setEditMode(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex-1 sm:max-w-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <label
                className="text-sm text-gray-600 mr-2"
                htmlFor="status-filter"
              >
                Status:
              </label>
              <select
                id="status-filter"
                className="border border-gray-300 rounded-md py-1.5 pl-3 pr-8 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                {statusTypes.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label
                className="text-sm text-gray-600 mr-2"
                htmlFor="role-filter"
              >
                Role:
              </label>
              <select
                id="role-filter"
                className="border border-gray-300 rounded-md py-1.5 pl-3 pr-8 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setRoleFilter("all");
              }}
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 px-2 py-1 hover:bg-gray-100 rounded"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Reset
            </button>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="flex items-center justify-between mt-3 py-1.5 px-3 bg-blue-50 rounded-md border border-blue-100">
            <div className="text-sm text-blue-800">
              <CheckSquare className="inline h-4 w-4 mr-1" />
              <span className="font-medium">{selectedUsers.length}</span> users
              selected
            </div>

            <div className="relative">
              <button
                onClick={() => setBulkActionMenuOpen(!bulkActionMenuOpen)}
                className="text-sm bg-white border border-blue-200 rounded px-3 py-1 text-blue-600 hover:bg-blue-50"
              >
                Bulk Actions
              </button>

              {bulkActionMenuOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1 w-36">
                  <button
                    onClick={() => handleBulkAction("activate")}
                    className="block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <CheckCircle className="inline h-3.5 w-3.5 mr-1.5 text-green-500" />
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction("deactivate")}
                    className="block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <XCircle className="inline h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    Deactivate
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    className="block w-full text-left px-4 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="inline h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th
                onClick={() => handleSort("name")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Name
                {sortBy === "name" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort("email")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Email
                {sortBy === "email" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort("role")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Role
                {sortBy === "role" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort("status")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Status
                {sortBy === "status" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort("municipality")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Municipality
                {sortBy === "municipality" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th className="px-4 py-3 w-24 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-red-500">
                  <AlertTriangle className="h-5 w-5 inline mr-2" />
                  {error}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  <Users className="h-5 w-5 inline mr-2" />
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleUserSelect(user._id)}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        {user.phone && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    {user.lastLogin && (
                      <div className="text-xs text-gray-500">
                        Last login:{" "}
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.role && (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          roles.find((r) => r.id === user.role)?.color ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {roles.find((r) => r.id === user.role)?.icon}
                        <span className="ml-1">
                          {roles.find((r) => r.id === user.role)?.name ||
                            user.role}
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusTypes.find((s) => s.id === user.status)
                            ?.color || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.status === "active" ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                        ) : user.status === "inactive" ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-500 mr-1.5"></span>
                        ) : user.status === "suspended" ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5"></span>
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 mr-1.5"></span>
                        )}
                        {statusTypes.find((s) => s.id === user.status)?.name ||
                          user.status}
                      </span>
                      <div className="ml-2">
                        <select
                          value={user.status}
                          onChange={(e) =>
                            handleStatusChange(user._id, e.target.value)
                          }
                          className="text-xs border border-gray-200 rounded py-0.5 px-1"
                          aria-label="Change user status"
                        >
                          {statusTypes.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.municipality ? (
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {user.municipality}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit user"
                      >
                        <UserCog className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && !error && users.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(page * pageSize, totalUsers)}
            </span>{" "}
            of <span className="font-medium">{totalUsers}</span> users
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded-md text-sm py-1.5 px-3"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <div>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className={`ml-2 inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md ${
                  page >= totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Form (Create/Edit) */}
      {(editMode || (!selectedUser && !loading)) && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editMode ? "Edit User" : "Create New User"}
          </h3>
          <form onSubmit={handleSaveUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={userForm.phone}
                  onChange={(e) =>
                    setUserForm({ ...userForm, phone: e.target.value })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Municipality */}
              <div>
                <label
                  htmlFor="municipality"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Municipality
                </label>
                <input
                  type="text"
                  id="municipality"
                  value={userForm.municipality}
                  onChange={(e) =>
                    setUserForm({ ...userForm, municipality: e.target.value })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <select
                  id="role"
                  value={userForm.role}
                  onChange={handleRoleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
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
                  value={userForm.status}
                  onChange={(e) =>
                    setUserForm({ ...userForm, status: e.target.value })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  {statusTypes.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  rows="3"
                  value={userForm.address}
                  onChange={(e) =>
                    setUserForm({ ...userForm, address: e.target.value })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-1 text-blue-600" />
                Permissions
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-view-reports"
                    checked={userForm.permissions.canViewReports}
                    onChange={() => handlePermissionToggle("canViewReports")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="perm-view-reports"
                    className="ml-2 text-sm text-gray-700"
                  >
                    View Reports
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-create-reports"
                    checked={userForm.permissions.canCreateReports}
                    onChange={() => handlePermissionToggle("canCreateReports")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="perm-create-reports"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Create Reports
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-edit-reports"
                    checked={userForm.permissions.canEditReports}
                    onChange={() => handlePermissionToggle("canEditReports")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="perm-edit-reports"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Edit Reports
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-delete-reports"
                    checked={userForm.permissions.canDeleteReports}
                    onChange={() => handlePermissionToggle("canDeleteReports")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="perm-delete-reports"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Delete Reports
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-view-analytics"
                    checked={userForm.permissions.canViewAnalytics}
                    onChange={() => handlePermissionToggle("canViewAnalytics")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="perm-view-analytics"
                    className="ml-2 text-sm text-gray-700"
                  >
                    View Analytics
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-manage-users"
                    checked={userForm.permissions.canManageUsers}
                    onChange={() => handlePermissionToggle("canManageUsers")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="perm-manage-users"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Manage Users
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-configure-system"
                    checked={userForm.permissions.canConfigureSystem}
                    onChange={() =>
                      handlePermissionToggle("canConfigureSystem")
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="perm-configure-system"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Configure System
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-access-api"
                    checked={userForm.permissions.canAccessAPI}
                    onChange={() => handlePermissionToggle("canAccessAPI")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="perm-access-api"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Access API
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-view-emergency"
                    checked={userForm.permissions.canViewEmergencyContacts}
                    onChange={() =>
                      handlePermissionToggle("canViewEmergencyContacts")
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="perm-view-emergency"
                    className="ml-2 text-sm text-gray-700"
                  >
                    View Emergency Contacts
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="inline h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : editMode ? (
                  "Update User"
                ) : (
                  "Create User"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete User
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedUser.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="inline h-4 w-4 mr-1 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedUserManagement;
