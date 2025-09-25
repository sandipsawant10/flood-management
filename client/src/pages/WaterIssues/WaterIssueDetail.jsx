import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Droplet,
  MapPin,
  Calendar,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  User,
  CheckCircle,
  XCircle,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Construction,
  Clock,
  Phone,
  HelpCircle,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { waterIssueService } from "../../services/waterIssueService";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const WaterIssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingVote, setLoadingVote] = useState(false);
  const [showMunicipalityResponseForm, setShowMunicipalityResponseForm] =
    useState(false);
  const [municipalityResponse, setMunicipalityResponse] = useState({
    message: "",
    estimatedFixTime: "",
    actionTaken: "",
    contactPerson: "",
    contactNumber: "",
  });
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Fetch issue details
  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        const response = await waterIssueService.getIssueById(id);
        setIssue(response.data);
      } catch (err) {
        console.error("Error fetching water issue:", err);
        setError(
          err.response?.data?.message || "Failed to load water issue details"
        );
        toast.error("Failed to load water issue details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIssue();
    }
  }, [id]);

  // Handle vote
  const handleVote = async (voteType) => {
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }

    try {
      setLoadingVote(true);
      const response = await waterIssueService.voteOnIssue(id, voteType);

      // Update vote count in the local state
      setIssue((prev) => ({
        ...prev,
        communityVotes: {
          ...prev.communityVotes,
          upvotes: response.data.upvotes,
          downvotes: response.data.downvotes,
        },
      }));

      toast.success(response.message);
    } catch (err) {
      console.error("Error voting:", err);
      toast.error(
        err.response?.data?.message || "Failed to register your vote"
      );
    } finally {
      setLoadingVote(false);
    }
  };

  // Handle municipality response form input
  const handleMunicipalityResponseChange = (e) => {
    const { name, value } = e.target;
    setMunicipalityResponse((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit municipality response
  const handleSubmitMunicipalityResponse = async (e) => {
    e.preventDefault();
    if (!user || (user.role !== "admin" && user.role !== "municipal")) {
      toast.error("You don't have permission to add a municipality response");
      return;
    }

    try {
      setSubmittingResponse(true);
      const response = await waterIssueService.addMunicipalityResponse(
        id,
        municipalityResponse
      );

      // Update the issue with the new response
      setIssue((prev) => ({
        ...prev,
        municipalityResponse: response.data.municipalityResponse,
        status: response.data.status,
      }));

      setShowMunicipalityResponseForm(false);
      toast.success("Municipality response added successfully");
    } catch (err) {
      console.error("Error adding municipality response:", err);
      toast.error(
        err.response?.data?.message || "Failed to add municipality response"
      );
    } finally {
      setSubmittingResponse(false);
    }
  };

  // Format issue type for display
  const formatIssueType = (issueType) => {
    const types = {
      "supply-interruption": "Water Supply Interruption",
      "low-pressure": "Low Water Pressure",
      "water-quality": "Poor Water Quality",
      contamination: "Water Contamination",
      leakage: "Water Leakage",
      infrastructure: "Infrastructure Problem",
      other: "Other Water Issue",
    };

    return types[issueType] || issueType;
  };

  // Format status for display
  const formatStatus = (status) => {
    const statusDisplay = {
      reported: "Reported",
      "under-investigation": "Under Investigation",
      acknowledged: "Acknowledged",
      "in-progress": "In Progress",
      scheduled: "Scheduled",
      resolved: "Resolved",
      closed: "Closed",
    };

    return statusDisplay[status] || status;
  };

  // Render issue status badge
  const renderStatusBadge = (status) => {
    const statusClasses = {
      reported: "bg-blue-100 text-blue-800",
      "under-investigation": "bg-purple-100 text-purple-800",
      acknowledged: "bg-indigo-100 text-indigo-800",
      "in-progress": "bg-amber-100 text-amber-800",
      scheduled: "bg-cyan-100 text-cyan-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {formatStatus(status)}
      </span>
    );
  };

  // Check if user is admin or municipal
  const isMunicipalityUser =
    user && (user.role === "admin" || user.role === "municipal");

  // Check if current user is the reporter
  const isReporter = user && issue?.reportedBy?._id === user.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
        <span className="ml-2 text-gray-600">
          Loading water issue details...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
        <Link
          to="/water-issues"
          className="flex items-center text-cyan-600 hover:text-cyan-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Water Issues
        </Link>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Water issue not found</span>
          </div>
        </div>
        <Link
          to="/water-issues"
          className="flex items-center text-cyan-600 hover:text-cyan-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Water Issues
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          to="/water-issues"
          className="flex items-center text-cyan-600 hover:text-cyan-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Water Issues
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Droplet className="w-6 h-6" />
                <h1 className="text-2xl font-bold">
                  {formatIssueType(issue.issueType)}
                </h1>
              </div>
              <div className="flex items-center space-x-3 text-sm text-blue-100">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>
                    {issue.location.district}, {issue.location.state}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{format(new Date(issue.createdAt), "PPP")}</span>
                </div>
              </div>
            </div>
            <div>{renderStatusBadge(issue.status)}</div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {/* Issue description */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {issue.description}
                </p>
              </div>

              {/* Issue details */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Issue Details
                </h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Severity
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">
                        {issue.severity}
                      </dd>
                    </div>

                    {issue.issueDetails?.duration && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Duration
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 capitalize">
                          {issue.issueDetails.duration.replace(/-/g, " ")}
                        </dd>
                      </div>
                    )}

                    {issue.issueDetails?.frequency && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Frequency
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 capitalize">
                          {issue.issueDetails.frequency.replace(/-/g, " ")}
                        </dd>
                      </div>
                    )}

                    {issue.issueDetails?.colorAbnormality &&
                      issue.issueDetails.colorAbnormality !== "none" && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Water Color
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 capitalize">
                            {issue.issueDetails.colorAbnormality}
                          </dd>
                        </div>
                      )}

                    {issue.issueDetails?.infrastructureType && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Infrastructure Type
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 capitalize">
                          {issue.issueDetails.infrastructureType}
                        </dd>
                      </div>
                    )}

                    {issue.issueDetails?.affectedPopulation && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Affected Area
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 capitalize">
                          {issue.issueDetails.affectedPopulation.replace(
                            /-/g,
                            " "
                          )}
                        </dd>
                      </div>
                    )}

                    {issue.issueDetails?.odorAbnormality === true && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Odor Issues
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">Yes</dd>
                      </div>
                    )}

                    {issue.issueDetails?.tasteAbnormality === true && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Taste Issues
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">Yes</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Location details */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Location Details
                </h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        District
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {issue.location.district}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        State
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {issue.location.state}
                      </dd>
                    </div>
                    {issue.location.municipalWard && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Municipality Ward
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {issue.location.municipalWard}
                        </dd>
                      </div>
                    )}
                    {issue.location.address && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">
                          Address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {issue.location.address}
                        </dd>
                      </div>
                    )}
                    {issue.location.landmark && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">
                          Landmark
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {issue.location.landmark}
                        </dd>
                      </div>
                    )}
                    {issue.location?.coordinates?.length === 2 && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">
                          Coordinates
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {issue.location.coordinates[1]},{" "}
                          {issue.location.coordinates[0]}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Municipality Response (if any) */}
              {issue.municipalityResponse?.respondedAt && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h2 className="text-lg font-medium text-blue-800 mb-2 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Municipality Response
                  </h2>
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      {issue.municipalityResponse.message}
                    </p>

                    {issue.municipalityResponse.actionTaken && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">
                          Action Taken:
                        </h3>
                        <p className="text-sm text-gray-600">
                          {issue.municipalityResponse.actionTaken}
                        </p>
                      </div>
                    )}

                    {issue.municipalityResponse.estimatedFixTime && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1 text-blue-500" />
                        <span>
                          Estimated Fix:{" "}
                          {format(
                            new Date(
                              issue.municipalityResponse.estimatedFixTime
                            ),
                            "PPP"
                          )}
                        </span>
                      </div>
                    )}

                    {(issue.municipalityResponse.contactPerson ||
                      issue.municipalityResponse.contactNumber) && (
                      <div className="bg-white rounded p-3 mt-3">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">
                          Contact Information:
                        </h3>
                        {issue.municipalityResponse.contactPerson && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <User className="w-4 h-4 mr-1 text-gray-400" />
                            {issue.municipalityResponse.contactPerson}
                          </p>
                        )}
                        {issue.municipalityResponse.contactNumber && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Phone className="w-4 h-4 mr-1 text-gray-400" />
                            {issue.municipalityResponse.contactNumber}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        Response added{" "}
                        {format(
                          new Date(issue.municipalityResponse.respondedAt),
                          "PPP"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Municipality Response Form (for admin/municipal users) */}
              {isMunicipalityUser &&
                !issue.municipalityResponse?.respondedAt && (
                  <div className="mt-6">
                    {!showMunicipalityResponseForm ? (
                      <button
                        onClick={() => setShowMunicipalityResponseForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Municipality Response
                      </button>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                          Add Municipality Response
                        </h2>
                        <form onSubmit={handleSubmitMunicipalityResponse}>
                          <div className="space-y-4">
                            <div>
                              <label
                                htmlFor="message"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Response Message*
                              </label>
                              <textarea
                                id="message"
                                name="message"
                                rows={3}
                                value={municipalityResponse.message}
                                onChange={handleMunicipalityResponseChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                placeholder="Enter response from municipality..."
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="actionTaken"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Action Taken
                              </label>
                              <textarea
                                id="actionTaken"
                                name="actionTaken"
                                rows={2}
                                value={municipalityResponse.actionTaken}
                                onChange={handleMunicipalityResponseChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                placeholder="Describe actions being taken..."
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="estimatedFixTime"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Estimated Fix Date
                              </label>
                              <input
                                type="date"
                                id="estimatedFixTime"
                                name="estimatedFixTime"
                                value={municipalityResponse.estimatedFixTime}
                                onChange={handleMunicipalityResponseChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label
                                  htmlFor="contactPerson"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Contact Person
                                </label>
                                <input
                                  type="text"
                                  id="contactPerson"
                                  name="contactPerson"
                                  value={municipalityResponse.contactPerson}
                                  onChange={handleMunicipalityResponseChange}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                  placeholder="Name of contact person"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor="contactNumber"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Contact Number
                                </label>
                                <input
                                  type="text"
                                  id="contactNumber"
                                  name="contactNumber"
                                  value={municipalityResponse.contactNumber}
                                  onChange={handleMunicipalityResponseChange}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                  placeholder="Phone number"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setShowMunicipalityResponseForm(false)
                                }
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={submittingResponse}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
                              >
                                {submittingResponse ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                  </>
                                ) : (
                                  "Submit Response"
                                )}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

              {/* Media Gallery (if any) */}
              {issue.mediaFiles && issue.mediaFiles.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Media
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {issue.mediaFiles.map((url, index) => (
                      <div
                        key={index}
                        className="rounded-lg overflow-hidden bg-gray-100 aspect-w-1 aspect-h-1"
                      >
                        {url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={url}
                              alt={`Media ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ) : (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <video
                              src={url}
                              className="w-full h-full object-cover"
                              controls
                            />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Community votes */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-md font-medium text-gray-900 mb-3">
                  Community Feedback
                </h2>
                <div className="flex items-center justify-center space-x-8">
                  <button
                    onClick={() => handleVote("up")}
                    disabled={loadingVote}
                    className="flex flex-col items-center text-gray-700 hover:text-green-600 transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp className="w-8 h-8 mb-1" />
                    <span className="text-xl font-semibold">
                      {issue.communityVotes?.upvotes || 0}
                    </span>
                    <span className="text-xs">Agree</span>
                  </button>
                  <button
                    onClick={() => handleVote("down")}
                    disabled={loadingVote}
                    className="flex flex-col items-center text-gray-700 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    <ThumbsDown className="w-8 h-8 mb-1" />
                    <span className="text-xl font-semibold">
                      {issue.communityVotes?.downvotes || 0}
                    </span>
                    <span className="text-xs">Disagree</span>
                  </button>
                </div>
                {loadingVote && (
                  <div className="flex justify-center mt-2">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
                  </div>
                )}
                {!user && (
                  <div className="text-center mt-2 text-xs text-gray-500">
                    Sign in to vote on this issue
                  </div>
                )}
              </div>

              {/* Verification Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-md font-medium text-gray-900 mb-2">
                  Verification Status
                </h2>
                <div className="flex items-center mb-2">
                  {issue.verificationStatus === "verified" ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : issue.verificationStatus === "disputed" ||
                    issue.verificationStatus === "false" ? (
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  ) : (
                    <HelpCircle className="w-5 h-5 text-amber-600 mr-2" />
                  )}
                  <span className="capitalize">{issue.verificationStatus}</span>
                </div>
                {issue.verificationNotes && (
                  <div className="text-sm text-gray-600 border-t border-gray-100 pt-2 mt-2">
                    <p className="italic">{issue.verificationNotes}</p>
                  </div>
                )}
              </div>

              {/* Reported By */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-md font-medium text-gray-900 mb-2">
                  Reported By
                </h2>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-cyan-600 flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {issue.reportedBy?.name || "Anonymous User"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(issue.createdAt), "PPpp")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-md font-medium text-gray-900 mb-3">
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  {isReporter && (
                    <Link
                      to={`/water-issues/edit/${issue._id}`}
                      className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Edit Report
                    </Link>
                  )}

                  <Link
                    to="/water-issues/report"
                    className="flex items-center justify-center w-full px-4 py-2 text-sm text-white bg-cyan-600 rounded-md hover:bg-cyan-700"
                  >
                    Report New Issue
                  </Link>

                  {isMunicipalityUser &&
                    issue.status !== "resolved" &&
                    issue.status !== "closed" &&
                    !issue.municipalityResponse?.respondedAt && (
                      <button
                        onClick={() => setShowMunicipalityResponseForm(true)}
                        className="flex items-center justify-center w-full px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Respond as Municipality
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterIssueDetail;
