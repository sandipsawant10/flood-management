import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFinancialAidRequests,
  reviewFinancialAidRequest,
} from "../../services/financialAid";
import { toast } from "react-hot-toast";

const FinancialAidRequests = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewComment, setReviewComment] = useState("");

  const { data: financialAidData, isLoading } = useQuery({
    queryKey: ["financialAidRequests"],
    queryFn: getFinancialAidRequests,
  });

  // Extract requests from the API response structure
  const requests = financialAidData?.data?.requests || [];

  const reviewMutation = useMutation({
    mutationFn: ({ requestId, reviewData }) =>
      reviewFinancialAidRequest(requestId, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries(["financialAidRequests"]);
      toast.success("Request reviewed successfully");
      setSelectedRequest(null);
      setReviewComment("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to review request");
    },
  });

  const handleReview = (status) => {
    if (!selectedRequest) return;
    reviewMutation.mutate({
      requestId: selectedRequest._id,
      reviewData: { status, reviewComment },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Financial Aid Requests</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Requests List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Pending Requests</h2>
          </div>
          <div className="divide-y">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div
                  key={request._id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedRequest?._id === request._id
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {request.applicant?.name || "Unknown Applicant"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Amount: PHP{" "}
                        {request.amountRequested?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {request.reason || "No reason provided"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted:{" "}
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleDateString()
                      : "Unknown date"}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No financial aid requests found</p>
              </div>
            )}
          </div>
        </div>

        {/* Review Panel */}
        {selectedRequest && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Review Request</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Comment
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Add your review comments here"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleReview("approved")}
                  disabled={reviewMutation.isPending}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReview("rejected")}
                  disabled={reviewMutation.isPending}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default FinancialAidRequests;
