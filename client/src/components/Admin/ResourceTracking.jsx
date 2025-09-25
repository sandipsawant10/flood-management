import React, { useState, useEffect, useMemo } from "react";
import {
  Truck,
  PackageOpen,
  Droplet,
  ShoppingBag,
  Home,
  Users,
  LifeBuoy,
  CircleDollarSign,
  Map,
  Search,
  Filter,
  RefreshCcw,
  FilePlus,
  Loader2,
  ArrowUpDown,
  AlertTriangle,
  Trash2,
  CheckCircle,
  XCircle,
  Edit2,
  AlertOctagon,
  ChevronDown,
  Download,
  Upload,
  Calendar,
} from "lucide-react";
import { adminService } from "../../services/adminService";

/**
 * ResourceTracking component for monitoring and managing emergency resources
 */
const ResourceTracking = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [selectedResource, setSelectedResource] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocateResourceId, setAllocateResourceId] = useState(null);
  const [municipalities, setMunicipalities] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Form state for adding/editing resources
  const [resourceForm, setResourceForm] = useState({
    name: "",
    type: "vehicle",
    status: "available",
    quantity: 1,
    location: "",
    description: "",
    lastMaintenance: "",
    nextMaintenance: "",
    condition: "good",
    assignedTo: "",
    allocations: [],
  });

  // Resource types with their icons
  const resourceTypes = [
    {
      id: "vehicle",
      name: "Vehicles",
      icon: <Truck className="h-5 w-5" />,
      examples: [
        "Rescue Boats",
        "Ambulances",
        "Fire Trucks",
        "Heavy Equipment",
      ],
    },
    {
      id: "medical",
      name: "Medical Supplies",
      icon: <PackageOpen className="h-5 w-5" />,
      examples: ["First Aid Kits", "Medications", "Medical Equipment", "PPE"],
    },
    {
      id: "water",
      name: "Water Resources",
      icon: <Droplet className="h-5 w-5" />,
      examples: ["Drinking Water", "Water Purifiers", "Pumps", "Tanks"],
    },
    {
      id: "food",
      name: "Food Supplies",
      icon: <ShoppingBag className="h-5 w-5" />,
      examples: [
        "Ready-to-eat Meals",
        "Dry Rations",
        "Baby Food",
        "Special Diet Items",
      ],
    },
    {
      id: "shelter",
      name: "Shelter & Housing",
      icon: <Home className="h-5 w-5" />,
      examples: ["Tents", "Temporary Structures", "Blankets", "Sleeping Bags"],
    },
    {
      id: "personnel",
      name: "Personnel",
      icon: <Users className="h-5 w-5" />,
      examples: [
        "Rescue Teams",
        "Medical Staff",
        "Volunteers",
        "Specialized Personnel",
      ],
    },
    {
      id: "rescue",
      name: "Rescue Equipment",
      icon: <LifeBuoy className="h-5 w-5" />,
      examples: [
        "Life Jackets",
        "Ropes",
        "Safety Gear",
        "Communication Devices",
      ],
    },
    {
      id: "financial",
      name: "Financial Aid",
      icon: <CircleDollarSign className="h-5 w-5" />,
      examples: [
        "Emergency Funds",
        "Relief Grants",
        "Donations",
        "Insurance Claims",
      ],
    },
  ];

  // Resource status options
  const statusOptions = [
    {
      id: "available",
      name: "Available",
      color: "bg-green-100 text-green-800",
    },
    { id: "allocated", name: "Allocated", color: "bg-blue-100 text-blue-800" },
    {
      id: "maintenance",
      name: "In Maintenance",
      color: "bg-yellow-100 text-yellow-800",
    },
    { id: "depleted", name: "Depleted/Low", color: "bg-red-100 text-red-800" },
    {
      id: "transit",
      name: "In Transit",
      color: "bg-purple-100 text-purple-800",
    },
  ];

  // Resource condition options
  const conditionOptions = [
    { id: "excellent", name: "Excellent" },
    { id: "good", name: "Good" },
    { id: "fair", name: "Fair" },
    { id: "poor", name: "Poor" },
    { id: "critical", name: "Critical" },
  ];

  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);

      try {
        // In a real app, would pass search and filter parameters
        const response = await adminService.getResources({
          search: searchQuery,
          category: filterCategory !== "all" ? filterCategory : undefined,
          status: filterStatus !== "all" ? filterStatus : undefined,
          location: filterLocation !== "all" ? filterLocation : undefined,
          sortBy,
          sortOrder,
          dateStart: dateRange.start,
          dateEnd: dateRange.end,
        });

        setResources(response.resources || []);

        // Get unique municipality locations for filter dropdown
        const locations = [
          ...new Set(response.resources.map((res) => res.location)),
        ].filter(Boolean);
        setMunicipalities(locations);
      } catch (err) {
        console.error("Failed to fetch resources:", err);
        setError("Could not load resource data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [
    searchQuery,
    filterCategory,
    filterStatus,
    filterLocation,
    sortBy,
    sortOrder,
    dateRange,
  ]);

  // Filter resources based on current filters
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // Search query filter
      if (
        searchQuery &&
        !resource.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (filterCategory !== "all" && resource.type !== filterCategory) {
        return false;
      }

      // Status filter
      if (filterStatus !== "all" && resource.status !== filterStatus) {
        return false;
      }

      // Location filter
      if (filterLocation !== "all" && resource.location !== filterLocation) {
        return false;
      }

      return true;
    });
  }, [resources, searchQuery, filterCategory, filterStatus, filterLocation]);

  // Sort resources
  const sortedResources = useMemo(() => {
    return [...filteredResources].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
        case "location":
          comparison = (a.location || "").localeCompare(b.location || "");
          break;
        case "lastMaintenance":
          comparison =
            new Date(a.lastMaintenance || 0) - new Date(b.lastMaintenance || 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredResources, sortBy, sortOrder]);

  // Reset form for creating a new resource
  const resetForm = () => {
    setResourceForm({
      name: "",
      type: "vehicle",
      status: "available",
      quantity: 1,
      location: "",
      description: "",
      lastMaintenance: "",
      nextMaintenance: "",
      condition: "good",
      assignedTo: "",
      allocations: [],
    });
  };

  // Handle saving a resource (create or update)
  const handleSaveResource = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (showEditModal && selectedResource) {
        // Update existing resource
        await adminService.updateResource(selectedResource._id, resourceForm);

        // Update in local state
        setResources(
          resources.map((resource) =>
            resource._id === selectedResource._id
              ? { ...resource, ...resourceForm }
              : resource
          )
        );

        setShowEditModal(false);
      } else {
        // Create new resource
        const newResource = await adminService.createResource(resourceForm);
        setResources([...resources, newResource]);
        setShowAddModal(false);
      }

      resetForm();
    } catch (err) {
      console.error("Failed to save resource:", err);
      setError(
        `Failed to ${
          showEditModal ? "update" : "create"
        } resource. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle resource deletion
  const handleDeleteResource = async () => {
    if (!selectedResource) return;

    setLoading(true);
    try {
      await adminService.deleteResource(selectedResource._id);
      setResources(
        resources.filter((resource) => resource._id !== selectedResource._id)
      );
      setShowDeleteModal(false);
      setSelectedResource(null);
    } catch (err) {
      console.error("Failed to delete resource:", err);
      setError("Could not delete resource. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a resource
  const handleEditResource = (resource) => {
    setSelectedResource(resource);
    setResourceForm({
      name: resource.name,
      type: resource.type,
      status: resource.status,
      quantity: resource.quantity,
      location: resource.location || "",
      description: resource.description || "",
      lastMaintenance: resource.lastMaintenance || "",
      nextMaintenance: resource.nextMaintenance || "",
      condition: resource.condition || "good",
      assignedTo: resource.assignedTo || "",
      allocations: resource.allocations || [],
    });
    setShowEditModal(true);
  };

  // Handle resource allocation
  const handleAllocateResource = (resourceId) => {
    setAllocateResourceId(resourceId);
    setAllocateModalOpen(true);
  };

  // Submit resource allocation
  const submitAllocation = async (formData) => {
    setLoading(true);
    try {
      // In a real app, this would call an API endpoint
      await adminService.allocateResource(allocateResourceId, formData);

      // Update in local state
      setResources(
        resources.map((resource) => {
          if (resource._id === allocateResourceId) {
            const updatedResource = {
              ...resource,
              status: "allocated",
              allocations: [
                ...(resource.allocations || []),
                {
                  id: Date.now().toString(),
                  location: formData.location,
                  quantity: formData.quantity,
                  startDate: formData.startDate,
                  endDate: formData.endDate,
                  assignedTo: formData.assignedTo,
                  notes: formData.notes,
                },
              ],
            };
            return updatedResource;
          }
          return resource;
        })
      );

      setAllocateModalOpen(false);
    } catch (err) {
      console.error("Failed to allocate resource:", err);
      setError("Could not allocate resource. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting changes
  const handleSort = (field) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Export resource data
  const handleExport = (format) => {
    // In a real app, this would call an API endpoint to generate and download the file
    const filename = `resource-inventory-${new Date()
      .toISOString()
      .slice(0, 10)}.${format}`;
    alert(
      `Exporting resource data as ${format.toUpperCase()}. Filename: ${filename}`
    );
  };

  // Import resource data
  const handleImport = () => {
    // In a real app, this would open a file picker and process the uploaded file
    alert("Import functionality would be implemented here.");
  };

  // Get the icon for a resource type
  const getResourceTypeIcon = (type) => {
    const resourceType = resourceTypes.find((rt) => rt.id === type);
    return resourceType ? (
      resourceType.icon
    ) : (
      <PackageOpen className="h-5 w-5" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Truck className="h-5 w-5 mr-2 text-blue-600" />
          Resource Tracking System
        </h2>

        <div className="flex space-x-2">
          <div className="relative">
            <button
              onClick={() => {}}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded text-sm font-medium flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 hidden">
              <button
                onClick={() => handleExport("csv")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                PDF
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Excel
              </button>
            </div>
          </div>

          <button
            onClick={handleImport}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded text-sm font-medium flex items-center"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center"
          >
            <FilePlus className="h-4 w-4 mr-1" />
            Add Resource
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
                placeholder="Search resources..."
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
                htmlFor="type-filter"
              >
                Type:
              </label>
              <select
                id="type-filter"
                className="border border-gray-300 rounded-md py-1.5 pl-3 pr-8 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Types</option>
                {resourceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label
                className="text-sm text-gray-600 mr-2"
                htmlFor="location-filter"
              >
                Location:
              </label>
              <select
                id="location-filter"
                className="border border-gray-300 rounded-md py-1.5 pl-3 pr-8 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              >
                <option value="all">All Locations</option>
                {municipalities.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSearchQuery("");
                setFilterCategory("all");
                setFilterStatus("all");
                setFilterLocation("all");
                setDateRange({ start: null, end: null });
              }}
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 px-2 py-1 hover:bg-gray-100 rounded"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setShowMapView(!showMapView)}
              className={`flex items-center text-sm px-3 py-1.5 rounded font-medium ${
                showMapView
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Map className="h-4 w-4 mr-1" />
              {showMapView ? "Table View" : "Map View"}
            </button>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Date Range:</span>
            <input
              type="date"
              className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:ring-blue-500 focus:border-blue-500 mr-1"
              value={dateRange.start || ""}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
            />
            <span className="text-gray-500 mx-1">to</span>
            <input
              type="date"
              className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={dateRange.end || ""}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Resource List */}
      {showMapView ? (
        <div className="p-4">
          <div className="bg-gray-100 border border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-600">
              Map view would be implemented here, showing resource locations and
              availability across different municipalities.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Resource Name
                  {sortBy === "name" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  onClick={() => handleSort("type")}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Type
                  {sortBy === "type" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  onClick={() => handleSort("quantity")}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Quantity
                  {sortBy === "quantity" && (
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
                  onClick={() => handleSort("location")}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Location
                  {sortBy === "location" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  onClick={() => handleSort("lastMaintenance")}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Last Maintenance
                  {sortBy === "lastMaintenance" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                      Loading resources...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-red-500"
                  >
                    <AlertTriangle className="h-5 w-5 inline mr-2" />
                    {error}
                  </td>
                </tr>
              ) : sortedResources.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <PackageOpen className="h-5 w-5 inline mr-2" />
                    No resources found
                  </td>
                </tr>
              ) : (
                sortedResources.map((resource) => (
                  <tr key={resource._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                          {getResourceTypeIcon(resource.type)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {resource.name}
                          </div>
                          {resource.description && (
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {resource.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">
                        {resourceTypes.find((t) => t.id === resource.type)
                          ?.name || resource.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {resource.quantity}
                      </span>
                      {resource.status === "depleted" && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Low
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusOptions.find((s) => s.id === resource.status)
                            ?.color || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {resource.status === "available" && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {resource.status === "allocated" && (
                          <Users className="h-3 w-3 mr-1" />
                        )}
                        {resource.status === "maintenance" && (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {resource.status === "depleted" && (
                          <AlertOctagon className="h-3 w-3 mr-1" />
                        )}
                        {resource.status === "transit" && (
                          <Truck className="h-3 w-3 mr-1" />
                        )}
                        {statusOptions.find((s) => s.id === resource.status)
                          ?.name || resource.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <Map className="h-3.5 w-3.5 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {resource.location || "—"}
                        </span>
                      </div>
                      {resource.assignedTo && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          Assigned: {resource.assignedTo}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {resource.lastMaintenance ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(
                              resource.lastMaintenance
                            ).toLocaleDateString()}
                          </div>
                          {resource.nextMaintenance && (
                            <div className="text-xs text-gray-500">
                              Next:{" "}
                              {new Date(
                                resource.nextMaintenance
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleAllocateResource(resource._id)}
                          className={`text-blue-600 hover:text-blue-800 ${
                            resource.status !== "available" &&
                            "opacity-50 cursor-not-allowed"
                          }`}
                          disabled={resource.status !== "available"}
                          title={
                            resource.status === "available"
                              ? "Allocate"
                              : "Resource not available"
                          }
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditResource(resource)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Edit resource"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedResource(resource);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Delete resource"
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
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FilePlus className="h-5 w-5 text-blue-600 mr-2" />
              Add New Resource
            </h3>

            <form onSubmit={handleSaveResource} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Resource Name */}
                <div>
                  <label
                    htmlFor="resource-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Resource Name
                  </label>
                  <input
                    type="text"
                    id="resource-name"
                    value={resourceForm.name}
                    onChange={(e) =>
                      setResourceForm({ ...resourceForm, name: e.target.value })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Resource Type */}
                <div>
                  <label
                    htmlFor="resource-type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Resource Type
                  </label>
                  <select
                    id="resource-type"
                    value={resourceForm.type}
                    onChange={(e) =>
                      setResourceForm({ ...resourceForm, type: e.target.value })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    {resourceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label
                    htmlFor="resource-quantity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="resource-quantity"
                    min="1"
                    value={resourceForm.quantity}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        quantity: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="resource-status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="resource-status"
                    value={resourceForm.status}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        status: e.target.value,
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="resource-location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="resource-location"
                    value={resourceForm.location}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        location: e.target.value,
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Condition */}
                <div>
                  <label
                    htmlFor="resource-condition"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Condition
                  </label>
                  <select
                    id="resource-condition"
                    value={resourceForm.condition}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        condition: e.target.value,
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    {conditionOptions.map((condition) => (
                      <option key={condition.id} value={condition.id}>
                        {condition.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Last Maintenance */}
                <div>
                  <label
                    htmlFor="last-maintenance"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Maintenance
                  </label>
                  <input
                    type="date"
                    id="last-maintenance"
                    value={resourceForm.lastMaintenance}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        lastMaintenance: e.target.value,
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Next Maintenance */}
                <div>
                  <label
                    htmlFor="next-maintenance"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Next Maintenance
                  </label>
                  <input
                    type="date"
                    id="next-maintenance"
                    value={resourceForm.nextMaintenance}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        nextMaintenance: e.target.value,
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="resource-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="resource-description"
                  rows="3"
                  value={resourceForm.description}
                  onChange={(e) =>
                    setResourceForm({
                      ...resourceForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddModal(false);
                  }}
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
                  ) : (
                    "Add Resource"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {showEditModal && selectedResource && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Edit2 className="h-5 w-5 text-blue-600 mr-2" />
              Edit Resource: {selectedResource.name}
            </h3>

            <form onSubmit={handleSaveResource} className="space-y-4">
              {/* Similar form fields as Add Resource Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Resource Name */}
                <div>
                  <label
                    htmlFor="edit-resource-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Resource Name
                  </label>
                  <input
                    type="text"
                    id="edit-resource-name"
                    value={resourceForm.name}
                    onChange={(e) =>
                      setResourceForm({ ...resourceForm, name: e.target.value })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Other fields similar to Add Modal */}
                {/* ... */}

                {/* Resource Type */}
                <div>
                  <label
                    htmlFor="edit-resource-type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Resource Type
                  </label>
                  <select
                    id="edit-resource-type"
                    value={resourceForm.type}
                    onChange={(e) =>
                      setResourceForm({ ...resourceForm, type: e.target.value })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    {resourceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label
                    htmlFor="edit-resource-quantity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="edit-resource-quantity"
                    min="1"
                    value={resourceForm.quantity}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        quantity: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="edit-resource-status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="edit-resource-status"
                    value={resourceForm.status}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        status: e.target.value,
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Allocation History */}
              {resourceForm.allocations &&
                resourceForm.allocations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Allocation History
                    </h4>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Dates
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Assigned To
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {resourceForm.allocations.map((allocation) => (
                            <tr key={allocation.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {allocation.location}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {allocation.quantity}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {new Date(
                                  allocation.startDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {allocation.endDate
                                  ? new Date(
                                      allocation.endDate
                                    ).toLocaleDateString()
                                  : "Ongoing"}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {allocation.assignedTo}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowEditModal(false);
                  }}
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
                  ) : (
                    "Update Resource"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedResource && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              Delete Resource
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedResource.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteResource}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="inline h-4 w-4 mr-1 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Resource"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Allocation Modal */}
      {allocateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Allocate Resource
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitAllocation({
                  location: e.target.location.value,
                  quantity: parseInt(e.target.quantity.value, 10),
                  startDate: e.target.startDate.value,
                  endDate: e.target.endDate.value || null,
                  assignedTo: e.target.assignedTo.value,
                  notes: e.target.notes.value,
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="allocation-location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="allocation-location"
                    name="location"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="allocation-quantity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="allocation-quantity"
                    name="quantity"
                    min="1"
                    defaultValue={1}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="allocation-start-date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="allocation-start-date"
                    name="startDate"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="allocation-end-date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    id="allocation-end-date"
                    name="endDate"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="allocation-assigned-to"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Assigned To
                  </label>
                  <input
                    type="text"
                    id="allocation-assigned-to"
                    name="assignedTo"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="allocation-notes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notes
                  </label>
                  <textarea
                    id="allocation-notes"
                    name="notes"
                    rows="3"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAllocateModalOpen(false)}
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
                      Processing...
                    </>
                  ) : (
                    "Allocate Resource"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceTracking;
