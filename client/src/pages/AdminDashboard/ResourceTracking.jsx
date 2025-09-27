import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Truck,
  Package,
  AlertCircle,
  PlusCircle,
  MapPin,
  RefreshCcw,
  Search,
  Filter,
  Edit,
  Trash2,
  Download,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Calendar,
  BarChart3,
  Users,
  AlertTriangle,
} from "lucide-react";
import adminService from "../../services/adminService";

const ResourceTracking = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter] = useState("all"); // Removed unused setStatusFilter
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("inventory");

  // Form state for new/edit resource
  const [resourceForm, setResourceForm] = useState({
    name: "",
    category: "vehicle",
    quantity: 1,
    location: "",
    status: "available",
    notes: "",
  });

  // Resource categories
  const resourceCategories = [
    { value: "vehicle", label: "Vehicle" },
    { value: "medical", label: "Medical Supply" },
    { value: "shelter", label: "Shelter" },
    { value: "food", label: "Food & Water" },
    { value: "equipment", label: "Equipment" },
    { value: "personnel", label: "Personnel" },
  ];

  // Resource statuses
  const resourceStatuses = [
    { value: "available", label: "Available", color: "green" },
    { value: "in_use", label: "In Use", color: "blue" },
    { value: "low_stock", label: "Low Stock", color: "yellow" },
    { value: "maintenance", label: "Maintenance", color: "orange" },
    { value: "unavailable", label: "Unavailable", color: "red" },
  ];

  // Locations
  const locations = [
    { id: 1, name: "North Depot" },
    { id: 2, name: "South Warehouse" },
    { id: 3, name: "East Distribution Center" },
    { id: 4, name: "West Emergency Storage" },
    { id: 5, name: "Central Headquarters" },
  ];

  // Fetch resources with filters and sorting
  const {
    data: resourcesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "resources",
      searchTerm,
      categoryFilter,
      locationFilter,
      statusFilter,
      sortField,
      sortOrder,
    ],
    queryFn: () =>
      adminService.getResources({
        search: searchTerm,
        category: categoryFilter,
        location: locationFilter,
        status: statusFilter,
        sortField,
        sortOrder,
      }),
    // Mock data for now
    placeholderData: {
      resources: [
        {
          id: 1,
          name: "Emergency Rescue Boat",
          category: "vehicle",
          quantity: 5,
          location: "North Depot",
          status: "available",
          lastUsed: "2025-09-15T10:30:00Z",
          lastMaintenance: "2025-09-01T08:15:00Z",
          assignedTo: null,
          notes: "Regular maintenance completed",
        },
        {
          id: 2,
          name: "Medical First Aid Kits",
          category: "medical",
          quantity: 50,
          location: "Central Headquarters",
          status: "low_stock",
          lastUsed: "2025-09-20T14:45:00Z",
          lastMaintenance: null,
          assignedTo: null,
          notes: "Need to restock bandages and antiseptics",
        },
        {
          id: 3,
          name: "Emergency Food Packages",
          category: "food",
          quantity: 200,
          location: "South Warehouse",
          status: "available",
          lastUsed: "2025-09-10T09:20:00Z",
          lastMaintenance: null,
          assignedTo: null,
          notes: "Each package contains 3-day supply for one person",
        },
        {
          id: 4,
          name: "Portable Water Pumps",
          category: "equipment",
          quantity: 8,
          location: "West Emergency Storage",
          status: "maintenance",
          lastUsed: "2025-09-18T16:10:00Z",
          lastMaintenance: "2025-09-22T11:30:00Z",
          assignedTo: "Technical Team",
          notes: "Two units undergoing repair after last deployment",
        },
        {
          id: 5,
          name: "Rescue Team Alpha",
          category: "personnel",
          quantity: 12,
          location: "Central Headquarters",
          status: "in_use",
          lastUsed: "2025-09-23T07:00:00Z",
          lastMaintenance: null,
          assignedTo: "North District Flood Response",
          notes: "Specialized in water rescue operations",
        },
        {
          id: 6,
          name: "Emergency Tents",
          category: "shelter",
          quantity: 30,
          location: "East Distribution Center",
          status: "available",
          lastUsed: "2025-09-05T13:40:00Z",
          lastMaintenance: "2025-09-07T10:15:00Z",
          assignedTo: null,
          notes: "Each tent accommodates up to 6 people",
        },
        {
          id: 7,
          name: "Communication Radios",
          category: "equipment",
          quantity: 25,
          location: "Central Headquarters",
          status: "in_use",
          lastUsed: "2025-09-22T08:30:00Z",
          lastMaintenance: "2025-09-15T14:00:00Z",
          assignedTo: "Field Teams",
          notes: "Range of 5km in urban areas",
        },
      ],
      summary: {
        totalResources: 7,
        totalQuantity: 330,
        availableResources: 3,
        inUseResources: 2,
        lowStockResources: 1,
        maintenanceResources: 1,
        resourcesByCategory: {
          vehicle: 5,
          medical: 50,
          shelter: 30,
          food: 200,
          equipment: 33,
          personnel: 12,
        },
      },
      assignments: [
        {
          id: 1,
          resourceName: "Rescue Team Alpha",
          assignedTo: "North District Flood Response",
          location: "North District",
          startDate: "2025-09-23T07:00:00Z",
          estimatedEndDate: "2025-09-25T18:00:00Z",
          status: "active",
        },
        {
          id: 2,
          resourceName: "Communication Radios",
          assignedTo: "Field Teams",
          location: "Various Locations",
          startDate: "2025-09-22T08:30:00Z",
          estimatedEndDate: "2025-09-26T17:00:00Z",
          status: "active",
        },
        {
          id: 3,
          resourceName: "Emergency Food Packages",
          assignedTo: "South Relief Center",
          location: "South District",
          startDate: "2025-09-10T09:20:00Z",
          estimatedEndDate: "2025-09-15T18:00:00Z",
          status: "completed",
        },
      ],
    },
  });

  // Create resource mutation
  const createResourceMutation = useMutation({
    mutationFn: (resourceData) => adminService.createResource(resourceData),
    onSuccess: () => {
      queryClient.invalidateQueries(["resources"]);
      setShowAddResourceModal(false);
      resetForm();
    },
  });

  // Update resource mutation
  const updateResourceMutation = useMutation({
    mutationFn: (resourceData) =>
      adminService.updateResource(resourceData.id, resourceData),
    onSuccess: () => {
      queryClient.invalidateQueries(["resources"]);
      setShowAddResourceModal(false);
      setResourceToEdit(null);
      resetForm();
    },
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId) => adminService.deleteResource(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries(["resources"]);
      setShowDeleteConfirmation(false);
      setResourceToDelete(null);
    },
  });

  // Reset form
  const resetForm = () => {
    setResourceForm({
      name: "",
      category: "vehicle",
      quantity: 1,
      location: "",
      status: "available",
      notes: "",
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResourceForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value, 10) : value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (resourceToEdit) {
      updateResourceMutation.mutate({
        ...resourceForm,
        id: resourceToEdit.id,
      });
    } else {
      createResourceMutation.mutate(resourceForm);
    }
  };

  // Open edit resource modal
  const handleEditResource = (resource) => {
    setResourceToEdit(resource);
    setResourceForm({
      name: resource.name,
      category: resource.category,
      quantity: resource.quantity,
      location: resource.location,
      status: resource.status,
      notes: resource.notes || "",
    });
    setShowAddResourceModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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

  // Get category label and icon
  const getCategoryInfo = (categoryValue) => {
    const category = resourceCategories.find((c) => c.value === categoryValue);
    let icon = null;

    switch (categoryValue) {
      case "vehicle":
        icon = <Truck className="w-4 h-4" />;
        break;
      case "medical":
        icon = <Package className="w-4 h-4" />;
        break;
      case "shelter":
        icon = <Users className="w-4 h-4" />;
        break;
      case "food":
        icon = <Package className="w-4 h-4" />;
        break;
      case "equipment":
        icon = <Package className="w-4 h-4" />;
        break;
      case "personnel":
        icon = <Users className="w-4 h-4" />;
        break;
      default:
        icon = <Package className="w-4 h-4" />;
    }

    return {
      label: category?.label || categoryValue,
      icon,
    };
  };

  // Get status color and label
  const getStatusInfo = (statusValue) => {
    const status = resourceStatuses.find((s) => s.value === statusValue);
    let bgColor = "";
    let icon = null;

    switch (statusValue) {
      case "available":
        bgColor = "bg-green-100 text-green-800 border-green-200";
        icon = <CheckCircle className="w-3 h-3 mr-1" />;
        break;
      case "in_use":
        bgColor = "bg-blue-100 text-blue-800 border-blue-200";
        icon = <Truck className="w-3 h-3 mr-1" />;
        break;
      case "low_stock":
        bgColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
        icon = <AlertTriangle className="w-3 h-3 mr-1" />;
        break;
      case "maintenance":
        bgColor = "bg-orange-100 text-orange-800 border-orange-200";
        icon = <AlertCircle className="w-3 h-3 mr-1" />;
        break;
      case "unavailable":
        bgColor = "bg-red-100 text-red-800 border-red-200";
        icon = <X className="w-3 h-3 mr-1" />;
        break;
      default:
        bgColor = "bg-gray-100 text-gray-800 border-gray-200";
        icon = <AlertCircle className="w-3 h-3 mr-1" />;
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
        <p>Error loading resources. Please try again later.</p>
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
                Resource Tracking System
              </h1>
              <p className="text-gray-500 mt-1">
                Monitor and manage emergency resources
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                onClick={() => {
                  resetForm();
                  setResourceToEdit(null);
                  setShowAddResourceModal(true);
                }}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add New Resource
              </button>
            </div>
          </div>
        </div>

        {/* Resource Summary Cards */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Resources
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {resourcesData?.summary?.totalResources || 0}
                </p>
              </div>
              <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Total Quantity: {resourcesData?.summary?.totalQuantity || 0}{" "}
                units
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Available Resources
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {resourcesData?.summary?.availableResources || 0}
                </p>
              </div>
              <div className="p-2 bg-green-100 text-green-700 rounded-full">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">Ready for deployment</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  In Use Resources
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {resourcesData?.summary?.inUseResources || 0}
                </p>
              </div>
              <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Currently deployed in operations
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Needs Attention
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(resourcesData?.summary?.lowStockResources || 0) +
                    (resourcesData?.summary?.maintenanceResources || 0)}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 text-yellow-700 rounded-full">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Low stock or maintenance required
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "inventory"
                  ? "border-b-2 border-primary-600 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("inventory")}
            >
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2" /> Inventory
              </div>
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "assignments"
                  ? "border-b-2 border-primary-600 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("assignments")}
            >
              <div className="flex items-center">
                <Truck className="w-4 h-4 mr-2" /> Deployments
              </div>
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "analytics"
                  ? "border-b-2 border-primary-600 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" /> Resource Analytics
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "inventory" && (
          <>
            {/* Filters */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search resources..."
                    className="pl-10 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="pl-10 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {resourceCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="pl-10 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    <option value="all">All Locations</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.name}>
                        {location.name}
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
                    title="Export Resources"
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

            {/* Resources Table */}
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
                        <span>Resource Name</span>
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center">
                        <span>Category</span>
                        {sortField === "category" &&
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
                      onClick={() => handleSort("quantity")}
                    >
                      <div className="flex items-center">
                        <span>Quantity</span>
                        {sortField === "quantity" &&
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
                      Location
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Last Used
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
                  {(resourcesData?.resources || []).map((resource) => {
                    const categoryInfo = getCategoryInfo(resource.category);
                    const statusInfo = getStatusInfo(resource.status);

                    return (
                      <tr key={resource.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {resource.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-1 mr-2 bg-blue-50 text-blue-700 rounded">
                              {categoryInfo.icon}
                            </div>
                            <span className="text-sm text-gray-900">
                              {categoryInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {resource.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">
                              {resource.location}
                            </span>
                          </div>
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
                          {formatDate(resource.lastUsed)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-primary-600 hover:text-primary-900 mr-3"
                            onClick={() => handleEditResource(resource)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => {
                              setResourceToDelete(resource);
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
          </>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Resource Deployments
              </h3>
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md flex items-center text-sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                New Deployment
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <ul className="divide-y divide-gray-200">
                {(resourcesData?.assignments || []).map((assignment) => (
                  <li key={assignment.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start">
                        <div
                          className={`p-2 rounded-full ${
                            assignment.status === "active"
                              ? "bg-green-100 text-green-700"
                              : assignment.status === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {assignment.status === "active" ? (
                            <Truck className="w-5 h-5" />
                          ) : (
                            <CheckCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            {assignment.resourceName}
                          </h4>
                          <div className="flex items-center mt-1">
                            <Users className="w-4 h-4 text-gray-400 mr-1" />
                            <p className="text-sm text-gray-500">
                              {assignment.assignedTo}
                            </p>
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                            <p className="text-sm text-gray-500">
                              {assignment.location}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            assignment.status === "active"
                              ? "bg-green-100 text-green-800"
                              : assignment.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {assignment.status.charAt(0).toUpperCase() +
                            assignment.status.slice(1)}
                        </span>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(assignment.startDate)}
                        </div>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          Est. End: {formatDate(assignment.estimatedEndDate)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end space-x-2">
                      {assignment.status === "active" && (
                        <>
                          <button className="text-sm text-gray-600 border border-gray-300 rounded px-3 py-1 hover:bg-gray-50">
                            Update Status
                          </button>
                          <button className="text-sm text-green-700 border border-green-300 bg-green-50 rounded px-3 py-1 hover:bg-green-100">
                            Mark Complete
                          </button>
                        </>
                      )}
                      <button className="text-sm text-blue-700 border border-blue-300 bg-blue-50 rounded px-3 py-1 hover:bg-blue-100">
                        View Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="p-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resource Distribution by Category
              </h3>
              <div className="bg-white p-4 border rounded-lg shadow-sm">
                <div className="h-64">
                  {/* This would be replaced with an actual chart component */}
                  <div className="space-y-6 w-full h-full flex flex-col justify-center">
                    {Object.entries(
                      resourcesData?.summary?.resourcesByCategory || {}
                    ).map(([category, quantity]) => {
                      const categoryInfo = getCategoryInfo(category);
                      const percentage = Math.round(
                        (quantity /
                          (resourcesData?.summary?.totalQuantity || 1)) *
                          100
                      );

                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="p-1 mr-2 bg-blue-50 text-blue-700 rounded">
                                {categoryInfo.icon}
                              </div>
                              <span className="text-sm font-medium">
                                {categoryInfo.label}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {quantity} units ({percentage}%)
                            </span>
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-4 text-xs flex rounded bg-gray-200">
                              <div
                                style={{ width: `${percentage}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Resource Status Distribution
                </h3>
                <div className="bg-white p-4 border rounded-lg shadow-sm h-64 flex items-center justify-center">
                  {/* This would be replaced with an actual chart component */}
                  <div className="text-center">
                    <BarChart3 className="w-10 h-10 text-gray-400 mx-auto" />
                    <p className="mt-2 text-gray-500">
                      Status distribution chart would be displayed here
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Resource Usage Timeline
                </h3>
                <div className="bg-white p-4 border rounded-lg shadow-sm h-64 flex items-center justify-center">
                  {/* This would be replaced with an actual chart component */}
                  <div className="text-center">
                    <BarChart3 className="w-10 h-10 text-gray-400 mx-auto" />
                    <p className="mt-2 text-gray-500">
                      Usage timeline chart would be displayed here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Resource Modal */}
        {showAddResourceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {resourceToEdit ? "Edit Resource" : "Add New Resource"}
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => {
                    setShowAddResourceModal(false);
                    setResourceToEdit(null);
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
                      Resource Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                      value={resourceForm.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Category
                    </label>
                    <select
                      name="category"
                      id="category"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                      value={resourceForm.category}
                      onChange={handleInputChange}
                      required
                    >
                      {resourceCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      name="quantity"
                      id="quantity"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                      value={resourceForm.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Location
                    </label>
                    <select
                      name="location"
                      id="location"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                      value={resourceForm.location}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a Location</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.name}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Status
                    </label>
                    <select
                      name="status"
                      id="status"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                      value={resourceForm.status}
                      onChange={handleInputChange}
                      required
                    >
                      {resourceStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows="3"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
                      value={resourceForm.notes}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={
                      createResourceMutation.isLoading ||
                      updateResourceMutation.isLoading
                    }
                  >
                    {createResourceMutation.isLoading ||
                    updateResourceMutation.isLoading ? (
                      <span className="flex items-center">
                        <RefreshCcw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Processing...
                      </span>
                    ) : resourceToEdit ? (
                      "Save Changes"
                    ) : (
                      "Add Resource"
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowAddResourceModal(false);
                      setResourceToEdit(null);
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
                  Delete Resource
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 text-center">
                    Are you sure you want to delete "{resourceToDelete?.name}"?
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    if (resourceToDelete) {
                      deleteResourceMutation.mutate(resourceToDelete.id);
                    }
                  }}
                  disabled={deleteResourceMutation.isLoading}
                >
                  {deleteResourceMutation.isLoading ? (
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
                    setResourceToDelete(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceTracking;
