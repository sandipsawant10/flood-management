import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { RefreshCw, AlertTriangle } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    console.log("Error caught by boundary:", error);
    return {
      hasError: true,
      errorId: Date.now(), // Simple error ID for tracking
    };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Optional: Send error to monitoring service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <Box
          p={6}
          maxW="lg"
          mx="auto"
          mt={8}
          borderRadius="lg"
          boxShadow="lg"
          bg="white"
          border="1px"
          borderColor="gray.200"
        >
          <VStack spacing={4} align="stretch">
            <Alert status="error" borderRadius="md">
              <AlertIcon as={AlertTriangle} />
              <Box>
                <AlertTitle>Something went wrong!</AlertTitle>
                <AlertDescription>
                  {this.props.message ||
                    "An unexpected error occurred in this component."}
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={3} align="stretch">
              <Heading size="md" color="red.500">
                Component Error
              </Heading>

              <Text fontSize="sm" color="gray.600">
                Error ID: {this.state.errorId}
              </Text>

              {this.props.showDetails && this.state.error && (
                <Box
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  fontSize="xs"
                  fontFamily="mono"
                  overflow="auto"
                  maxH="200px"
                >
                  <Text fontWeight="bold" mb={2}>
                    Error Details:
                  </Text>
                  <Text color="red.600">{this.state.error.toString()}</Text>
                  {this.state.errorInfo && (
                    <>
                      <Text fontWeight="bold" mt={3} mb={2}>
                        Component Stack:
                      </Text>
                      <Text color="gray.600" whiteSpace="pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </>
                  )}
                </Box>
              )}

              <VStack spacing={2}>
                <Button
                  leftIcon={<RefreshCw size={16} />}
                  colorScheme="blue"
                  onClick={this.handleRetry}
                  size="sm"
                >
                  Try Again
                </Button>

                {this.props.showReportButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // You could implement error reporting here
                      console.log("Report error clicked");
                    }}
                  >
                    Report Issue
                  </Button>
                )}

                {this.props.onGoBack && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.props.onGoBack}
                  >
                    Go Back
                  </Button>
                )}
              </VStack>
            </VStack>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
