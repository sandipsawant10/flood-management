import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Droplets, 
  CheckCircle, 
  XCircle, 
  ThumbsUp, 
  ThumbsDown,
  Tag,
  CloudRain
} from "lucide-react";
import { floodReportService } from "../../services/floodReportService";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Fetch report data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["flood-report", id],
    queryFn: () => floodReportService.getReportById(id),
  });
  
  const report = data?.report;
  
  // Handle voting on report
  const handleVote = async (vote) => {
    try {
      await floodReportService.voteOnReport(id, vote);
      toast.success(`Report ${vote === 'up' ? 'confirmed' : 'disputed'} successfully`);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to vote on report");
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[severity] || colors.medium;
  };
  
  // Get verification status badge
  const getVerificationBadge = (status) => {
    const badges = {
      verified: "bg-green-100 text-green-800",
      disputed: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      false: "bg-gray-100 text-gray-800",
    };
    return badges[status] || badges.pending;
  };
  
  // Get verification icon
  const getVerificationIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "disputed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "false":
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading report details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <h3 className="font-bold">Error loading report</h3>
          <p>{error.message || "Failed to load report details"}</p>
          <button 
            onClick={() => navigate("/reports")} 
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          <h3 className="font-bold">Report Not Found</h3>
          <p>The requested flood report could not be found.</p>
          <button 
            onClick={() => navigate("/reports")} 
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/reports")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              Flood Report #{id?.slice(-6)?.toUpperCase()}
            </h1>
          </div>
          <div className={`px-3 py-1 rounded-full flex items-center ${getSeverityColor(report.severity)}`}>
            <span className="font-medium">{report.severity.toUpperCase()}</span>
          </div>
        </div>

        {/* Status and Verification */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className={`px-3 py-1 rounded-full flex items-center ${getVerificationBadge(report.verificationStatus)}`}>
            {getVerificationIcon(report.verificationStatus)}
            <span className="ml-1 font-medium capitalize">{report.verificationStatus}</span>
          </div>
          
          <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center">
            <Droplets className="w-4 h-4 mr-1" />
            <span className="font-medium capitalize">{report.waterLevel}</span>
          </div>
          
          <div className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span className="font-medium">Urgency: {report.urgencyLevel}/10</span>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Location and details */}
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-3">Location</h2>
              <div className="flex items-start text-gray-700 mb-2">
                <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">{report.location.district}, {report.location.state}</p>
                  {report.location.address && <p className="text-sm">{report.location.address}</p>}
                  {report.location.landmark && <p className="text-sm">Near: {report.location.landmark}</p>}
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-3">Report Details</h2>
              <div className="flex items-center text-gray-700 mb-2">
                <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Reported on {formatDate(report.createdAt)}</span>
              </div>
              
              {report.reportedBy && (
                <div className="flex items-center text-gray-700 mb-2">
                  <span className="mr-2">By:</span>
                  <span className="font-medium">{report.reportedBy.name || "Anonymous User"}</span>
                </div>
              )}
              
              {report.weatherConditions && (
                <div className="flex items-start text-gray-700 mb-2">
                  <CloudRain className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Weather Conditions</p>
                    {report.weatherConditions.rainfall && <p className="text-sm">Rainfall: {report.weatherConditions.rainfall} mm</p>}
                    {report.weatherConditions.temperature && <p className="text-sm">Temperature: {report.weatherConditions.temperature}°C</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {report.tags && report.tags.length > 0 && (
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {report.tags.map((tag, index) => (
                    <div key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      <span className="text-sm">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Description, Media, Community votes */}
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{report.description}</p>
            </div>

            {/* Media files */}
            {report.mediaFiles && report.mediaFiles.length > 0 && (
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold mb-3">Media</h2>
                <div className="grid grid-cols-2 gap-2">
                  {report.mediaFiles.map((media, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      {media.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img 
                          src={media} 
                          alt={`Flood report media ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      ) : media.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video 
                          src={media} 
                          controls 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">Unsupported media</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community verification */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Community Verification</h2>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div>
                  <div className="flex items-center">
                    <ThumbsUp className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium">{report.communityVotes?.upvotes || 0} confirmations</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <ThumbsDown className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-medium">{report.communityVotes?.downvotes || 0} disputes</span>
                  </div>
                </div>
                
                {user && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleVote('up')} 
                      className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg flex items-center"
                      disabled={report.communityVotes?.voters?.some(v => v.user === user._id)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Confirm
                    </button>
                    <button 
                      onClick={() => handleVote('down')} 
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg flex items-center"
                      disabled={report.communityVotes?.voters?.some(v => v.user === user._id)}
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      Dispute
                    </button>
                  </div>
                )}
              </div>
              
              {!user && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Please log in to confirm or dispute this report
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
