import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  MapPin,
  Camera,
  AlertTriangle,
  Droplet,
  Upload,
  X,
  Loader2,
  CheckCircle,
  Construction,
  AlertCircle,
  Activity,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { waterIssueService } from "../../services/waterIssueService";
import toast from "react-hot-toast";

const WaterIssueReport = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      location: {
        district: "",
        state: "",
        address: "",
        landmark: "",
        municipalWard: "",
        coordinates: [],
      },
      issueType: "",
      issueDetails: {
        duration: "",
        frequency: "",
        colorAbnormality: "none",
        odorAbnormality: false,
        tasteAbnormality: false,
        infrastructureType: "",
        affectedPopulation: "",
      },
      severity: "",
      description: "",
      urgencyLevel: 5,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [locationDetected, setLocationDetected] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showDynamicFields, setShowDynamicFields] = useState(false);

  const watchIssueType = watch("issueType");
  const watchSeverity = watch("severity");
  const watchUrgency = watch("urgencyLevel");

  // Show/hide specific fields based on issue type
  useEffect(() => {
    if (watchIssueType) {
      setShowDynamicFields(true);
    } else {
      setShowDynamicFields(false);
    }

    // Reset issue-specific fields when issue type changes
    if (watchIssueType) {
      const resetFields = {
        duration: "",
        frequency: "",
        colorAbnormality: "none",
        odorAbnormality: false,
        tasteAbnormality: false,
        infrastructureType: "",
      };

      Object.entries(resetFields).forEach(([key, value]) => {
        setValue(`issueDetails.${key}`, value);
      });
    }
  }, [watchIssueType, setValue]);

  // Compute urgency automatically
  useEffect(() => {
    let urgency = 5;

    // Base urgency on severity
    if (watchSeverity === "low") urgency = 3;
    else if (watchSeverity === "medium") urgency = 5;
    else if (watchSeverity === "high") urgency = 7;
    else if (watchSeverity === "critical") urgency = 10;

    // Adjust based on issue type
    if (watchIssueType === "contamination") {
      urgency = Math.min(10, urgency + 2); // Water contamination is serious
    } else if (watchIssueType === "water-quality") {
      urgency = Math.min(10, urgency + 1);
    }

    setValue("urgencyLevel", urgency);
  }, [watchSeverity, watchIssueType, setValue]);

  // File uploads
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    toast.success(`${acceptedFiles.length} file(s) added`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      "video/*": [".mp4", ".webm", ".ogg"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter((f) => f.id !== fileId);
    });
  };

  // Detect location
  const detectLocation = () => {
    setIsDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setValue("location.coordinates", [longitude, latitude]);
          setLocationDetected(true);
          setIsDetectingLocation(false);
          toast.success("Location detected successfully!");
        },
        () => {
          setIsDetectingLocation(false);
          toast.error("Unable to detect location. Please enter manually.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setIsDetectingLocation(false);
      toast.error("Geolocation not supported by browser");
    }
  };

  // Submit
  const onSubmit = async (data) => {
    if (!data.location.coordinates?.length) {
      toast.error("Location is required for water issue reporting");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      // Location details
      formData.append("location[district]", data.location.district);
      formData.append("location[state]", data.location.state);
      formData.append("location[address]", data.location.address || "");
      formData.append("location[landmark]", data.location.landmark || "");
      formData.append(
        "location[municipalWard]",
        data.location.municipalWard || ""
      );

      if (data.location.coordinates?.length === 2) {
        formData.append(
          "location[coordinates][]",
          data.location.coordinates[0]
        );
        formData.append(
          "location[coordinates][]",
          data.location.coordinates[1]
        );
      }

      // Issue details
      formData.append("issueType", data.issueType);
      formData.append("severity", data.severity);
      formData.append("description", data.description);
      formData.append("urgencyLevel", data.urgencyLevel);

      // Issue-specific details
      if (
        data.issueType === "supply-interruption" ||
        data.issueType === "low-pressure"
      ) {
        if (data.issueDetails.duration)
          formData.append("issueDetails[duration]", data.issueDetails.duration);
        if (data.issueDetails.frequency)
          formData.append(
            "issueDetails[frequency]",
            data.issueDetails.frequency
          );
      }

      if (
        data.issueType === "water-quality" ||
        data.issueType === "contamination"
      ) {
        formData.append(
          "issueDetails[colorAbnormality]",
          data.issueDetails.colorAbnormality || "none"
        );
        formData.append(
          "issueDetails[odorAbnormality]",
          data.issueDetails.odorAbnormality || false
        );
        formData.append(
          "issueDetails[tasteAbnormality]",
          data.issueDetails.tasteAbnormality || false
        );
      }

      if (data.issueType === "infrastructure" || data.issueType === "leakage") {
        if (data.issueDetails.infrastructureType)
          formData.append(
            "issueDetails[infrastructureType]",
            data.issueDetails.infrastructureType
          );
      }

      if (data.issueDetails.affectedPopulation)
        formData.append(
          "issueDetails[affectedPopulation]",
          data.issueDetails.affectedPopulation
        );

      // Media files
      uploadedFiles.forEach(({ file }) => {
        formData.append("media", file);
      });

      // Submit to API
      const response = await waterIssueService.submitReport(formData);

      toast.success("Water issue report submitted successfully!");

      // Reset form and redirect
      reset();
      setUploadedFiles([]);
      navigate("/water-issues");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit report"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <Droplet className="w-8 h-8 mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Report Water Issue</h1>
            <p className="text-blue-100 mt-1">
              Help improve water services in your community
            </p>
          </div>
        </div>
        <div className="bg-blue-700/50 rounded-lg p-4">
          <div className="flex items-center text-blue-100">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="text-sm">
              Report water supply interruptions, quality issues, or
              infrastructure problems
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-cyan-600" /> Location Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District *
              </label>
              <input
                {...register("location.district", {
                  required: "District is required",
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter district name"
              />
              {errors.location?.district && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.location.district.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <select
                {...register("location.state", {
                  required: "State is required",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Select State</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.location?.state && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.location.state.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Municipality Ward/Zone
              </label>
              <input
                {...register("location.municipalWard")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter your municipal ward or zone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Landmark
              </label>
              <input
                {...register("location.landmark")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Nearby landmark or reference point"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Address
            </label>
            <textarea
              {...register("location.address")}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Enter your complete address"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetectingLocation}
              className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
            >
              {isDetectingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Detecting...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" /> Detect My Location
                </>
              )}
            </button>
            {locationDetected && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">Location detected</span>
              </div>
            )}
          </div>
        </div>

        {/* Water Issue Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Droplet className="w-5 h-5 mr-2 text-cyan-600" /> Water Issue
            Details
          </h2>

          {/* Issue Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Type *
            </label>
            <select
              {...register("issueType", { required: "Issue type is required" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Select Issue Type</option>
              <option value="supply-interruption">
                Water Supply Interruption
              </option>
              <option value="low-pressure">Low Water Pressure</option>
              <option value="water-quality">Poor Water Quality</option>
              <option value="contamination">Water Contamination</option>
              <option value="leakage">Water Leakage</option>
              <option value="infrastructure">Infrastructure Problem</option>
              <option value="other">Other Water Issue</option>
            </select>
            {errors.issueType && (
              <p className="text-red-600 text-sm mt-1">
                {errors.issueType.message}
              </p>
            )}
          </div>

          {/* Dynamic fields based on issue type */}
          {showDynamicFields && (
            <div className="mb-4">
              {/* Supply Interruption & Low Pressure */}
              {(watchIssueType === "supply-interruption" ||
                watchIssueType === "low-pressure") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <select
                      {...register("issueDetails.duration")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Select Duration</option>
                      <option value="hours">Few Hours</option>
                      <option value="day">One Day</option>
                      <option value="2-3-days">2-3 Days</option>
                      <option value="week">One Week</option>
                      <option value="more-than-week">More than a Week</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <select
                      {...register("issueDetails.frequency")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Select Frequency</option>
                      <option value="first-time">First Time</option>
                      <option value="occasional">Occasional</option>
                      <option value="frequent">Frequent</option>
                      <option value="persistent">Persistent (Daily)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Water Quality & Contamination */}
              {(watchIssueType === "water-quality" ||
                watchIssueType === "contamination") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Water Color
                    </label>
                    <select
                      {...register("issueDetails.colorAbnormality")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="none">Normal</option>
                      <option value="brown">Brown/Muddy</option>
                      <option value="yellow">Yellowish</option>
                      <option value="cloudy">Cloudy/Milky</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="odorAbnormality"
                        {...register("issueDetails.odorAbnormality")}
                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                      />
                      <label
                        htmlFor="odorAbnormality"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Unusual Odor/Smell
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="tasteAbnormality"
                        {...register("issueDetails.tasteAbnormality")}
                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                      />
                      <label
                        htmlFor="tasteAbnormality"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Unusual Taste
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Infrastructure & Leakage */}
              {(watchIssueType === "infrastructure" ||
                watchIssueType === "leakage") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Infrastructure Type
                  </label>
                  <select
                    {...register("issueDetails.infrastructureType")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="pipe">Water Pipe</option>
                    <option value="valve">Valve/Tap</option>
                    <option value="hydrant">Hydrant</option>
                    <option value="tank">Water Tank</option>
                    <option value="pump">Pump/Motor</option>
                    <option value="meter">Water Meter</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {/* Common for all issues */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Affected Population
                </label>
                <select
                  {...register("issueDetails.affectedPopulation")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Select Affected Area</option>
                  <option value="household">Single Household</option>
                  <option value="building">Building/Apartment</option>
                  <option value="street">Street</option>
                  <option value="neighborhood">Neighborhood</option>
                  <option value="area">Large Area</option>
                  <option value="entire-locality">Entire Locality</option>
                </select>
              </div>
            </div>
          )}

          {/* Severity & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity Level *
              </label>
              <select
                {...register("severity", { required: "Severity is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Select Severity</option>
                <option value="low">Low - Minor inconvenience</option>
                <option value="medium">Medium - Significant disruption</option>
                <option value="high">High - Major problem</option>
                <option value="critical">
                  Critical - Urgent health hazard
                </option>
              </select>
              {errors.severity && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.severity.message}
                </p>
              )}
            </div>

            {/* Urgency Slider (Auto-calculated) */}
            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgency Level
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="10"
                  {...register("urgencyLevel")}
                  value={watchUrgency}
                  readOnly
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed"
                />
                <div
                  className="absolute -top-6 left-0 transform"
                  style={{ left: `${((watchUrgency || 5) - 1) * 10}%` }}
                >
                  <div className="bg-cyan-600 text-white text-xs px-2 py-1 rounded-full">
                    {watchUrgency}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters",
                },
              })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Please describe the water issue in detail..."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Media Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Camera className="w-5 h-5 mr-2 text-cyan-600" /> Photos & Videos
          </h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-cyan-400 bg-cyan-50"
                : "border-gray-300 hover:border-cyan-400 hover:bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-cyan-600">Drop the files here...</p>
            ) : (
              <>
                <p className="text-gray-600 mb-2">
                  Drag & drop photos or videos here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JPG, PNG, MP4, WebM (Max 10MB each)
                </p>
              </>
            )}
          </div>
          {uploadedFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedFiles.map(({ id, file, preview }) => (
                <div key={id} className="relative group">
                  <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-100">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={preview}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(id)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-cyan-600 text-white rounded-lg text-lg font-medium hover:bg-cyan-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Submitting...</span>
            </div>
          ) : (
            "Submit Water Issue Report"
          )}
        </button>
      </form>
    </div>
  );
};

export default WaterIssueReport;
