import React, { useState } from "react";
import { connectivityService } from "../../services/connectivityService";

/**
 * Component for testing server connectivity and diagnosing connection issues
 */
const ConnectivityTest = () => {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);

  const runConnectivityTest = async () => {
    setTesting(true);
    setTestResults({});

    const results = {};

    // Test basic connection
    console.log("Testing basic server connection...");
    results.connection = await connectivityService.testConnection();

    // Test authentication endpoint
    console.log("Testing authentication endpoint...");
    results.auth = await connectivityService.testAuth();

    // Test flood reports endpoint
    console.log("Testing flood reports endpoint...");
    results.floodReports = await connectivityService.testFloodReports();

    setTestResults(results);
    setTesting(false);
  };

  const getStatusColor = (success) => {
    return success ? "text-green-600" : "text-red-600";
  };

  const getStatusIcon = (success) => {
    return success ? "✓" : "✗";
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-md">
      <h3 className="font-bold text-sm mb-3">Server Connectivity Test</h3>

      <button
        onClick={runConnectivityTest}
        disabled={testing}
        className={`mb-3 px-3 py-2 text-sm rounded ${
          testing
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {testing ? "Testing..." : "Run Connectivity Test"}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-2 text-xs">
          <div className="border-t pt-2">
            <h4 className="font-semibold mb-1">Test Results:</h4>

            <div
              className={`flex items-center justify-between ${getStatusColor(
                testResults.connection?.success
              )}`}
            >
              <span>Server Connection:</span>
              <span>
                {getStatusIcon(testResults.connection?.success)}{" "}
                {testResults.connection?.success ? "Success" : "Failed"}
              </span>
            </div>
            {!testResults.connection?.success && (
              <div className="text-red-500 text-xs ml-2">
                Error: {testResults.connection?.error}
              </div>
            )}

            <div
              className={`flex items-center justify-between ${getStatusColor(
                testResults.auth?.success
              )}`}
            >
              <span>Auth Endpoint:</span>
              <span>
                {getStatusIcon(testResults.auth?.success)}{" "}
                {testResults.auth?.success ? "Success" : "Failed"}
              </span>
            </div>
            {!testResults.auth?.success && (
              <div className="text-red-500 text-xs ml-2">
                Error: {testResults.auth?.error}
              </div>
            )}

            <div
              className={`flex items-center justify-between ${getStatusColor(
                testResults.floodReports?.success
              )}`}
            >
              <span>Flood Reports:</span>
              <span>
                {getStatusIcon(testResults.floodReports?.success)}{" "}
                {testResults.floodReports?.success ? "Success" : "Failed"}
              </span>
            </div>
            {!testResults.floodReports?.success && (
              <div className="text-red-500 text-xs ml-2">
                Error: {testResults.floodReports?.error}
              </div>
            )}
          </div>

          <div className="border-t pt-2">
            <h4 className="font-semibold mb-1">Recommendations:</h4>
            {testResults.connection?.code === "CONNECTION_REFUSED" && (
              <div className="text-orange-600 text-xs">
                • Start the server: cd server && npm start
              </div>
            )}
            {testResults.connection?.code === "TIMEOUT" && (
              <div className="text-orange-600 text-xs">
                • Check if server is running on port 5003 • Check firewall
                settings
              </div>
            )}
            {testResults.connection?.code === "NETWORK_ERROR" && (
              <div className="text-orange-600 text-xs">
                • Check your internet connection • Check VPN settings
              </div>
            )}
            {testResults.auth?.status === 401 && (
              <div className="text-orange-600 text-xs">
                • Authentication required - normal for /auth/me
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectivityTest;
