import React from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Shield,
  Users,
  MapPin,
  ArrowRight,
  CheckCircle,
  Phone,
  Eye,
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: AlertTriangle,
      title: "Real-time Flood Reports",
      description:
        "Community-driven flood reporting with instant alerts and notifications",
      color: "blue",
    },
    {
      icon: Shield,
      title: "Emergency Response",
      description:
        "Quick access to emergency services and evacuation information",
      color: "red",
    },
    {
      icon: MapPin,
      title: "Interactive Maps",
      description: "Live flood mapping with severity levels and affected areas",
      color: "green",
    },
    {
      icon: Users,
      title: "Community Validation",
      description: "Crowd-sourced verification system for accurate information",
      color: "purple",
    },
  ];

  const stats = [
    {
      label: "Vulnerable Population",
      value: "640M+",
      description: "People in flood-prone areas",
    },
    {
      label: "Market Opportunity",
      value: "$2.5B",
      description: "Projected by 2033",
    },
    { label: "Response Time", value: "20%", description: "Improvement target" },
    {
      label: "Lives Saved",
      value: "50+",
      description: "Through early warnings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Aqua Assists
                </h1>
                <p className="text-sm text-gray-600">
                  Flood Disaster Management
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Protect Your Community from Floods
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Real-time flood monitoring, community reporting, and emergency
              response system for India's flood-vulnerable population
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium flex items-center justify-center"
              >
                Start Reporting <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/emergency"
                className="bg-red-600 text-white hover:bg-red-700 px-8 py-3 rounded-lg text-lg font-medium flex items-center justify-center"
              >
                <Phone className="mr-2 w-5 h-5" />
                Emergency Help
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Addressing India's Flood Challenge
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Based on comprehensive research targeting India's vulnerable
              flood-prone districts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-medium text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Flood Management
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced technology meets community action for effective disaster
              response
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 text-center"
              >
                <div
                  className={`w-16 h-16 bg-${feature.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}
                >
                  <feature.icon
                    className={`w-8 h-8 text-${feature.color}-600`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Aqua Assists Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Report Floods</h3>
              <p className="text-gray-600">
                Citizens report flood conditions with photos, location, and
                severity details
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Community Validation
              </h3>
              <p className="text-gray-600">
                Reports are verified by community members and official
                authorities
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Emergency Response</h3>
              <p className="text-gray-600">
                Alerts sent to affected areas and emergency services coordinated
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the Aqua Assists Community Today
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Help protect your community and save lives through real-time flood
            reporting and emergency coordination
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg text-lg font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-2">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Aqua Assists</span>
              </div>
              <p className="text-gray-400">
                Protecting India's communities from flood disasters through
                technology and collective action.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Flood Reporting</li>
                <li>Emergency Alerts</li>
                <li>Interactive Maps</li>
                <li>Community Validation</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Emergency</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Police: 100</li>
                <li>Fire: 101</li>
                <li>Medical: 108</li>
                <li>Disaster Management: 1070</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: help@Aqua Assists.in</li>
                <li>Emergency: 24/7 Support</li>
                <li>Community: Join Discord</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 Aqua Assists. Built for India's flood disaster
              management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
