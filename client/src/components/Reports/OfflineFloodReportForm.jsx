import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Droplet, CloudRain, Map, Camera, Upload, Send } from "lucide-react";
import useOffline from "../../hooks/useOffline";
import OfflineFormWrapper from "../../components/Offline/OfflineFormWrapper";

/**
 * Enhanced Flood Report form with offline support
 * This form allows users to submit flood reports even when offline
 */
const OfflineFloodReportForm = () => {
  const navigate = useNavigate();
  const { online, submitOfflineFloodReport } = useOffline();

  // Form state
  const [formData, setFormData] = useState({
    location: {
      address: "",
      coordinates: {
        lat: null,
        lng: null,
      },
    },
    severity: "moderate",
    description: "",
    images: [],
  });

  // Location detection state
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Form submission state
  const [submissionState, setSubmissionState] = useState(null);

  // Handle location detection
  const handleDetectLocation = () => {
    setDetectingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Store coordinates
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: {
              lat: latitude,
              lng: longitude,
            },
          },
        }));

        try {
          // Try to get address if online
          if (online) {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            if (data.display_name) {
              setFormData((prev) => ({
                ...prev,
                location: {
                  ...prev.location,
                  address: data.display_name,
                },
              }));
            }
          } else {
            // If offline, just save the coordinates
            setFormData((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                address: `Coordinates: ${latitude.toFixed(
                  6
                )}, ${longitude.toFixed(6)}`,
              },
            }));
          }
        } catch (error) {
          console.error("Error getting location address:", error);
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              address: `Coordinates: ${latitude.toFixed(
                6
              )}, ${longitude.toFixed(6)}`,
            },
          }));
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationError(
          error.code === 1
            ? "Location permission denied. Please enable location services."
            : "Could not detect your location. Please try again or enter manually."
        );
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Process each file - in a real app, you'd use FileReader to preview images
    // and possibly compress them before storing
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 15),
      file,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file), // Create a preview URL
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  // Handle image removal
  const handleRemoveImage = (id) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmissionState({ status: "pending" });

      // Convert images to base64 strings for offline storage
      const processedImages = await Promise.all(
        formData.images.map(async (img) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                id: img.id,
                dataUrl: e.target.result,
                name: img.name,
                size: img.size,
              });
            };
            reader.readAsDataURL(img.file);
          });
        })
      );

      // Prepare report data with processed images
      const reportData = {
        ...formData,
        images: processedImages,
        timestamp: new Date().toISOString(),
      };

      // Submit report using offline-capable method
      const result = await submitOfflineFloodReport(reportData);

      if (result.success) {
        // Check if the submission was made in offline mode
        if (result.offline) {
          setSubmissionState({
            status: "offline-queued",
            title: "Report Saved for Later Submission",
            message:
              "Your flood report has been saved and will be submitted automatically when you reconnect to the internet.",
          });
        } else {
          setSubmissionState({
            status: "success",
            title: "Report Submitted Successfully",
            message:
              "Thank you for your report. Authorities have been notified.",
          });
        }

        // Reset form after a delay
        setTimeout(() => {
          navigate("/reports");
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting flood report:", error);
      setSubmissionState({
        status: "error",
        title: "Submission Failed",
        message:
          error.message ||
          "There was an error submitting your report. Please try again.",
      });
    }
  };

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      formData.images.forEach((img) => {
        if (img.url && img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [formData.images]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <CloudRain className="w-6 h-6 mr-2 text-blue-600" />
        Report Flooding Incident
      </h2>

      <OfflineFormWrapper
        submissionState={submissionState}
        offlineSubmissionSupported={true}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Section */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Incident Location
            </label>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <textarea
                  name="locationAddress"
                  value={formData.location.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        address: e.target.value,
                      },
                    }))
                  }
                  placeholder="Enter address or location description"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  required
                ></textarea>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className={`px-3 py-2 rounded-lg flex items-center ${
                  detectingLocation
                    ? "bg-gray-300 text-gray-500"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
              >
                {detectingLocation ? (
                  <>
                    <div className="w-4 h-4 mr-1 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    Detecting...
                  </>
                ) : (
                  <>
                    <Map className="w-4 h-4 mr-1" />
                    Detect
                  </>
                )}
              </button>
            </div>
            {locationError && (
              <p className="text-red-500 text-sm mt-1">{locationError}</p>
            )}
          </div>

          {/* Severity Section */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Flooding Severity
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, severity: "minor" }))
                }
                className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center ${
                  formData.severity === "minor"
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <Droplet className="w-5 h-5 mb-1 text-blue-500" />
                <span>Minor</span>
                <span className="text-xs text-gray-500">{"< 1 foot deep"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, severity: "moderate" }))
                }
                className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center ${
                  formData.severity === "moderate"
                    ? "bg-amber-100 border-2 border-amber-500"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <Droplet className="w-5 h-5 mb-1 text-amber-500" />
                <span>Moderate</span>
                <span className="text-xs text-gray-500">{"1-3 feet deep"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, severity: "severe" }))
                }
                className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center ${
                  formData.severity === "severe"
                    ? "bg-red-100 border-2 border-red-500"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <Droplet className="w-5 h-5 mb-1 text-red-500" />
                <span>Severe</span>
                <span className="text-xs text-gray-500">{"> 3 feet deep"}</span>
              </button>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the flooding situation, any people in danger, or other details"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            ></textarea>
          </div>

          {/* Photo Upload Section */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Photos (Optional)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                formData.images.length > 0
                  ? "border-gray-300"
                  : "border-blue-300"
              }`}
            >
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center justify-center py-3"
              >
                <Camera className="w-8 h-8 mb-2 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  Take photos or upload from gallery
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Upload up to 3 photos
                </span>
              </label>
            </div>

            {/* Preview uploaded images */}
            {formData.images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {formData.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square"
                  >
                    <img
                      src={img.url}
                      alt={`Upload ${img.id}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      aria-label="Remove image"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center"
              disabled={submissionState?.status === "pending"}
            >
              {submissionState?.status === "pending" ? (
                <>
                  <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Flood Report
                </>
              )}
            </button>
          </div>
        </form>
      </OfflineFormWrapper>
    </div>
  );
};

export default OfflineFloodReportForm;
