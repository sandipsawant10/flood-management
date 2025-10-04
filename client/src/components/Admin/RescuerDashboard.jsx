import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Card,
  CardHeader,
  CardBody,
  Stack,
  StackDivider,
  useToast,
  Select,
  Textarea,
  Button,
  Input,
  List,
  ListItem,
  Badge,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  Ambulance,
  Users,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  BarChart2,
  AlertTriangle,
  UserPlus,
  FileText,
  Activity,
  Layers,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const StatsCard = ({ title, stat, icon, trend, trendType }) => (
  <Stat
    p={5}
    shadow="md"
    borderWidth="1px"
    borderRadius="lg"
    bg="white"
    _dark={{ bg: "gray.700" }}
  >
    <Flex justifyContent="space-between" alignItems="center">
      <Box>
        <StatLabel fontSize="sm" color="gray.500" _dark={{ color: "gray.300" }}>
          {title}
        </StatLabel>
        <StatNumber
          fontSize="2xl"
          fontWeight="medium"
          color="gray.800"
          _dark={{ color: "white" }}
        >
          {stat}
        </StatNumber>
      </Box>
      <Box
        as={icon}
        size="2.5em"
        color="blue.500"
        _dark={{ color: "blue.300" }}
      />
    </Flex>
    {trend && (
      <StatHelpText>
        <StatArrow type={trendType} />
        {trend}
      </StatHelpText>
    )}
  </Stat>
);

const EmergencyResponsePanel = ({
  assignments,
  rescueTeams,
  onUpdateAssignment,
  onAssignTeam,
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentStatus, setAssignmentStatus] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (selectedAssignment) {
      setAssignmentStatus(selectedAssignment.status);
      setAssignmentNotes(selectedAssignment.notes || "");
      setSelectedTeam(selectedAssignment.teamId?._id || "");
    }
  }, [selectedAssignment]);

  const handleUpdate = async () => {
    if (!selectedAssignment) return;

    try {
      await onUpdateAssignment.mutateAsync({
        assignmentId: selectedAssignment._id,
        status: assignmentStatus,
        notes: assignmentNotes,
      });
      toast({
        title: "Assignment updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating assignment.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAssignTeam = async () => {
    if (!selectedAssignment || !selectedTeam) return;

    try {
      await onAssignTeam.mutateAsync({
        assignmentId: selectedAssignment._id,
        teamId: selectedTeam,
      });
      toast({
        title: "Team assigned.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error assigning team.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      mt={8}
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      _dark={{ bg: "gray.700" }}
    >
      <Heading size="md">Emergency Response Management</Heading>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={4}>
        <Box>
          <Heading size="sm" mb={3}>
            Active Assignments
          </Heading>
          <List spacing={3} maxHeight="400px" overflowY="auto">
            {assignments
              ?.filter((a) => a.status !== "completed")
              .map((assignment) => (
                <ListItem
                  key={assignment._id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => setSelectedAssignment(assignment)}
                  bg={
                    selectedAssignment?._id === assignment._id
                      ? "blue.50"
                      : "white"
                  }
                  _dark={{
                    bg:
                      selectedAssignment?._id === assignment._id
                        ? "blue.900"
                        : "gray.600",
                  }}
                >
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box>
                      <Text fontWeight="medium">{assignment.title}</Text>
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        _dark={{ color: "gray.300" }}
                      >
                        Priority: {assignment.priority}
                      </Text>
                    </Box>
                    <Badge
                      colorScheme={
                        assignment.status === "urgent"
                          ? "red"
                          : assignment.status === "in-progress"
                          ? "yellow"
                          : "green"
                      }
                    >
                      {assignment.status}
                    </Badge>
                  </Flex>
                </ListItem>
              ))}
          </List>
        </Box>

        <Box>
          <Heading size="sm" mb={3}>
            Assignment Details
          </Heading>
          {selectedAssignment ? (
            <Stack spacing={3}>
              <Box>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: "gray.300" }}
                >
                  Title:
                </Text>
                <Text fontWeight="medium">{selectedAssignment.title}</Text>
              </Box>

              <Box>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: "gray.300" }}
                  mb={2}
                >
                  Status:
                </Text>
                <Select
                  value={assignmentStatus}
                  onChange={(e) => setAssignmentStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </Box>

              <Box>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: "gray.300" }}
                  mb={2}
                >
                  Assign Team:
                </Text>
                <Select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  <option value="">Select Team</option>
                  {rescueTeams?.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: "gray.300" }}
                  mb={2}
                >
                  Notes:
                </Text>
                <Textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="Add notes about this assignment..."
                />
              </Box>

              <Stack direction="row" spacing={2}>
                <Button colorScheme="blue" onClick={handleUpdate}>
                  Update Assignment
                </Button>
                <Button colorScheme="green" onClick={handleAssignTeam}>
                  Assign Team
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Text color="gray.500" _dark={{ color: "gray.400" }}>
              Select an assignment to view details
            </Text>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
};

const TeamManagementPanel = ({ rescueTeams }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    if (rescueTeams && rescueTeams.length > 0) {
      setSelectedTeam(rescueTeams[0]);
    }
  }, [rescueTeams]);

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "green";
      case "deployed":
        return "yellow";
      case "off-duty":
        return "gray";
      default:
        return "blue";
    }
  };

  return (
    <Box
      mt={8}
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      _dark={{ bg: "gray.700" }}
    >
      <Heading size="md">Team Management</Heading>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={4}>
        <Box>
          <Heading size="sm" mb={3}>
            Rescue Teams
          </Heading>
          <List spacing={3} maxHeight="400px" overflowY="auto">
            {rescueTeams?.map((team) => (
              <ListItem
                key={team._id}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                cursor="pointer"
                onClick={() => handleTeamSelect(team)}
                bg={selectedTeam?._id === team._id ? "blue.50" : "white"}
                _dark={{
                  bg: selectedTeam?._id === team._id ? "blue.900" : "gray.600",
                }}
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Box>
                    <Text fontWeight="medium">{team.name}</Text>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      _dark={{ color: "gray.300" }}
                    >
                      {team.members?.length || 0} members
                    </Text>
                  </Box>
                  <Badge colorScheme={getStatusColor(team.status)}>
                    {team.status}
                  </Badge>
                </Flex>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box>
          <Heading size="sm" mb={3}>
            Team Details
          </Heading>
          {selectedTeam ? (
            <Stack spacing={3}>
              <Box>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: "gray.300" }}
                >
                  Team Name:
                </Text>
                <Text fontWeight="medium">{selectedTeam.name}</Text>
              </Box>

              <Box>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: "gray.300" }}
                >
                  Status:
                </Text>
                <Badge colorScheme={getStatusColor(selectedTeam.status)}>
                  {selectedTeam.status}
                </Badge>
              </Box>

              <Box>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: "gray.300" }}
                >
                  Members:
                </Text>
                <List spacing={1}>
                  {selectedTeam.members?.map((member) => (
                    <ListItem key={member._id} fontSize="sm">
                      {member.name} - {member.role}
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: "gray.300" }}
                >
                  Equipment:
                </Text>
                <List spacing={1}>
                  {selectedTeam.equipment?.map((item, index) => (
                    <ListItem key={index} fontSize="sm">
                      {item}
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Stack>
          ) : (
            <Text color="gray.500" _dark={{ color: "gray.400" }}>
              No team selected
            </Text>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
};

const ResourceAllocationPanel = () => (
  <Box
    mt={8}
    p={4}
    borderWidth="1px"
    borderRadius="lg"
    bg="white"
    _dark={{ bg: "gray.700" }}
  >
    <Heading size="md">Resource Allocation Panel</Heading>
    <Text mt={4}>
      This panel will allow rescuers to manage and allocate resources.
    </Text>
    {/* Future implementation for resource allocation */}
  </Box>
);

const RescuerDashboard = () => {
  const queryClient = useQueryClient();

  const {
    data: assignments,
    isLoading: loadingAssignments,
    isError: errorAssignments,
  } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const { data } = await axios.get("/api/assignments");
      return data;
    },
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["rescueTeams"],
    queryFn: async () => {
      const { data } = await axios.get("/api/rescue-teams");
      return data;
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, ...updates }) => {
      const { data } = await axios.put(
        `/api/assignments/${assignmentId}`,
        updates
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["assignments"]);
    },
  });

  const assignTeamMutation = useMutation({
    mutationFn: async ({ assignmentId, teamId }) => {
      const { data } = await axios.put(
        `/api/assignments/${assignmentId}/assign-team`,
        { teamId }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["assignments"]);
    },
  });

  if (loadingAssignments || teamsLoading) {
    return (
      <Flex justify="center" align="center" height="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (errorAssignments) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error loading assignments: {errorAssignments.message}
      </Alert>
    );
  }

  const activeAssignments =
    assignments?.filter((a) => a.status !== "completed") || [];
  const completedAssignments =
    assignments?.filter((a) => a.status === "completed") || [];
  const urgentAssignments =
    assignments?.filter((a) => a.status === "urgent") || [];
  const availableTeams = teams?.filter((t) => t.status === "available") || [];

  return (
    <Box p={6}>
      <Heading mb={6} color="gray.800" _dark={{ color: "white" }}>
        Rescuer Dashboard
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatsCard
          title="Active Assignments"
          stat={activeAssignments.length}
          icon={Activity}
          trend="12% from last week"
          trendType="increase"
        />
        <StatsCard
          title="Urgent Cases"
          stat={urgentAssignments.length}
          icon={AlertTriangle}
          trend="3% from last week"
          trendType="increase"
        />
        <StatsCard
          title="Available Teams"
          stat={availableTeams.length}
          icon={Users}
          trend="8% from last week"
          trendType="increase"
        />
        <StatsCard
          title="Completed Today"
          stat={completedAssignments.length}
          icon={CheckCircle}
          trend="15% from yesterday"
          trendType="increase"
        />
      </SimpleGrid>

      <Tabs colorScheme="blue">
        <TabList>
          <Tab>Emergency Response</Tab>
          <Tab>Team Management</Tab>
          <Tab>Resource Allocation</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <EmergencyResponsePanel
              assignments={assignments}
              rescueTeams={teams}
              onUpdateAssignment={updateAssignmentMutation}
              onAssignTeam={assignTeamMutation}
            />
          </TabPanel>

          <TabPanel px={0}>
            <TeamManagementPanel rescueTeams={teams} />
          </TabPanel>

          <TabPanel px={0}>
            <ResourceAllocationPanel />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default RescuerDashboard;
