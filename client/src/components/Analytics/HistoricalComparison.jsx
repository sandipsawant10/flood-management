import React, { useState } from "react";
import {
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  HelpCircle,
} from "lucide-react";
import EnhancedChart from "./EnhancedChart";

const HistoricalComparison = ({
  title = "Historical Comparison",
  currentData = [],
  previousData = [],
  compareKey = "value",
  labelKey = "name",
  timeRangeLabel = "previous period",
  noDataMessage = "No historical data available for comparison",
  className,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  // Calculate comparison metrics
  const getComparisonMetrics = () => {
    if (!currentData.length || !previousData.length) {
      return {
        currentTotal: 0,
        previousTotal: 0,
        percentChange: 0,
        hasChange: false,
      };
    }

    // Calculate totals
    const currentTotal = currentData.reduce(
      (total, item) => total + (item[compareKey] || 0),
      0
    );
    const previousTotal = previousData.reduce(
      (total, item) => total + (item[compareKey] || 0),
      0
    );

    // Calculate percent change
    let percentChange = 0;
    let hasChange = false;

    if (previousTotal > 0) {
      percentChange = ((currentTotal - previousTotal) / previousTotal) * 100;
      hasChange = true;
    } else if (currentTotal > 0) {
      percentChange = 100; // If previous was 0 and current is not, that's a 100% increase
      hasChange = true;
    }

    return {
      currentTotal,
      previousTotal,
      percentChange,
      hasChange,
    };
  };

  const metrics = getComparisonMetrics();

  // Prepare combined data for the chart
  const prepareChartData = () => {
    // Create a map of all unique labels across both datasets
    const labelsMap = new Map();

    // Add current data points
    currentData.forEach((item) => {
      labelsMap.set(item[labelKey], {
        [labelKey]: item[labelKey],
        current: item[compareKey] || 0,
        previous: 0,
      });
    });

    // Add previous data points
    previousData.forEach((item) => {
      if (labelsMap.has(item[labelKey])) {
        // Update existing entry
        const existingItem = labelsMap.get(item[labelKey]);
        existingItem.previous = item[compareKey] || 0;
        labelsMap.set(item[labelKey], existingItem);
      } else {
        // Create new entry
        labelsMap.set(item[labelKey], {
          [labelKey]: item[labelKey],
          current: 0,
          previous: item[compareKey] || 0,
        });
      }
    });

    // Convert map to array
    return Array.from(labelsMap.values());
  };

  // Check if we have data to compare
  const hasData = currentData.length > 0 && previousData.length > 0;
  const chartData = hasData ? prepareChartData() : [];

  // Format the percentage
  const formatPercentage = (percent) => {
    return `${Math.abs(percent).toFixed(1)}%`;
  };

  // Define color class based on the percentage change
  const getTrendColor = () => {
    if (metrics.percentChange > 0) {
      return "text-green-600";
    } else if (metrics.percentChange < 0) {
      return "text-red-600";
    }
    return "text-gray-500";
  };

  // Define icon based on the percentage change
  const getTrendIcon = () => {
    if (metrics.percentChange > 0) {
      return <ArrowUpRight className="w-4 h-4" />;
    } else if (metrics.percentChange < 0) {
      return <ArrowDownRight className="w-4 h-4" />;
    }
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className || ""}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          {title}

          {/* Help button */}
          <button
            className="ml-2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowHelp(!showHelp)}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </h3>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">vs {timeRangeLabel}</span>

          {metrics.hasChange && (
            <div
              className={`flex items-center px-2 py-1 rounded-full ${
                metrics.percentChange > 0
                  ? "bg-green-100"
                  : metrics.percentChange < 0
                  ? "bg-red-100"
                  : "bg-gray-100"
              }`}
            >
              <span className={`flex items-center ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="ml-1 font-semibold">
                  {formatPercentage(metrics.percentChange)}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Help tooltip */}
      {showHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 text-sm text-blue-800">
          <p>
            This chart compares data between two time periods, showing the
            percentage change and trend.
          </p>
          <p className="mt-1">
            Current period: {currentData.length} data points
          </p>
          <p>Previous period: {previousData.length} data points</p>
        </div>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-600">Current Period</h4>
          <p className="text-2xl font-bold text-blue-700">
            {metrics.currentTotal.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-600">Previous Period</h4>
          <p className="text-2xl font-bold text-gray-700">
            {metrics.previousTotal.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <EnhancedChart
          type="bar"
          data={chartData}
          title=""
          xAxisKey={labelKey}
          yAxisKeys={["current", "previous"]}
          height={300}
          colors={["#0088FE", "#888888"]}
          showControls={true}
          showLegend={true}
        />
      ) : (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
          <p className="text-gray-500">{noDataMessage}</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center mx-2">
          <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
          <span className="text-xs text-gray-600">Current Period</span>
        </div>
        <div className="flex items-center mx-2">
          <div className="w-3 h-3 bg-gray-500 rounded-sm mr-1"></div>
          <span className="text-xs text-gray-600">Previous Period</span>
        </div>
      </div>
    </div>
  );
};

export default HistoricalComparison;
