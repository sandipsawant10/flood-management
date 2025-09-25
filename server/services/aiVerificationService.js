const FloodReport = require("../models/FloodReport");
const weatherService = require("./weatherService");
const newsService = require("./newsService");
const socialService = require("./socialService");
const { logger } = require("../middleware/errorHandler");

class AIVerificationService {
  /**
   * Runs automatic verification on a flood report using multiple data sources
   * @param {Object} report - The flood report to verify
   * @returns {Object} - Verification results
   */
  async verifyFloodReport(reportId) {
    try {
      const report = await FloodReport.findById(reportId);

      if (!report) {
        throw new Error("Report not found");
      }

      logger.info(`Starting AI verification for report ID: ${reportId}`);

      // Track data sources independently
      const verificationResults = {
        weather: {
          status: "pending",
          summary: "Not verified yet",
          snapshot: null,
        },
        news: {
          status: "pending",
          summary: "Not verified yet",
          snapshot: null,
        },
        social: {
          status: "pending",
          summary: "Not verified yet",
          snapshot: null,
        },
        overallStatus: "pending",
        confidence: 0,
        summary: "",
      };

      // Check weather data
      try {
        const coordinates = report.location.coordinates;
        const weatherData = await weatherService.getCurrentWeather(
          coordinates[1],
          coordinates[0]
        );

        // Analyze weather conditions to verify flood risk
        const precipitation = weatherData.precipitation || 0;
        const dailyPrecipitation = weatherData.dailyPrecipitation || 0;
        const humidity = weatherData.humidity || 0;

        // Simple rule-based validation
        if (precipitation > 15 || dailyPrecipitation > 50 || humidity > 90) {
          verificationResults.weather = {
            status: "matched",
            summary: `Weather conditions support flood report: ${precipitation}mm rainfall, ${dailyPrecipitation}mm daily, ${humidity}% humidity`,
            snapshot: weatherData,
          };
        } else if (precipitation > 5 || dailyPrecipitation > 20) {
          verificationResults.weather = {
            status: "partially-matched",
            summary: `Weather shows moderate rainfall: ${precipitation}mm rainfall, ${dailyPrecipitation}mm daily`,
            snapshot: weatherData,
          };
        } else {
          verificationResults.weather = {
            status: "not-matched",
            summary: `Weather conditions don't indicate flooding: ${precipitation}mm rainfall, ${dailyPrecipitation}mm daily`,
            snapshot: weatherData,
          };
        }
      } catch (error) {
        logger.error(`Weather verification failed: ${error.message}`);
        verificationResults.weather = {
          status: "error",
          summary: `Error verifying weather: ${error.message}`,
          snapshot: null,
        };
      }

      // Check news sources
      try {
        const locationQuery = `${report.location.district} ${report.location.state}`;
        const newsData = await newsService.getFloodNews(
          "flood water level",
          locationQuery,
          new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          new Date() // Now
        );

        if (newsData.articles && newsData.articles.length > 0) {
          // Analyze news content for flood-related terms
          const floodTerms = [
            "flood",
            "water level",
            "rainfall",
            "evacuation",
            "rescue",
          ];
          const floodMentions = newsData.articles.filter((article) => {
            const text = (
              article.title +
              " " +
              article.description
            ).toLowerCase();
            return floodTerms.some((term) => text.includes(term.toLowerCase()));
          });

          if (floodMentions.length > 0) {
            verificationResults.news = {
              status: "matched",
              summary: `Found ${floodMentions.length} news articles mentioning flooding in ${report.location.district}`,
              snapshot: newsData,
            };
          } else {
            verificationResults.news = {
              status: "not-matched",
              summary: `Found news articles for the area but none mention flooding`,
              snapshot: newsData,
            };
          }
        } else {
          verificationResults.news = {
            status: "not-matched",
            summary: "No relevant news articles found for this location",
            snapshot: newsData,
          };
        }
      } catch (error) {
        logger.error(`News verification failed: ${error.message}`);
        verificationResults.news = {
          status: "error",
          summary: `Error verifying news: ${error.message}`,
          snapshot: null,
        };
      }

      // Check social media (implementation would connect to social media APIs)
      // This is stubbed for now
      try {
        const socialData = await socialService.getInstagramPosts(
          `${report.location.district}`,
          report.createdAt
        );
        verificationResults.social = {
          status: socialData.status || "coming-soon",
          summary:
            socialData.summary || "Social media verification coming soon",
          snapshot: socialData,
        };
      } catch (error) {
        logger.error(`Social media verification failed: ${error.message}`);
        verificationResults.social = {
          status: "error",
          summary: `Error verifying social media: ${error.message}`,
          snapshot: null,
        };
      }

      // AI confidence calculation and overall verification status
      const confidenceScore =
        this.calculateConfidenceScore(verificationResults);
      verificationResults.confidence = confidenceScore;

      // Calculate overall status
      const overallStatus = this.determineOverallStatus(verificationResults);
      verificationResults.overallStatus = overallStatus.status;
      verificationResults.summary = overallStatus.summary;

      // Update report with verification results
      report.verification = {
        status: verificationResults.overallStatus,
        summary: verificationResults.summary,
        weather: verificationResults.weather,
        news: verificationResults.news,
        social: verificationResults.social,
      };

      report.aiConfidence = confidenceScore;

      // Set verificationStatus based on AI verification (still respects manual moderation)
      if (report.verificationStatus === "pending") {
        if (verificationResults.overallStatus === "verified") {
          report.verificationStatus = "verified";
        } else if (verificationResults.overallStatus === "not-matched") {
          // Only mark as disputed, needs human review before rejection
          report.verificationStatus = "disputed";
        }
      }

      await report.save();
      logger.info(
        `AI verification completed for report ID: ${reportId} with status: ${verificationResults.overallStatus}`
      );

      return verificationResults;
    } catch (error) {
      logger.error(`AI verification service error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate confidence score based on verification results
   * @param {Object} results - Verification results from different sources
   * @returns {Number} - Confidence score (0-1)
   */
  calculateConfidenceScore(results) {
    let score = 0;
    let totalSources = 0;

    // Weather confidence (weight: 0.5)
    if (results.weather.status === "matched") {
      score += 0.5;
    } else if (results.weather.status === "partially-matched") {
      score += 0.25;
    }
    totalSources += 0.5;

    // News confidence (weight: 0.4)
    if (results.news.status === "matched") {
      score += 0.4;
    } else if (results.news.status === "partially-matched") {
      score += 0.2;
    }
    totalSources += 0.4;

    // Social media confidence (weight: 0.1)
    if (results.social.status === "matched") {
      score += 0.1;
    } else if (results.social.status === "partially-matched") {
      score += 0.05;
    }
    totalSources += 0.1;

    // Normalize score based on available sources
    return totalSources > 0
      ? Math.min(Math.round((score / totalSources) * 100) / 100, 1)
      : 0;
  }

  /**
   * Determine overall verification status based on results from different sources
   * @param {Object} results - Verification results
   * @returns {Object} - Overall status and summary
   */
  determineOverallStatus(results) {
    // Get status counts
    const statuses = [results.weather.status, results.news.status];
    const matchedCount = statuses.filter((s) => s === "matched").length;
    const partiallyMatchedCount = statuses.filter(
      (s) => s === "partially-matched"
    ).length;
    const notMatchedCount = statuses.filter((s) => s === "not-matched").length;

    // Rules for determining overall status
    if (matchedCount >= 1) {
      // At least one strong match
      return {
        status: "verified",
        summary: `Verified through ${matchedCount} data sources`,
      };
    } else if (partiallyMatchedCount >= 1 && notMatchedCount === 0) {
      // Some partial matches and no contradictions
      return {
        status: "partially-verified",
        summary: "Partially verified, needs review",
      };
    } else if (notMatchedCount >= 2) {
      // Multiple contradictions
      return {
        status: "not-matched",
        summary: "Could not verify through available data sources",
      };
    } else {
      // Default case, insufficient data
      return {
        status: "manual-review",
        summary:
          "Insufficient data for automatic verification, needs manual review",
      };
    }
  }

  /**
   * Extract flood-related information from text (news articles, social media, etc.)
   * @param {String} text - Text to analyze
   * @returns {Object} - Flood information extracted
   */
  extractFloodInformation(text) {
    const floodTerms = [
      "flood",
      "flooding",
      "flooded",
      "water level",
      "rising water",
      "heavy rain",
      "overflow",
      "evacuation",
      "submerged",
      "underwater",
      "rescue",
      "emergency",
    ];

    // Count flood-related terms
    let floodTermCount = 0;
    floodTerms.forEach((term) => {
      const regex = new RegExp(term, "gi");
      const matches = text.match(regex) || [];
      floodTermCount += matches.length;
    });

    // Simple text-based information extraction
    // In a real system, this could use NLP techniques like named entity recognition
    return {
      floodMentioned: floodTermCount > 0,
      floodTermCount,
      relevanceScore: Math.min(floodTermCount / 5, 1), // Scale 0-1
    };
  }

  /**
   * Bulk verification of multiple pending reports
   * @param {Number} limit - Maximum number of reports to verify
   * @returns {Object} - Results summary
   */
  async bulkVerifyPendingReports(limit = 10) {
    try {
      const pendingReports = await FloodReport.find({
        verificationStatus: "pending",
        "verification.status": { $ne: "manual-review" },
      })
        .sort({ createdAt: -1 })
        .limit(limit);

      if (pendingReports.length === 0) {
        return { processed: 0, message: "No pending reports found" };
      }

      const results = {
        processed: 0,
        verified: 0,
        disputed: 0,
        failed: 0,
      };

      for (const report of pendingReports) {
        try {
          const verificationResult = await this.verifyFloodReport(report._id);
          results.processed++;

          if (verificationResult.overallStatus === "verified") {
            results.verified++;
          } else if (verificationResult.overallStatus === "not-matched") {
            results.disputed++;
          }
        } catch (error) {
          logger.error(
            `Error verifying report ${report._id}: ${error.message}`
          );
          results.failed++;
        }
      }

      return results;
    } catch (error) {
      logger.error(`Bulk verification error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AIVerificationService();
