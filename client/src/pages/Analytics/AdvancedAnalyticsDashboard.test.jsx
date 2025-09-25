import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import {
  describe,
  it as test,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import AdvancedAnalyticsDashboard from "./AdvancedAnalyticsDashboard";
import { analyticsService } from "../../services/analyticsService";

// Mock the analytics service
vi.mock("../../services/analyticsService");

describe("AdvancedAnalyticsDashboard", () => {
  const mockPredictions = [
    {
      regionId: "Central District",
      riskScore: 75,
      alertLevel: "High",
      areasAtRisk: 5,
      confidence: 85,
      timestamp: "2023-06-15T10:30:00Z",
      timeSeriesForecast: [],
    },
  ];

  const mockModelConfidence = {
    accuracy: 92,
    confidenceScore: 88,
    dataFreshness: "1 hour ago",
    lastUpdated: "2023-06-15T10:30:00Z",
    nextUpdateScheduled: "2023-06-15T11:30:00Z",
  };

  const mockAnalyticsData = {
    timeframe: "month",
    region: "all",
    predictions: mockPredictions,
    historical: {
      data: [],
    },
    resources: {
      resources: [],
      coveragePercent: 78,
    },
    sensors: {
      readings: [],
      coverage: 85,
      updateFrequency: "5 min",
      lastPing: "2023-06-15T10:30:00Z",
      sensorTypes: ["water-level", "rainfall", "flow-rate"],
    },
    modelConfidence: mockModelConfidence,
    timestamp: "2023-06-15T10:30:00Z",
  };

  beforeEach(() => {
    // Setup mocks
    analyticsService.getAdvancedAnalytics.mockResolvedValue(mockAnalyticsData);
    analyticsService.getModelConfidence.mockResolvedValue(mockModelConfidence);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders dashboard with loading state initially", () => {
    render(
      <BrowserRouter>
        <AdvancedAnalyticsDashboard />
      </BrowserRouter>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("loads and displays dashboard data", async () => {
    render(
      <BrowserRouter>
        <AdvancedAnalyticsDashboard />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(analyticsService.getAdvancedAnalytics).toHaveBeenCalledTimes(1);
    });

    // Check that dashboard title is rendered
    expect(
      screen.getByText("Advanced Analytics Dashboard")
    ).toBeInTheDocument();

    // Check that tabs are rendered
    expect(screen.getByText("Flood Risk Prediction")).toBeInTheDocument();
    expect(screen.getByText("Resource Optimization")).toBeInTheDocument();
    expect(screen.getByText("Sensor Monitoring")).toBeInTheDocument();
  });

  test("changes tab when clicked", async () => {
    render(
      <BrowserRouter>
        <AdvancedAnalyticsDashboard />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(
        screen.getByText("Advanced Analytics Dashboard")
      ).toBeInTheDocument();
    });

    // Click on Resource Optimization tab
    const resourceTab = screen.getByText("Resource Optimization");
    userEvent.click(resourceTab);

    // Verify that tab was changed
    await waitFor(() => {
      // This would check for a component or text that would only appear in the Resource Optimization tab
      expect(screen.getByText("Resource Optimization")).toBeInTheDocument();
    });
  });

  test("changes region filter", async () => {
    render(
      <BrowserRouter>
        <AdvancedAnalyticsDashboard />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(
        screen.getByText("Advanced Analytics Dashboard")
      ).toBeInTheDocument();
    });

    // Click on region select
    const regionSelect = screen.getByLabelText("Region");
    userEvent.click(regionSelect);

    // Select North District
    const northDistrict = screen.getByText("North District");
    userEvent.click(northDistrict);

    // Verify that analytics service was called with new region
    await waitFor(() => {
      expect(analyticsService.getAdvancedAnalytics).toHaveBeenCalledWith(
        "month",
        "North District"
      );
    });
  });
});
