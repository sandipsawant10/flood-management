import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Calendar,
  Users,
  Droplets,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  ExternalLink,
  Loader2,
  Search,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const ViewReports = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // React Query v5 object syntax
  const {
    data: reportsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "flood-reports",
      searchTerm,
      selectedState,
      selectedSeverity,
      selectedStatus,
      sortBy,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedState) params.append("state", selectedState);
      if (selectedSeverity) params.append("severity", selectedSeverity);
      if (selectedStatus) params.append("status", selectedStatus);
      params.append("sortBy", sortBy);
      params.append("limit", "20");

      const response = await fetch(`/api/flood-reports?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch reports");
      return response.json();
    },
  });

  const reports = reportsData?.data || [];

  const handleValidation = async (reportId, action) => {
    try {
      const response = await fetch(`/api/flood-reports/${reportId}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error("Failed to validate report");

      toast.success(
        `Report ${action === "upvote" ? "upvoted" : "downvoted"} successfully`
      );
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      critical: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[severity] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "disputed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const indianStates = [
    "Andhra Pradesh",
    "Assam",
    "Bihar",
    "Gujarat",
    "Karnataka",
    "Kerala",
    "Maharashtra",
    "Odisha",
    "Tamil Nadu",
    "West Bengal",
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header, Filters, and Reports List JSX unchanged */}
    </div>
  );
};

export default ViewReports;
