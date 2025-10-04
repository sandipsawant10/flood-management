// Citizen Portal API Tests
// This file tests all the API endpoints used in the citizen portal

const API_BASE = "http://localhost:5003/api";

class CitizenPortalTester {
  constructor() {
    this.testResults = [];
    this.authToken = null;
  }

  log(test, result, details = "") {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, test, result, details };
    this.testResults.push(entry);
    console.log(`[${timestamp}] ${test}: ${result} ${details}`);
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${API_BASE}${endpoint}`;
      const defaultHeaders = {
        "Content-Type": "application/json",
      };

      if (this.authToken) {
        defaultHeaders.Authorization = `Bearer ${this.authToken}`;
      }

      const response = await fetch(url, {
        headers: { ...defaultHeaders, ...options.headers },
        ...options,
      });

      const data = await response.json().catch(() => null);

      return {
        ok: response.ok,
        status: response.status,
        data,
        response,
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error.message,
      };
    }
  }

  // Test 1: Server Health Check
  async testServerHealth() {
    const result = await this.makeRequest("/health");
    if (result.ok) {
      this.log("Server Health", "PASS", "Server is responding");
      return true;
    } else {
      this.log(
        "Server Health",
        "FAIL",
        `Status: ${result.status}, Error: ${result.error}`
      );
      return false;
    }
  }

  // Test 2: User Registration
  async testUserRegistration() {
    const testUser = {
      name: "Test Citizen",
      email: `testcitizen${Date.now()}@example.com`,
      phone: "+919876543210",
      password: "TestPassword123!",
      role: "user",
    };

    const result = await this.makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(testUser),
    });

    if (result.ok) {
      this.log("User Registration", "PASS", `User created: ${testUser.email}`);
      this.testUser = testUser;
      return true;
    } else {
      this.log(
        "User Registration",
        "FAIL",
        `Status: ${result.status}, Data: ${JSON.stringify(result.data)}`
      );
      return false;
    }
  }

  // Test 3: User Login
  async testUserLogin() {
    if (!this.testUser) {
      this.log("User Login", "SKIP", "No test user available");
      return false;
    }

    const loginData = {
      email: this.testUser.email,
      password: this.testUser.password,
    };

    const result = await this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(loginData),
    });

    if (result.ok && result.data?.token) {
      this.authToken = result.data.token;
      this.log("User Login", "PASS", "User logged in successfully");
      return true;
    } else {
      this.log(
        "User Login",
        "FAIL",
        `Status: ${result.status}, Data: ${JSON.stringify(result.data)}`
      );
      return false;
    }
  }

  // Test 4: Get User Profile
  async testGetProfile() {
    const result = await this.makeRequest("/users/profile");

    if (result.ok) {
      this.log(
        "Get Profile",
        "PASS",
        `Profile retrieved for: ${result.data?.user?.email}`
      );
      return true;
    } else {
      this.log(
        "Get Profile",
        "FAIL",
        `Status: ${result.status}, Data: ${JSON.stringify(result.data)}`
      );
      return false;
    }
  }

  // Test 5: Get Flood Reports
  async testGetFloodReports() {
    const result = await this.makeRequest("/flood-reports");

    if (result.ok) {
      this.log(
        "Get Flood Reports",
        "PASS",
        `Retrieved ${
          result.data?.data?.length || result.data?.length || 0
        } reports`
      );
      return true;
    } else {
      this.log(
        "Get Flood Reports",
        "FAIL",
        `Status: ${result.status}, Data: ${JSON.stringify(result.data)}`
      );
      return false;
    }
  }

  // Test 6: Create Flood Report
  async testCreateFloodReport() {
    const reportData = {
      description: "Test flood report for citizen portal testing",
      severity: "medium",
      waterLevel: "knee-deep",
      location: {
        type: "Point",
        coordinates: [77.209, 28.6139], // Delhi coordinates
        address: "Test Location, New Delhi",
      },
      images: [],
    };

    const result = await this.makeRequest("/flood-reports", {
      method: "POST",
      body: JSON.stringify(reportData),
    });

    if (result.ok) {
      this.log(
        "Create Flood Report",
        "PASS",
        `Report created with ID: ${result.data?._id}`
      );
      this.testReportId = result.data?._id;
      return true;
    } else {
      this.log(
        "Create Flood Report",
        "FAIL",
        `Status: ${result.status}, Data: ${JSON.stringify(result.data)}`
      );
      return false;
    }
  }

  // Test 7: Get Alerts
  async testGetAlerts() {
    const result = await this.makeRequest("/alerts");

    if (result.ok) {
      this.log(
        "Get Alerts",
        "PASS",
        `Retrieved ${result.data?.length || 0} alerts`
      );
      return true;
    } else {
      this.log(
        "Get Alerts",
        "FAIL",
        `Status: ${result.status}, Data: ${JSON.stringify(result.data)}`
      );
      return false;
    }
  }

  // Test 8: Weather API
  async testWeatherAPI() {
    const result = await this.makeRequest("/weather?lat=28.6139&lon=77.2090");

    if (result.ok) {
      this.log("Weather API", "PASS", `Weather data retrieved for coordinates`);
      return true;
    } else {
      this.log(
        "Weather API",
        "FAIL",
        `Status: ${result.status}, Data: ${JSON.stringify(result.data)}`
      );
      return false;
    }
  }

  // Test 9: Emergency Services
  async testEmergencyServices() {
    const result = await this.makeRequest("/emergency-services");

    if (result.ok) {
      this.log(
        "Emergency Services",
        "PASS",
        `Retrieved emergency services data`
      );
      return true;
    } else {
      this.log(
        "Emergency Services",
        "FAIL",
        `Status: ${result.status}, Data: ${JSON.stringify(result.data)}`
      );
      return false;
    }
  }

  // Test 10: Logout/Token Validation
  async testTokenValidation() {
    // Try to access a protected endpoint
    const result = await this.makeRequest("/users/profile");

    if (result.ok) {
      this.log("Token Validation", "PASS", "Token is valid and working");
      return true;
    } else {
      this.log(
        "Token Validation",
        "FAIL",
        `Token validation failed: ${result.status}`
      );
      return false;
    }
  }

  // Run all tests
  async runAllTests() {
    console.log("🧪 Starting Citizen Portal API Tests...\n");

    const tests = [
      "testServerHealth",
      "testUserRegistration",
      "testUserLogin",
      "testGetProfile",
      "testGetFloodReports",
      "testCreateFloodReport",
      "testGetAlerts",
      "testWeatherAPI",
      "testEmergencyServices",
      "testTokenValidation",
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await this[test]();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        this.log(test, "ERROR", error.message);
        failed++;
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(`\n📊 Test Results: ${passed} PASSED, ${failed} FAILED\n`);

    // Print summary
    this.testResults.forEach((result) => {
      console.log(
        `${
          result.result === "PASS"
            ? "✅"
            : result.result === "FAIL"
            ? "❌"
            : "⚠️"
        } ${result.test}: ${result.details}`
      );
    });

    return { passed, failed, total: passed + failed };
  }
}

// Export for use
if (typeof module !== "undefined") {
  module.exports = CitizenPortalTester;
}

// Auto-run if in browser
if (typeof window !== "undefined") {
  window.CitizenPortalTester = CitizenPortalTester;

  // Add a global function to run tests
  window.runCitizenPortalTests = async () => {
    const tester = new CitizenPortalTester();
    return await tester.runAllTests();
  };
}
