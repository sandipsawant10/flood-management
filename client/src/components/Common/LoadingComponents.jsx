import React from "react";
import {
  Box,
  Spinner,
  Text,
  VStack,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { Loader2 } from "lucide-react";

// Basic loading spinner
export const LoadingSpinner = ({
  size = "md",
  color = "blue.500",
  thickness = "4px",
  message = "Loading...",
  showMessage = true,
}) => (
  <VStack spacing={3} align="center" justify="center" py={8}>
    <Spinner size={size} color={color} thickness={thickness} />
    {showMessage && (
      <Text fontSize="sm" color="gray.600">
        {message}
      </Text>
    )}
  </VStack>
);

// Full page loading overlay
export const LoadingOverlay = ({
  isVisible,
  message = "Loading...",
  backdrop = true,
  children,
}) => {
  if (!isVisible) return children;

  return (
    <Box position="relative">
      {children}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={backdrop ? "whiteAlpha.800" : "transparent"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={1000}
      >
        <VStack spacing={3}>
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <Text fontSize="sm" color="gray.600">
            {message}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

// Card loading skeleton
export const CardSkeleton = ({
  lines = 3,
  showAvatar = false,
  height = "200px",
}) => (
  <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" height={height}>
    <VStack align="stretch" spacing={3}>
      {showAvatar && (
        <Box display="flex" alignItems="center">
          <Skeleton height="40px" width="40px" borderRadius="full" mr={3} />
          <SkeletonText noOfLines={1} width="150px" />
        </Box>
      )}
      <SkeletonText noOfLines={lines} spacing={2} />
    </VStack>
  </Box>
);

// List loading skeleton
export const ListSkeleton = ({
  items = 3,
  showAvatar = true,
  itemHeight = "60px",
}) => (
  <VStack spacing={2} align="stretch">
    {Array.from({ length: items }, (_, index) => (
      <Box
        key={index}
        p={3}
        borderWidth="1px"
        borderRadius="md"
        bg="white"
        height={itemHeight}
        display="flex"
        alignItems="center"
      >
        {showAvatar && (
          <Skeleton height="32px" width="32px" borderRadius="full" mr={3} />
        )}
        <VStack flex={1} align="stretch" spacing={1}>
          <Skeleton height="16px" width="80%" />
          <Skeleton height="12px" width="60%" />
        </VStack>
      </Box>
    ))}
  </VStack>
);

// Map loading placeholder
export const MapSkeleton = ({ height = "400px" }) => (
  <Box
    height={height}
    bg="gray.100"
    borderRadius="md"
    display="flex"
    alignItems="center"
    justifyContent="center"
    position="relative"
    overflow="hidden"
  >
    {/* Animated background */}
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)"
      animation="shimmer 1.5s infinite"
      sx={{
        "@keyframes shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      }}
    />
    <VStack spacing={3} color="gray.500">
      <Loader2 className="w-8 h-8 animate-spin" />
      <Text fontSize="sm">Loading map data...</Text>
    </VStack>
  </Box>
);

// Chart/Graph loading placeholder
export const ChartSkeleton = ({ height = "300px" }) => (
  <Box
    height={height}
    p={4}
    borderRadius="md"
    bg="white"
    borderWidth="1px"
    display="flex"
    flexDirection="column"
  >
    <Skeleton height="20px" width="200px" mb={4} />
    <Box
      flex={1}
      display="flex"
      alignItems="end"
      justifyContent="space-between"
    >
      {Array.from({ length: 7 }, (_, index) => (
        <Skeleton
          key={index}
          width="30px"
          height={`${Math.random() * 80 + 20}%`}
          borderRadius="sm"
        />
      ))}
    </Box>
  </Box>
);

// Button loading state
export const LoadingButton = ({
  isLoading,
  children,
  loadingText = "Loading...",
  ...props
}) => (
  <button
    {...props}
    disabled={isLoading || props.disabled}
    className={`${props.className} ${
      isLoading ? "opacity-75 cursor-not-allowed" : ""
    }`}
  >
    {isLoading ? (
      <span className="flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        {loadingText}
      </span>
    ) : (
      children
    )}
  </button>
);

// Table loading skeleton
export const TableSkeleton = ({ rows = 5, columns = 4, showHeader = true }) => (
  <Box borderWidth="1px" borderRadius="lg" bg="white" overflow="hidden">
    {showHeader && (
      <Box p={4} borderBottomWidth="1px" bg="gray.50">
        <Box display="flex" justifyContent="space-between">
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton key={index} height="16px" width="80px" />
          ))}
        </Box>
      </Box>
    )}
    <VStack spacing={0} align="stretch">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <Box
          key={rowIndex}
          p={4}
          borderBottomWidth={rowIndex < rows - 1 ? "1px" : "0"}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton
              key={colIndex}
              height="16px"
              width={colIndex === 0 ? "120px" : "80px"}
            />
          ))}
        </Box>
      ))}
    </VStack>
  </Box>
);

// Inline loading state for small components
export const InlineLoader = ({ size = 16, className = "" }) => (
  <Loader2
    className={`w-${size / 4} h-${size / 4} animate-spin ${className}`}
  />
);

export default {
  LoadingSpinner,
  LoadingOverlay,
  CardSkeleton,
  ListSkeleton,
  MapSkeleton,
  ChartSkeleton,
  LoadingButton,
  TableSkeleton,
  InlineLoader,
};
