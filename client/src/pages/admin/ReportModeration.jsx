import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Select,
  Input,
  Stack,
  Text,
  useToast,
  HStack,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import floodReportService from "../../services/floodReportService";
import adminService from "../../services/adminService";

const ReportReviewPage = () => {
  const [reports, setReports] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [moderationReason, setModerationReason] = useState("");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await floodReportService.getAdminFloodReports();
      setReports(data.docs || data);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, searchTerm, statusFilter]);

  const handleModeration = async (action) => {
    try {
      await adminService.moderateReport(
        selectedReport._id,
        action,
        moderationReason
      );
      toast({
        title: "Report moderated",
        description: `Report has been ${action} successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setModerationReason("");
      fetchReports();
    } catch (error) {
      toast({
        title: "Error moderating report",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: "yellow",
      verified: "green",
      rejected: "red",
    };
    return colors[status] || "gray";
  };

  return (
    <Box p={4}>
      <Stack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Report Moderation
        </Text>

        <HStack spacing={4}>
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftElement={<SearchIcon color="gray.400" />}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            w="200px"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </Select>
        </HStack>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Location</Th>
              <Th>Reporter</Th>
              <Th>Status</Th>
              <Th>Severity</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {reports.map((report) => (
              <Tr key={report._id}>
                <Td>{report.location.address}</Td>
                <Td>{report.reportedBy?.name}</Td>
                <Td>
                  <Badge
                    colorScheme={getStatusBadgeColor(report.verificationStatus)}
                  >
                    {report.verificationStatus}
                  </Badge>
                </Td>
                <Td>{report.severity}</Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => {
                      setSelectedReport(report);
                      onOpen();
                    }}
                    isDisabled={report.verificationStatus !== "pending"}
                  >
                    Moderate
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <HStack justifyContent="center" spacing={4}>
          <IconButton
            icon={<ChevronLeftIcon />}
            onClick={() => setPage(page - 1)}
            isDisabled={page === 1}
          />
          <Text>
            Page {page} of {totalPages}
          </Text>
          <IconButton
            icon={<ChevronRightIcon />}
            onClick={() => setPage(page + 1)}
            isDisabled={page === totalPages}
          />
        </HStack>
      </Stack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Moderate Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Text>Location: {selectedReport?.location.address}</Text>
              <Text>Reporter: {selectedReport?.reportedBy?.name}</Text>
              <Text>Description: {selectedReport?.description}</Text>
              <Textarea
                placeholder="Enter moderation reason..."
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
              />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="green"
              mr={3}
              onClick={() => handleModeration("verify")}
            >
              Verify
            </Button>
            <Button
              colorScheme="red"
              onClick={() => handleModeration("reject")}
            >
              Reject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ReportReviewPage;
