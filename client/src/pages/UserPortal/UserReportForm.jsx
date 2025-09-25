import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  MapPin,
  ImagePlus,
  Info,
  CheckCircle,
  ArrowLeft,
  Loader,
  Camera,
  Trash,
  X,
  Ruler,
  CloudRain,
  Wind,
  Users,
  Home,
  Road,
  DollarSign,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { floodReportService } from "../../services/floodReportService";
import MapSelector from "./MapSelector";

// Fix missing Droplets icon
const Droplets = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c0 0-2.25 1.94-2.25 7c0 2.22 1.8 4 4.25 4z" />
    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
  </svg>
);

const UserReportForm = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Form state handling with React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    control,
    reset,
  } = useForm({
    defaultValues: {
      location: {
        latitude: user?.location?.coordinates?.[1] || "",
        longitude: user?.location?.coordinates?.[0] || "",
        address: user?.location?.address || "",
        district: user?.location?.district || "",
        state: user?.location?.state || "",
        landmark: "",
      },
      severity: "medium",
      waterLevel: "medium",
      depth: "",
      description: "",
      mediaFiles: [],
      impact: {
        affectedPeople: "",
        damagedProperties: "",
        blockedRoads: [],
        economicLoss: "",
      },
      tags: [],
    },
  });

  // State for media preview
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);

  // Watch form values for validation
  const watchSeverity = watch("severity");
  const watchWaterLevel = watch("waterLevel");
  const watchDepth = watch("depth");
  const watchLocation = watch("location");

  // Set location from user profile when component mounts
  useEffect(() => {
    if (user?.location) {
      setValue("location.latitude", user.location.coordinates[1]);
      setValue("location.longitude", user.location.coordinates[0]);
      setValue("location.address", user.location.address);
      setValue("location.district", user.location.district);
      setValue("location.state", user.location.state);
    }
  }, [user, setValue]);

  // Update depth when water level changes and depth is empty
  useEffect(() => {
    if (watchWaterLevel && !watchDepth) {
      // Provide a default depth based on selected water level
      const depthMap = {
        low: "0.3", // ankle deep
        medium: "0.75", // knee deep
        high: "1.5", // waist deep
        critical: "2.5", // chest or above
      };
      setValue("depth", depthMap[watchWaterLevel] || "");
    }
  }, [watchWaterLevel, watchDepth, setValue]);

  // Generate severity description based on selection
  const getSeverityDescription = (severity) => {
    const descriptions = {
      low: "Minor flooding with limited impact",
      medium: "Moderate flooding affecting local areas",
      high: "Significant flooding with widespread impact",
      critical: "Severe flooding with potential life-threatening conditions",
    };
    return descriptions[severity] || "";
  };

  // Generate water level description based on selection
  const getWaterLevelDescription = (level) => {
    const descriptions = {
      low: "Ankle deep (0.1-0.5m)",
      medium: "Knee deep (0.5-1m)",
      high: "Waist deep (1-1.5m)",
      critical: "Chest or above (>1.5m)",
    };
    return descriptions[level] || "";
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + mediaFiles.length > 5) {
      alert("You can upload a maximum of 5 images");
      return;
    }

    setMediaFiles((prev) => [...prev, ...files]);

    // Generate preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  // Remove a media file
  const removeMedia = (index) => {
    const newMediaFiles = [...mediaFiles];
    const newPreviewUrls = [...previewUrls];

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);

    newMediaFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);

    setMediaFiles(newMediaFiles);
    setPreviewUrls(newPreviewUrls);
  };

  // Handle location selection from map
  const handleLocationSelect = (lat, lng, address) => {
    setValue("location.latitude", lat);
    setValue("location.longitude", lng);
    setValue("location.address", address);
    setMapVisible(false);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("location.latitude", position.coords.latitude);
          setValue("location.longitude", position.coords.longitude);

          // Optionally: Use reverse geocoding to get the address
          // For simplicity, we'll skip this step for now
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Couldn't get your location. Please enter it manually.");
          setUseCurrentLocation(false);
        }
      );
    } else {
      alert(
        "Geolocation is not supported by your browser. Please enter location manually."
      );
      setUseCurrentLocation(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setUploadProgress(10);

      // Create form data
      const formData = new FormData();

      // Add basic fields
      formData.append("severity", data.severity);
      formData.append("waterLevel", data.waterLevel);
      formData.append("depth", data.depth);
      formData.append("description", data.description);

      // Add location data
      formData.append("location[type]", "Point");
      formData.append("location[coordinates][0]", data.location.longitude);
      formData.append("location[coordinates][1]", data.location.latitude);
      formData.append("location[address]", data.location.address);
      formData.append("location[district]", data.location.district);
      formData.append("location[state]", data.location.state);
      formData.append("location[landmark]", data.location.landmark || "");

      // Add impact data if available
      if (data.impact.affectedPeople) {
        formData.append("impact[affectedPeople]", data.impact.affectedPeople);
      }
      if (data.impact.damagedProperties) {
        formData.append(
          "impact[damagedProperties]",
          data.impact.damagedProperties
        );
      }
      if (data.impact.blockedRoads && data.impact.blockedRoads.length) {
        data.impact.blockedRoads.forEach((road, index) => {
          formData.append(`impact[blockedRoads][${index}]`, road);
        });
      }
      if (data.impact.economicLoss) {
        formData.append("impact[economicLoss]", data.impact.economicLoss);
      }

      // Add tags if available
      if (data.tags && data.tags.length) {
        data.tags.forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag);
        });
      }

      // Add media files
      mediaFiles.forEach((file) => {
        formData.append("media", file);
      });

      setUploadProgress(30);

      // Submit the report
      await floodReportService.submitReport(formData);

      setUploadProgress(100);
      setSubmissionSuccess(true);

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries(["flood-reports-map"]);
      queryClient.invalidateQueries(["user-reports"]);

      // Reset form
      reset();
      setMediaFiles([]);
      setPreviewUrls([]);

      // Redirect after short delay
      setTimeout(() => {
        navigate("/portal/reports");
      }, 2000);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
      setUploadProgress(0);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-green-700 mb-2">
          Report Submitted Successfully!
        </h2>
        <p className="text-gray-600 mb-6">
          Thank you for your contribution to community safety.
        </p>
        <button
          onClick={() => navigate("/portal/reports")}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          View Your Reports
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/portal")}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <h1 className="text-xl font-bold text-center flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          Report Flood Incident
        </h1>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <div className="flex flex-col items-center">
              <Loader className="w-8 h-8 text-primary-600 animate-spin mb-4" />
              <h3 className="text-lg font-medium mb-2">Submitting Report...</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-primary-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                Please wait while we upload your report and media.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Location Section */}
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium flex items-center">
              <MapPin className="w-5 h-5 text-primary-600 mr-2" />
              Location Information
            </h2>
            <button
              type="button"
              onClick={() => setMapVisible(!mapVisible)}
              className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
            >
              {mapVisible ? "Hide Map" : "Show Map"}
            </button>
          </div>

          {mapVisible && (
            <div className="h-64 mb-4 rounded-lg overflow-hidden border border-gray-300">
              <MapSelector
                initialLocation={[
                  watchLocation.latitude || 20.5937,
                  watchLocation.longitude || 78.9629,
                ]}
                onLocationSelect={handleLocationSelect}
              />
            </div>
          )}

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="useCurrentLocation"
              checked={useCurrentLocation}
              onChange={(e) => setUseCurrentLocation(e.target.checked)}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="useCurrentLocation"
              className="ml-2 block text-sm text-gray-700"
            >
              Use my current location
            </label>
            {useCurrentLocation && (
              <button
                type="button"
                onClick={getCurrentLocation}
                className="ml-auto text-sm bg-primary-600 text-white px-3 py-1 rounded-md hover:bg-primary-700 transition-colors"
              >
                Detect Location
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="text"
                {...register("location.latitude", {
                  required: "Latitude is required",
                  pattern: {
                    value: /^-?[0-9]\d*(\.\d+)?$/,
                    message: "Invalid latitude",
                  },
                })}
                disabled={useCurrentLocation}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                placeholder="e.g., 20.5937"
              />
              {errors.location?.latitude && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.location.latitude.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="text"
                {...register("location.longitude", {
                  required: "Longitude is required",
                  pattern: {
                    value: /^-?[0-9]\d*(\.\d+)?$/,
                    message: "Invalid longitude",
                  },
                })}
                disabled={useCurrentLocation}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                placeholder="e.g., 78.9629"
              />
              {errors.location?.longitude && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.location.longitude.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              {...register("location.address", {
                required: "Address is required",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Street address or location description"
            />
            {errors.location?.address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.location.address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <input
                type="text"
                {...register("location.district", {
                  required: "District is required",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="District name"
              />
              {errors.location?.district && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.location.district.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                {...register("location.state", {
                  required: "State is required",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="State name"
              />
              {errors.location?.state && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.location.state.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Landmark (optional)
            </label>
            <input
              type="text"
              {...register("location.landmark")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nearby landmark for easier identification"
            />
          </div>
        </div>

        {/* Flood Details Section */}
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-lg font-medium flex items-center">
            <Droplets className="w-5 h-5 text-primary-600 mr-2" />
            Flood Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity Level
              </label>
              <div className="relative">
                <select
                  {...register("severity", {
                    required: "Severity is required",
                  })}
                  className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white pr-10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {getSeverityDescription(watchSeverity)}
              </p>
              {errors.severity && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.severity.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Water Level
              </label>
              <div className="relative">
                <select
                  {...register("waterLevel", {
                    required: "Water level is required",
                  })}
                  className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white pr-10"
                >
                  <option value="low">Low (Ankle Deep)</option>
                  <option value="medium">Medium (Knee Deep)</option>
                  <option value="high">High (Waist Deep)</option>
                  <option value="critical">Critical (Chest or Above)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {getWaterLevelDescription(watchWaterLevel)}
              </p>
              {errors.waterLevel && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.waterLevel.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Ruler className="w-4 h-4 mr-1" />
              Water Depth (meters)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              {...register("depth", {
                required: "Water depth is required",
                min: {
                  value: 0,
                  message: "Depth must be positive",
                },
                max: {
                  value: 10,
                  message: "Maximum depth is 10 meters",
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 1.5"
            />
            {errors.depth && (
              <p className="mt-1 text-sm text-red-600">
                {errors.depth.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "Description should be at least 10 characters",
                },
                maxLength: {
                  value: 1000,
                  message: "Description should not exceed 1000 characters",
                },
              })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Please provide details about the flood situation, any immediate dangers, and other relevant information..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {watch("description").length}/1000 characters
            </p>
          </div>
        </div>

        {/* Impact Assessment */}
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-lg font-medium flex items-center">
            <Info className="w-5 h-5 text-primary-600 mr-2" />
            Impact Assessment (Optional)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Users className="w-4 h-4 mr-1" />
                People Affected (estimate)
              </label>
              <input
                type="number"
                min="0"
                {...register("impact.affectedPeople")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 50"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Home className="w-4 h-4 mr-1" />
                Properties Damaged (estimate)
              </label>
              <input
                type="number"
                min="0"
                {...register("impact.damagedProperties")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 10"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Road className="w-4 h-4 mr-1" />
              Blocked Roads (comma separated)
            </label>
            <input
              type="text"
              {...register("impact.blockedRoads")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Main Street, Highway 101, River Road"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple roads with commas
            </p>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="w-4 h-4 mr-1" />
              Estimated Economic Loss (in local currency)
            </label>
            <input
              type="number"
              min="0"
              {...register("impact.economicLoss")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 50000"
            />
          </div>
        </div>

        {/* Media Upload */}
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-lg font-medium flex items-center">
            <ImagePlus className="w-5 h-5 text-primary-600 mr-2" />
            Upload Media (Optional)
          </h2>

          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="media-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG up to 5 files (max 10MB each)
                </p>
              </div>
              <input
                id="media-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-500">
            {previewUrls.length}/5 files uploaded
          </p>
        </div>

        {/* Tags section */}
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-lg font-medium flex items-center">
            <AlertTriangle className="w-5 h-5 text-primary-600 mr-2" />
            Emergency Tags (Optional)
          </h2>

          <div className="flex flex-wrap gap-2">
            {[
              "rescue-needed",
              "medical-emergency",
              "evacuation",
              "power-outage",
              "water-supply-issue",
              "infrastructure-damage",
              "trapped-people",
            ].map((tag) => (
              <Controller
                key={tag}
                control={control}
                name="tags"
                render={({ field }) => {
                  const isSelected = field.value.includes(tag);
                  return (
                    <label
                      className={`inline-flex items-center px-3 py-1.5 rounded-full cursor-pointer ${
                        isSelected
                          ? "bg-red-100 text-red-800 border border-red-300"
                          : "bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        value={tag}
                        onChange={(e) => {
                          const newTags = e.target.checked
                            ? [...field.value, tag]
                            : field.value.filter((t) => t !== tag);
                          field.onChange(newTags);
                        }}
                        checked={isSelected}
                      />
                      {tag
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </label>
                  );
                }}
              />
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Select tags that apply to this flood situation to help responders
            prioritize
          </p>
        </div>

        {/* Submission */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 mr-2" />
                Submit Flood Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserReportForm;
