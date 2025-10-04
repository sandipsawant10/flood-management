import React from "react";
import ErrorBoundary from "./ErrorBoundary";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
} from "@chakra-ui/react";

// Hook-based wrapper for functional components
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};

// Lightweight error boundary for specific use cases
export const SimpleErrorBoundary = ({ children, fallback = null }) => {
  return (
    <ErrorBoundary
      fallback={
        fallback ||
        ((error, retry) => (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong.
                <Button size="sm" ml={2} onClick={retry}>
                  Retry
                </Button>
              </AlertDescription>
            </Box>
          </Alert>
        ))
      }
    >
      {children}
    </ErrorBoundary>
  );
};
