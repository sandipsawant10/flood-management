import React, { useState, useEffect, useRef } from "react";
import {
  AlertCircle,
  TrendingUp,
  Loader2,
  Bell,
  ArrowUp,
  ArrowDown,
  Activity,
} from "lucide-react";

// URL for WebSocket connection
const WS_URL = import.meta.env.VITE_REACT_APP_WS_URL || "ws://localhost:5000";

const RealTimeAnalytics = ({
  onNewData,
  dataSources = ["reports", "alerts", "users"],
  refreshInterval = 5000, // Fallback polling interval if WebSockets fail
}) => {
  const [status, setStatus] = useState("disconnected");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [stats, setStats] = useState({
    newReports: 0,
    newAlerts: 0,
    activeUsers: 0,
    reportsTrend: 0,
    alertsTrend: 0,
    usersTrend: 0,
  });

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const pollTimerRef = useRef(null);
  const retryCount = useRef(0);

  // Handle incoming data
  const handleNewData = React.useCallback(
    (data) => {
      if (!data) return;

      setLastUpdate(new Date());
      setStats((prevStats) => {
        const newStats = { ...prevStats };

        // Update stats
        if (data.reports !== undefined) {
          newStats.newReports = data.reports.new || 0;
          newStats.reportsTrend = data.reports.trend || 0;
        }

        if (data.alerts !== undefined) {
          newStats.newAlerts = data.alerts.new || 0;
          newStats.alertsTrend = data.alerts.trend || 0;
        }

        if (data.users !== undefined) {
          newStats.activeUsers = data.users.active || 0;
          newStats.usersTrend = data.users.trend || 0;
        }

        return newStats;
      });

      // Forward data to parent component
      if (onNewData && typeof onNewData === "function") {
        onNewData(data);
      }
    },
    [onNewData]
  );

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // Create WebSocket URL with sources as query parameters
        const wsUrl = `${WS_URL}/analytics?sources=${dataSources.join(",")}`;

        // Close any existing connection
        if (
          socketRef.current &&
          socketRef.current.readyState !== WebSocket.CLOSED
        ) {
          socketRef.current.close();
        }

        // Create new connection
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          console.log("WebSocket connected for analytics");
          setStatus("connected");
          retryCount.current = 0;
          clearTimeout(reconnectTimerRef.current);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "analytics-update") {
              handleNewData(data.payload);
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        socket.onclose = (event) => {
          setStatus("disconnected");

          // Don't attempt to reconnect if the component is unmounting
          if (event.code !== 1000) {
            scheduleReconnect();
          }
        };

        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          setStatus("error");
          socket.close();
        };

        return socket;
      } catch (error) {
        console.error("Failed to connect WebSocket:", error);
        setStatus("error");
        scheduleReconnect();
        return null;
      }
    };

    const scheduleReconnect = () => {
      // Exponential backoff for reconnection attempts
      const delay = Math.min(1000 * 2 ** retryCount.current, 30000); // Max 30 seconds
      console.log(`Scheduling WebSocket reconnection in ${delay}ms`);

      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        retryCount.current += 1;
        connectWebSocket();
      }, delay);
    };

    // Start polling as a fallback
    const startPolling = () => {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(() => {
        // If WebSocket is not connected, poll for data
        if (status !== "connected") {
          fetchDataUpdate();
        }
      }, refreshInterval);
    };

    const fetchDataUpdate = async () => {
      try {
        // Use the fetch API to get data if WebSocket fails
        const response = await fetch(
          `/api/analytics/realtime?sources=${dataSources.join(",")}`
        );
        if (response.ok) {
          const data = await response.json();
          handleNewData(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics update:", error);
      }
    };

    // Initialize connection and polling
    connectWebSocket();
    startPolling();

    // Clean up on unmount
    return () => {
      clearTimeout(reconnectTimerRef.current);
      clearInterval(pollTimerRef.current);
      if (socketRef.current) {
        // Use code 1000 to indicate normal closure
        socketRef.current.close(1000, "Component unmounting");
      }
    };
  }, [dataSources, refreshInterval, status, handleNewData]);

  // Format trend value with arrow
  const renderTrend = (value) => {
    if (value > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUp className="w-4 h-4 mr-1" />
          <span>{Math.abs(value).toFixed(1)}%</span>
        </div>
      );
    } else if (value < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDown className="w-4 h-4 mr-1" />
          <span>{Math.abs(value).toFixed(1)}%</span>
        </div>
      );
    }
    return <span className="text-gray-500">0%</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          Real-Time Analytics
        </h3>
        <div className="flex items-center text-sm">
          {status === "connected" ? (
            <span className="flex items-center text-green-600">
              <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1.5 animate-pulse"></span>
              Live
            </span>
          ) : status === "error" ? (
            <span className="flex items-center text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              Connection Error
            </span>
          ) : (
            <span className="flex items-center text-gray-500">
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Connecting...
            </span>
          )}
          {lastUpdate && (
            <span className="ml-4 text-gray-500 text-xs">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* New Flood Reports */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-gray-600">New Reports</h4>
              <p className="text-2xl font-bold text-blue-700">
                {stats.newReports}
              </p>
            </div>
            <div className="text-blue-500 bg-blue-100 p-2 rounded-full">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">{renderTrend(stats.reportsTrend)}</div>
        </div>

        {/* Active Alerts */}
        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-gray-600">
                Active Alerts
              </h4>
              <p className="text-2xl font-bold text-red-700">
                {stats.newAlerts}
              </p>
            </div>
            <div className="text-red-500 bg-red-100 p-2 rounded-full">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">{renderTrend(stats.alertsTrend)}</div>
        </div>

        {/* Active Users */}
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-gray-600">
                Active Users
              </h4>
              <p className="text-2xl font-bold text-purple-700">
                {stats.activeUsers}
              </p>
            </div>
            <div className="text-purple-500 bg-purple-100 p-2 rounded-full">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">{renderTrend(stats.usersTrend)}</div>
        </div>
      </div>

      {/* Status Bar */}
      <div
        className={`mt-4 px-3 py-2 text-sm rounded-md ${
          status === "connected"
            ? "bg-green-50 text-green-700 border border-green-200"
            : status === "error"
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-blue-50 text-blue-700 border border-blue-200"
        }`}
      >
        <p className="flex items-center">
          {status === "connected" ? (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1.5"></span>
              Real-time analytics active. Data is updated as it arrives.
            </>
          ) : status === "error" ? (
            <>
              <AlertCircle className="w-4 h-4 mr-1.5" />
              Connection error. Retrying... (fallback to polling)
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Establishing connection to real-time analytics...
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default RealTimeAnalytics;
