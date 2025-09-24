import React, { useState } from "react";
import {
  Download,
  FileText,
  FileJson,
  FilePdf,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { analyticsService } from "../../services/analyticsService";

/**
 * Component for exporting analytics data in various formats
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filters applied to analytics
 * @param {Function} props.onSuccess - Callback function when export is successful
 * @param {Function} props.onError - Callback function when export fails
 */
const ExportAnalytics = ({ filters, onSuccess, onError }) => {
  const [exportFormat, setExportFormat] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);

  // Helper function to download files
  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // Helper function to create a Blob from JSON data
  const jsonToBlob = (data) => {
    const jsonString = JSON.stringify(data, null, 2);
    return new Blob([jsonString], { type: "application/json" });
  };

  const handleExport = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      setExportResult(null);

      // Get current timestamp for filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const defaultFilename = `flood-analytics-${timestamp}.${exportFormat}`;

      // Call the export service
      const result = await analyticsService.exportData(exportFormat, filters);

      if (result.blob) {
        // If we got a blob directly from the service, download it
        downloadFile(result.blob, result.filename || defaultFilename);
      } else if (exportFormat === "json" && result.data) {
        // For JSON, we might get data directly
        const jsonBlob = jsonToBlob(result.data);
        downloadFile(jsonBlob, defaultFilename);
      } else if (result.success) {
        // If just got a success message (mock mode)
        console.log("Export successful:", result.message);
      }

      setExportResult({
        success: true,
        message: `Export completed in ${exportFormat.toUpperCase()} format`,
      });
      if (onSuccess) onSuccess(result);
    } catch (error) {
      console.error("Export failed:", error);
      setExportResult({
        success: false,
        message:
          error.message || `Failed to export as ${exportFormat.toUpperCase()}`,
      });
      if (onError) onError(error);
    } finally {
      setIsExporting(false);
    }
  };

  // Format icons for each export type
  const formatIcons = {
    csv: <FileText className="mr-2 h-4 w-4" />,
    json: <FileJson className="mr-2 h-4 w-4" />,
    pdf: <FilePdf className="mr-2 h-4 w-4" />,
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col">
        <h3 className="font-semibold text-lg mb-4">Export Analytics Data</h3>

        <div className="flex flex-wrap items-center mb-4 gap-3">
          <div className="font-medium text-sm">Select format:</div>
          <div className="flex space-x-2">
            {["csv", "json", "pdf"].map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                  exportFormat === format
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                aria-pressed={exportFormat === format}
              >
                {formatIcons[format]}
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {exportResult && (
          <div
            className={`mb-4 p-2 text-sm rounded ${
              exportResult.success
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <div className="flex items-center">
              {exportResult.success ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              {exportResult.message}
            </div>
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`flex items-center justify-center px-4 py-2 rounded-md text-white ${
            isExporting
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isExporting
            ? "Exporting..."
            : `Export as ${exportFormat.toUpperCase()}`}
        </button>

        <div className="text-xs text-gray-500 mt-2">
          *Exports include all currently applied filters
        </div>
      </div>
    </div>
  );
};

export default ExportAnalytics;
