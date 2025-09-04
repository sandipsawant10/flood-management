import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, AlertTriangle } from "lucide-react";

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">
            Flood Report #{id?.slice(-6)?.toUpperCase()}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              <span>Location information loading...</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Report details loading...</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            <strong>Note:</strong> Report detail functionality is being
            developed. This page will show complete flood report information
            including photos, community votes, and verification status.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
