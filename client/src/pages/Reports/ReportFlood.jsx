import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  MapPin,
  Camera,
  AlertTriangle,
  Droplets,
  Upload,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { floodReportService } from "../../services/floodReportService";
import toast from "react-hot-toast";

const ReportFlood = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      location: {
        district: "",
        state: "",
        address: "",
        landmark: "",
        coordinates: [],
      },
      severity: "",
      waterLevel: "",
      depth: "", // Add new depth field
      description: "",
      urgencyLevel: 5,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [locationDetected, setLocationDetected] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const watchSeverity = watch("severity");
  const watchWaterLevel = watch("waterLevel");
  const watchUrgency = watch("urgencyLevel");
  const watchDepth = watch("depth");

  // Compute urgency automatically
  useEffect(() => {
    let urgency = 5;

    if (watchSeverity === "low") urgency = 3;
    else if (watchSeverity === "medium") urgency = 5;
    else if (watchSeverity === "high") urgency = 7;
    else if (watchSeverity === "critical") urgency = 10;

    if (watchWaterLevel === "ankle-deep") urgency = Math.max(urgency, 3);
    else if (watchWaterLevel === "knee-deep") urgency = Math.max(urgency, 5);
    else if (watchWaterLevel === "waist-deep") urgency = Math.max(urgency, 7);
    else if (watchWaterLevel === "chest-deep") urgency = Math.max(urgency, 9);
    else if (watchWaterLevel === "above-head") urgency = 10;

    setValue("urgencyLevel", urgency);
  }, [watchSeverity, watchWaterLevel, setValue]);

  // Automatically set depth based on waterLevel if depth is not manually entered
  useEffect(() => {
    if (!watchDepth) { // Only auto-fill if depth is not already set by the user
      let newDepth = "";
      if (watchWaterLevel === "ankle-deep") newDepth = 0.15;
      else if (watchWaterLevel === "knee-deep") newDepth = 0.5;
      else if (watchWaterLevel === "waist-deep") newDepth = 1.0;
      else if (watchWaterLevel === "chest-deep") newDepth = 2.0;
      else if (watchWaterLevel === "above-head") newDepth = 3.0;
      setValue("depth", newDepth);
    }
  }, [watchWaterLevel, watchDepth, setValue]);

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
      toast.error("Location is required for flood reporting");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("location[district]", data.location.district);
      formData.append("location[state]", data.location.state);
      formData.append("location[address]", data.location.address || "");
      formData.append("location[landmark]", data.location.landmark || "");
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

      formData.append("severity", data.severity);
      formData.append("waterLevel", data.waterLevel);
      formData.append("depth", data.depth || ""); // Add depth to form data
      formData.append("description", data.description);
      formData.append("urgencyLevel", data.urgencyLevel);

      uploadedFiles.forEach(({ file }) => {
        formData.append("media", file);
      });

      // Use floodReportService instead of direct fetch
      const response = await floodReportService.submitReport(formData);

      toast.success("Flood report submitted successfully!");
      navigate("/reports");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to submit report");
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <Droplets className="w-8 h-8 mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Report Flood Incident</h1>
            <p className="text-blue-100 mt-1">
              Help your community by reporting flood conditions
            </p>
          </div>
        </div>
        <div className="bg-blue-700/50 rounded-lg p-4">
          <div className="flex items-center text-blue-100">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="text-sm">
              Your report helps authorities respond quickly and keeps your
              community informed
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" /> Location Details
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specific Location / Landmark
            </label>
            <textarea
              {...register("location.address")}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the exact location or nearby landmarks"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetectingLocation}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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

        {/* Flood Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Droplets className="w-5 h-5 mr-2 text-blue-600" /> Flood
            Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity Level *
              </label>
              <select
                {...register("severity", { required: "Severity is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Severity</option>
                <option value="low">Low - Minor flooding</option>
                <option value="medium">Medium - Moderate flooding</option>
                <option value="high">High - Significant flooding</option>
                <option value="critical">Critical - Severe flooding</option>
              </select>
              {errors.severity && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.severity.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Water Level *
              </label>
              <select
                id="waterLevel"
                {...register("waterLevel", { required: true })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select water level</option>
                <option value="ankle-deep">Ankle-deep</option>
                <option value="knee-deep">Knee-deep</option>
                <option value="waist-deep">Waist-deep</option>
                <option value="chest-deep">Chest-deep</option>
                <option value="above-head">Above Head</option>
              </select>
              {errors.waterLevel && (
                <p className="mt-2 text-sm text-red-600">Water level is required.</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="depth" className="block text-sm font-medium text-gray-700">
              Water Depth (meters)
            </label>
            <input
              type="number"
              id="depth"
              step="0.01"
              min="0"
              {...register("depth", { valueAsNumber: true, min: 0 })}
              placeholder="Enter water depth in meters"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
            {errors.depth && (
              <p className="mt-2 text-sm text-red-600">Depth must be a positive number.</p>
            )}
          </div>

          {/* Urgency Slider */}
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
                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {watchUrgency}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the flood situation, affected areas, and current conditions..."
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
            <Camera className="w-5 h-5 mr-2 text-blue-600" /> Photos & Videos
          </h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
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
          className="w-full py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
};

export default ReportFlood;
