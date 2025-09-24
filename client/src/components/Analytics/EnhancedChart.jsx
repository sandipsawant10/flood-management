import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  Brush,
} from "recharts";
import { ArrowUpDown, Settings, Download, Info, Maximize2 } from "lucide-react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#4CAF50",
  "#F44336",
  "#9C27B0",
  "#3F51B5",
  "#E91E63",
  "#795548",
  "#607D8B",
];

const EnhancedChart = ({
  type = "bar",
  data = [],
  title = "Chart Title",
  xAxisKey = "name",
  yAxisKeys = ["value"],
  colors = COLORS,
  height = 400,
  stacked = false,
  showControls = true,
  showLegend = true,
  showGridLines = true,
  showTooltips = true,
  syncId,
  dateFormat = null,
  isLoading = false,
  emptyMessage = "No data available",
  className = "",
  renderCustomTooltip = null,
  onExport = null,
  onSettingsChange = null,
}) => {
  // Local state for chart settings
  const [localSettings, setLocalSettings] = useState({
    showGridLines,
    showLegend,
    isFullScreen: false,
    chartType: type,
    showSyncBrush: false,
  });

  // Handle settings change
  const handleSettingChange = (setting, value) => {
    const newSettings = { ...localSettings, [setting]: value };
    setLocalSettings(newSettings);

    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  // Handle chart type change
  const changeChartType = (newType) => {
    handleSettingChange("chartType", newType);
  };

  // Toggle full screen mode
  const toggleFullScreen = () => {
    handleSettingChange("isFullScreen", !localSettings.isFullScreen);
  };

  // Format a date value if dateFormat is provided
  const formatXAxis = (value) => {
    if (!value) return "";

    if (dateFormat) {
      // Simple date formatting - in production, use a library like date-fns
      try {
        const date = new Date(value);
        return date.toLocaleDateString(undefined, dateFormat);
      } catch {
        return value;
      }
    }

    return value;
  };

  // Determine if we have data to show
  const hasData = data && data.length > 0;

  // Default tooltip formatter for recharts
  const defaultTooltipFormatter = (value, name) => {
    return [value, name.charAt(0).toUpperCase() + name.slice(1)];
  };

  // Function to render selected chart type
  const renderChart = () => {
    if (!hasData) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (localSettings.chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} syncId={syncId} barCategoryGap={8}>
              {localSettings.showGridLines && (
                <CartesianGrid strokeDasharray="3 3" />
              )}
              <XAxis
                dataKey={xAxisKey}
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
                height={40}
                tickMargin={8}
              />
              <YAxis width={40} tickMargin={8} />
              {showTooltips && (
                <Tooltip
                  formatter={renderCustomTooltip || defaultTooltipFormatter}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "6px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #eee",
                  }}
                />
              )}
              {localSettings.showLegend && <Legend />}

              {yAxisKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  stackId={stacked ? "stack" : null}
                  radius={[4, 4, 0, 0]}
                />
              ))}
              {localSettings.showSyncBrush && (
                <Brush dataKey={xAxisKey} height={30} stroke="#8884d8" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} syncId={syncId}>
              {localSettings.showGridLines && (
                <CartesianGrid strokeDasharray="3 3" />
              )}
              <XAxis
                dataKey={xAxisKey}
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
                height={40}
                tickMargin={8}
              />
              <YAxis width={40} tickMargin={8} />
              {showTooltips && (
                <Tooltip
                  formatter={renderCustomTooltip || defaultTooltipFormatter}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "6px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #eee",
                  }}
                />
              )}
              {localSettings.showLegend && <Legend />}

              {yAxisKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                />
              ))}
              {localSettings.showSyncBrush && (
                <Brush dataKey={xAxisKey} height={30} stroke="#8884d8" />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} syncId={syncId}>
              {localSettings.showGridLines && (
                <CartesianGrid strokeDasharray="3 3" />
              )}
              <XAxis
                dataKey={xAxisKey}
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
                height={40}
                tickMargin={8}
              />
              <YAxis width={40} tickMargin={8} />
              {showTooltips && (
                <Tooltip
                  formatter={renderCustomTooltip || defaultTooltipFormatter}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "6px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #eee",
                  }}
                />
              )}
              {localSettings.showLegend && <Legend />}

              {yAxisKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.2}
                  stackId={stacked ? "stack" : null}
                />
              ))}
              {localSettings.showSyncBrush && (
                <Brush dataKey={xAxisKey} height={30} stroke="#8884d8" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie": {
        // For pie charts, we use the first yAxisKey
        const pieDataKey = yAxisKeys[0];

        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={height / 3}
                fill="#8884d8"
                dataKey={pieDataKey}
                nameKey={xAxisKey}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              {showTooltips && (
                <Tooltip
                  formatter={renderCustomTooltip || defaultTooltipFormatter}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "6px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #eee",
                  }}
                />
              )}
              {localSettings.showLegend && (
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case "radar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart outerRadius={height / 3} data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey={xAxisKey} />
              <PolarRadiusAxis angle={30} domain={[0, "auto"]} />

              {yAxisKeys.map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.2}
                />
              ))}

              {showTooltips && (
                <Tooltip
                  formatter={renderCustomTooltip || defaultTooltipFormatter}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "6px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #eee",
                  }}
                />
              )}
              {localSettings.showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        );

      case "composed":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={data} syncId={syncId}>
              {localSettings.showGridLines && (
                <CartesianGrid strokeDasharray="3 3" />
              )}
              <XAxis
                dataKey={xAxisKey}
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
                height={40}
                tickMargin={8}
              />
              <YAxis width={40} tickMargin={8} />
              {showTooltips && (
                <Tooltip
                  formatter={renderCustomTooltip || defaultTooltipFormatter}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "6px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #eee",
                  }}
                />
              )}
              {localSettings.showLegend && <Legend />}

              {/* Render each key with a different chart type */}
              {yAxisKeys.map((key, index) => {
                const idx = index % 3; // Cycle through bar, line, area

                if (idx === 0) {
                  return (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={colors[index % colors.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  );
                } else if (idx === 1) {
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  );
                } else {
                  return (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      fill={colors[index % colors.length]}
                      fillOpacity={0.2}
                    />
                  );
                }
              })}
              {localSettings.showSyncBrush && (
                <Brush dataKey={xAxisKey} height={30} stroke="#8884d8" />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
            <p className="text-gray-500">
              Unsupported chart type: {localSettings.chartType}
            </p>
          </div>
        );
    }
  };

  const chartControlButtons = [
    { type: "bar", label: "Bar" },
    { type: "line", label: "Line" },
    { type: "area", label: "Area" },
    { type: "pie", label: "Pie" },
    { type: "radar", label: "Radar" },
    { type: "composed", label: "Composed" },
  ];

  // Define classes for the container based on full screen state
  const containerClasses = localSettings.isFullScreen
    ? "fixed top-0 left-0 right-0 bottom-0 bg-white z-50 p-6 overflow-auto"
    : `bg-white rounded-lg shadow-md p-4 mb-6 ${className}`;

  return (
    <div className={containerClasses}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

        {showControls && (
          <div className="flex space-x-2">
            <div className="flex bg-gray-100 rounded-md">
              {chartControlButtons.map((button) => (
                <button
                  key={button.type}
                  onClick={() => changeChartType(button.type)}
                  className={`px-2 py-1 text-xs font-medium rounded-md ${
                    localSettings.chartType === button.type
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {button.label}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                handleSettingChange(
                  "showGridLines",
                  !localSettings.showGridLines
                )
              }
              className={`p-1.5 rounded-md ${
                localSettings.showGridLines
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
              title="Toggle Grid Lines"
            >
              <Settings className="h-4 w-4" />
            </button>

            {syncId && (
              <button
                onClick={() =>
                  handleSettingChange(
                    "showSyncBrush",
                    !localSettings.showSyncBrush
                  )
                }
                className={`p-1.5 rounded-md ${
                  localSettings.showSyncBrush
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
                title="Toggle Synchronized Brush"
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={toggleFullScreen}
              className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
              title="Toggle Full Screen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {onExport && (
              <button
                onClick={onExport}
                className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                title="Export Chart Data"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {renderChart()}

      {data && data.length > 0 && !isLoading && (
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-end">
          <Info className="h-3 w-3 mr-1" />
          {data.length} data points
        </div>
      )}
    </div>
  );
};

export default EnhancedChart;
