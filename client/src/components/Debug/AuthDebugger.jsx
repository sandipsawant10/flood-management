import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { getAuthToken } from "../../utils/tokenUtils";

const AuthDebugger = () => {
  const { user, login, logout } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, status, message, data = null) => {
    const result = {
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTestResults((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10 results
    console.log(`[${result.status.toUpperCase()}] ${test}: ${message}`, data);
  };

  const testServerConnection = async () => {
    try {
      const response = await fetch("http://localhost:5003/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: "admin@floodmanagement.com",
          password: "admin123",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult(
          "Server Connection",
          "success",
          `Server responded: ${response.status}`,
          {
            hasToken: !!data.token,
            hasUser: !!data.user,
            userRole: data.user?.role,
          }
        );
      } else {
        addTestResult(
          "Server Connection",
          "error",
          `Server error: ${response.status}`
        );
      }
    } catch (error) {
      addTestResult(
        "Server Connection",
        "error",
        `Connection failed: ${error.message}`
      );
    }
  };

  const checkAuthState = () => {
    const tokenFromUtils = getAuthToken();
    const allTokens = {
      directToken: localStorage.getItem("token"),
      sessionDataLocal: localStorage.getItem("sessionData"),
      sessionDataSession: sessionStorage.getItem("sessionData"),
      refreshToken: localStorage.getItem("refreshToken"),
    };
    const userFromAuth = user;
    const sessionData = sessionStorage.getItem("sessionData");
    const localData = localStorage.getItem("sessionData");
    const directToken = localStorage.getItem("token");

    const debugData = {
      tokenFromUtils,
      allTokens,
      userFromAuth,
      sessionData: sessionData ? JSON.parse(sessionData) : null,
      localData: localData ? JSON.parse(localData) : null,
      directToken,
      timestamp: new Date().toISOString(),
    };

    setDebugInfo(debugData);

    addTestResult(
      "Auth State Check",
      "info",
      `User: ${userFromAuth?.name || "null"}, Token: ${
        tokenFromUtils ? "Found" : "null"
      }`,
      {
        hasUser: !!userFromAuth,
        hasToken: !!tokenFromUtils,
        tokenLocation: tokenFromUtils
          ? "utils"
          : directToken
          ? "direct"
          : "none",
      }
    );
  };

  const decodeJWTToken = () => {
    try {
      const token = getAuthToken();
      if (!token) {
        addTestResult("JWT Decode", "error", "No token found to decode");
        return;
      }

      // Parse JWT token (basic decoding, not verifying signature)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const decoded = JSON.parse(jsonPayload);

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp && decoded.exp < now;

      addTestResult(
        "JWT Decode",
        isExpired ? "error" : "success",
        `Token decoded - User ID: ${decoded.userId || decoded.id}, Role: ${
          decoded.role
        }, Expired: ${isExpired}`,
        {
          ...decoded,
          isExpired,
          timeUntilExpiry: decoded.exp ? decoded.exp - now : null,
        }
      );
    } catch (error) {
      addTestResult(
        "JWT Decode",
        "error",
        `Token decode error: ${error.message}`
      );
    }
  };

  const testLogin = async () => {
    addTestResult("Login Test", "info", "Starting login test...");

    try {
      const result = await login("admin@floodmanagement.com", "admin123");

      if (result?.success) {
        addTestResult("Login Test", "success", "Login successful", result);

        // Check auth state immediately after login
        setTimeout(() => {
          checkAuthState();
          decodeJWTToken(); // Decode the token after login
        }, 100);
      } else {
        addTestResult("Login Test", "error", "Login failed", result);
      }
    } catch (error) {
      addTestResult(
        "Login Test",
        "error",
        `Login error: ${error.message}`,
        error
      );
    }
  };

  const testProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        addTestResult("Profile Test", "error", "No token found");
        return;
      }

      const response = await fetch("http://localhost:5003/api/auth/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult(
          "Profile Test",
          "success",
          `Profile loaded: ${data.user?.name || "Unknown"} (${
            data.user?.role
          })`,
          {
            name: data.user?.name,
            role: data.user?.role,
            roles: data.user?.roles,
            isVerified: data.user?.isVerified,
          }
        );
      } else {
        addTestResult(
          "Profile Test",
          "error",
          `Profile error: ${response.status}`
        );
      }
    } catch (error) {
      addTestResult(
        "Profile Test",
        "error",
        `Profile failed: ${error.message}`
      );
    }
  };

  const testRescuersEndpoint = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        addTestResult("Rescuers Test", "error", "No token found");
        return;
      }

      const response = await fetch(
        "http://localhost:5003/api/admin/rescuers/members",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        addTestResult(
          "Rescuers Test",
          "success",
          `Rescuers loaded: ${data?.length || 0} members`,
          data
        );
      } else {
        const errorData = await response.text();
        addTestResult(
          "Rescuers Test",
          "error",
          `Rescuers error: ${response.status} - ${errorData}`
        );
      }
    } catch (error) {
      addTestResult(
        "Rescuers Test",
        "error",
        `Rescuers failed: ${error.message}`
      );
    }
  };

  const testFloodReportAuth = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        addTestResult("Flood Report Auth", "error", "No token found");
        return;
      }

      // Create a minimal test flood report
      const testFormData = new FormData();
      testFormData.append("severity", "medium");
      testFormData.append("waterLevel", "knee-deep");
      testFormData.append(
        "description",
        "Test flood report for auth debugging"
      );
      testFormData.append(
        "location",
        JSON.stringify({
          latitude: 28.6139,
          longitude: 77.209,
          address: "Test Address, New Delhi",
          district: "New Delhi",
          state: "Delhi",
        })
      );

      addTestResult(
        "Flood Report Auth",
        "info",
        "Sending test flood report...",
        {
          hasToken: !!token,
          tokenPreview: token?.substring(0, 20) + "...",
        }
      );

      const response = await fetch("http://localhost:5003/api/flood-reports", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it
        },
        body: testFormData,
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (response.ok) {
        addTestResult(
          "Flood Report Auth",
          "success",
          `Flood report created successfully: ${response.status}`,
          {
            reportId: responseData?._id,
            status: response.status,
            response: responseData,
          }
        );
      } else {
        addTestResult(
          "Flood Report Auth",
          "error",
          `Flood report failed: ${response.status}`,
          {
            status: response.status,
            error: responseData,
            headers: Object.fromEntries(response.headers.entries()),
          }
        );
      }
    } catch (error) {
      addTestResult(
        "Flood Report Auth",
        "error",
        `Flood report test failed: ${error.message}`,
        error
      );
    }
  };

  const testAdminUsersEndpoint = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        addTestResult("Admin Users Test", "error", "No token found");
        return;
      }

      addTestResult(
        "Admin Users Test",
        "info",
        "Testing admin users endpoint...",
        {
          hasToken: !!token,
          tokenPreview: token?.substring(0, 20) + "...",
        }
      );

      const response = await fetch("http://localhost:5003/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult(
          "Admin Users Test",
          "success",
          `Admin users loaded: ${data?.data?.users?.length || 0} users`,
          {
            usersCount: data?.data?.users?.length || 0,
            total: data?.data?.pagination?.total || 0,
          }
        );
      } else {
        const errorData = await response.text();
        addTestResult(
          "Admin Users Test",
          "error",
          `Admin users error: ${response.status} - ${errorData}`,
          {
            status: response.status,
            error: errorData,
          }
        );
      }
    } catch (error) {
      addTestResult(
        "Admin Users Test",
        "error",
        `Admin users test failed: ${error.message}`,
        error
      );
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    addTestResult("Storage", "info", "Cleared all storage");
    checkAuthState();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto z-50">
      <h3 className="font-bold text-sm mb-2">Auth Debugger</h3>

      <div className="space-y-2 text-xs mb-3">
        <button
          onClick={testServerConnection}
          className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
        >
          Test Server
        </button>

        <button
          onClick={checkAuthState}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs ml-1"
        >
          Check Auth
        </button>

        <button
          onClick={decodeJWTToken}
          className="bg-indigo-500 text-white px-2 py-1 rounded text-xs ml-1"
        >
          Decode JWT
        </button>

        <button
          onClick={testLogin}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs ml-1"
        >
          Test Login
        </button>

        <button
          onClick={testProfile}
          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs ml-1"
        >
          Test Profile
        </button>

        <button
          onClick={testRescuersEndpoint}
          className="bg-pink-500 text-white px-2 py-1 rounded text-xs ml-1"
        >
          Test Rescuers
        </button>

        <button
          onClick={testFloodReportAuth}
          className="bg-indigo-500 text-white px-2 py-1 rounded text-xs ml-1"
        >
          Test Flood Report
        </button>

        <button
          onClick={testAdminUsersEndpoint}
          className="bg-teal-500 text-white px-2 py-1 rounded text-xs ml-1"
        >
          Test Admin Users
        </button>

        <button
          onClick={clearStorage}
          className="bg-orange-500 text-white px-2 py-1 rounded text-xs ml-1"
        >
          Clear Storage
        </button>

        {user && (
          <button
            onClick={logout}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs ml-1"
          >
            Logout
          </button>
        )}
      </div>

      {debugInfo.timestamp && (
        <div className="mt-2 text-xs border-t pt-2">
          <p>
            <strong>Current State:</strong>
          </p>
          <p>User: {debugInfo.userFromAuth?.name || "null"}</p>
          <p>Token: {debugInfo.tokenFromUtils ? "✓" : "✗"}</p>
          <p>Storage: {debugInfo.directToken ? "✓" : "✗"}</p>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="mt-2 text-xs border-t pt-2">
          <p>
            <strong>Test Results:</strong>
          </p>
          {testResults.slice(0, 3).map((result, i) => (
            <div
              key={i}
              className={`p-1 mb-1 rounded text-xs ${
                result.status === "success"
                  ? "bg-green-100"
                  : result.status === "error"
                  ? "bg-red-100"
                  : "bg-blue-100"
              }`}
            >
              <strong>{result.test}:</strong> {result.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;
