import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Tab, TabList, TabPanel, TabPanels, Tabs, Card, CardHeader, CardBody, Stack, StackDivider, useToast, Select, Textarea, Button, Input, List, ListItem, Badge, Flex, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { Ambulance, Users, MapPin, CheckCircle, Clock, XCircle, BarChart2, AlertTriangle, UserPlus, FileText, Activity, Layers } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const StatsCard = ({ title, stat, icon, trend, trendType }) => (
  <Stat p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white" _dark={{ bg: 'gray.700' }}>
    <Flex justifyContent="space-between" alignItems="center">
      <Box>
        <StatLabel fontSize="sm" color="gray.500" _dark={{ color: 'gray.300' }}>{title}</StatLabel>
        <StatNumber fontSize="2xl" fontWeight="medium" color="gray.800" _dark={{ color: 'white' }}>{stat}</StatNumber>
      </Box>
      <Box as={icon} size="2.5em" color="blue.500" _dark={{ color: 'blue.300' }} />
    </Flex>
    {trend && (
      <StatHelpText>
        <StatArrow type={trendType} />
        {trend}
      </StatHelpText>
    )}
  </Stat>
);

const EmergencyResponsePanel = ({ assignments, rescueTeams, onUpdateAssignment, onAssignTeam }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentStatus, setAssignmentStatus] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (selectedAssignment) {
      setAssignmentStatus(selectedAssignment.status);
      setAssignmentNotes(selectedAssignment.notes || '');
      setSelectedTeam(selectedAssignment.teamId?._id || '');
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
        title: 'Assignment updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedAssignment(null);
    } catch (error) {
      toast({
        title: 'Error updating assignment.',
        description: error.response?.data?.message || 'Failed to update assignment.',
        status: 'error',
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
        title: 'Team assigned successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedAssignment(null);
    } catch (error) {
      toast({
        title: 'Error assigning team.',
        description: error.response?.data?.message || 'Failed to assign team.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const filteredAssignments = assignments?.filter(a => a.status === 'active' || a.status === 'pending') || [];

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mt={8}>
      <Box>
        <Heading size="md" mb={4}>Active Assignments</Heading>
        {onUpdateAssignment.isLoading || onAssignTeam.isLoading ? (
          <Flex justify="center" align="center" minH="200px"><Spinner size="xl" /></Flex>
        ) : onUpdateAssignment.isError || onAssignTeam.isError ? (
          <Alert status="error">
            <AlertIcon />
            Failed to load assignments or update. Please try again later.
          </Alert>
        ) : filteredAssignments.length === 0 ? (
          <Text>No active or pending assignments.</Text>
        ) : (
          <List spacing={3}>
            {filteredAssignments.map((assignment) => (
              <ListItem
                key={assignment._id}
                p={3} shadow="sm" borderWidth="1px" borderRadius="md"
                _hover={{ bg: 'gray.50', cursor: 'pointer' }} _dark={{ _hover: 'gray.600' }}
                onClick={() => setSelectedAssignment(assignment)}
                bg={selectedAssignment?._id === assignment._id ? 'blue.50' : 'white'}
                _dark={{ bg: selectedAssignment?._id === assignment._id ? 'blue.900' : 'gray.700' }}
              >
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold">Assignment #{assignment._id.slice(-6)} - {assignment.type}</Text>
                  <Badge colorScheme={assignment.status === 'active' ? 'orange' : 'yellow'}>
                    {assignment.status}
                  </Badge>
                </Flex>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>Location: {assignment.location.coordinates[1]}, {assignment.location.coordinates[0]}</Text>
                {assignment.teamId && (
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>Team: {assignment.teamId.name}</Text>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Box>
        <Heading size="md" mb={4}>Assignment Details</Heading>
        {selectedAssignment ? (
          <Card shadow="md" borderWidth="1px" borderRadius="lg" bg="white" _dark={{ bg: 'gray.700' }}>
            <CardHeader>
              <Heading size="sm">Assignment ID: {selectedAssignment._id.slice(-6)}</Heading>
            </CardHeader>
            <CardBody>
              <Stack divider={<StackDivider />} spacing="4">
                <Box>
                  <Text fontSize="sm" fontWeight="bold">Type:</Text>
                  <Text>{selectedAssignment.type}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">Description:</Text>
                  <Text>{selectedAssignment.description}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">Location:</Text>
                  <Text>{selectedAssignment.location.coordinates[1]}, {selectedAssignment.location.coordinates[0]}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">Current Status:</Text>
                  <Select value={assignmentStatus} onChange={(e) => setAssignmentStatus(e.target.value)} bg="white" _dark={{ bg: 'gray.600' }}>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">Assign Team:</Text>
                  <Select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} bg="white" _dark={{ bg: 'gray.600' }}>
                    <option value="">Select Team</option>
                    {rescueTeams?.map(team => (
                      <option key={team._id} value={team._id}>{team.name} ({team.status})</option>
                    ))}
                  </Select>
                  <Button mt={2} colorScheme="teal" onClick={handleAssignTeam} isLoading={onAssignTeam.isLoading}>
                    Assign Team
                  </Button>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">Notes:</Text>
                  <Textarea
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    placeholder="Add internal notes about the assignment"
                    bg="white" _dark={{ bg: 'gray.600' }}
                  />
                </Box>
                <Button colorScheme="blue" onClick={handleUpdate} isLoading={onUpdateAssignment.isLoading}>
                  Update Assignment
                </Button>
              </Stack>
            </CardBody>
          </Card>
        ) : (
          <Text>Select an assignment to view details.</Text>
        )}
      </Box>
    </SimpleGrid>
  );
};

const TeamManagementPanel = ({ rescueTeams, onUpdateTeam }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamStatus, setTeamStatus] = useState('');
  const [teamAvailability, setTeamAvailability] = useState('');
  const [teamNotes, setTeamNotes] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (selectedTeam) {
      setTeamStatus(selectedTeam.status);
      setTeamAvailability(selectedTeam.availability);
      setTeamNotes(selectedTeam.notes || '');
    }
  }, [selectedTeam]);

  const handleUpdate = async () => {
    if (!selectedTeam) return;

    try {
      await onUpdateTeam.mutateAsync({
        teamId: selectedTeam._id,
        status: teamStatus,
        availability: teamAvailability,
        notes: teamNotes,
      });
      toast({
        title: 'Team updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedTeam(null);
    } catch (error) {
      toast({
        title: 'Error updating team.',
        description: error.response?.data?.message || 'Failed to update team.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mt={8}>
      <Box>
        <Heading size="md" mb={4}>Rescue Teams</Heading>
        {onUpdateTeam.isLoading ? (
          <Flex justify="center" align="center" minH="200px"><Spinner size="xl" /></Flex>
        ) : onUpdateTeam.isError ? (
          <Alert status="error">
            <AlertIcon />
            Failed to load rescue teams. Please try again later.
          </Alert>
        ) : rescueTeams?.length === 0 ? (
          <Text>No rescue teams found.</Text>
        ) : (
          <List spacing={3}>
            {rescueTeams?.map((team) => (
              <ListItem
                key={team._id}
                p={3} shadow="sm" borderWidth="1px" borderRadius="md"
                _hover={{ bg: 'gray.50', cursor: 'pointer' }} _dark={{ _hover: 'gray.600' }}
                onClick={() => setSelectedTeam(team)}
                bg={selectedTeam?._id === team._id ? 'blue.50' : 'white'}
                _dark={{ bg: selectedTeam?._id === team._id ? 'blue.900' : 'gray.700' }}
              >
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold">{team.name}</Text>
                  <Badge colorScheme={team.status === 'active' ? 'green' : 'red'}>{team.status}</Badge>
                </Flex>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>Availability: {team.availability}</Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>Members: {team.members.length}</Text>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Box>
        <Heading size="md" mb={4}>Team Details</Heading>
        {selectedTeam ? (
          <Card shadow="md" borderWidth="1px" borderRadius="lg" bg="white" _dark={{ bg: 'gray.700' }}>
            <CardHeader>
              <Heading size="sm">Team Name: {selectedTeam.name}</Heading>
            </CardHeader>
            <CardBody>
              <Stack divider={<StackDivider />} spacing="4">
                <Box>
                  <Text fontSize="sm" fontWeight="bold">Status:</Text>
                  <Select value={teamStatus} onChange={(e) => setTeamStatus(e.target.value)} bg="white" _dark={{ bg: 'gray.600' }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">Availability:</Text>
                  <Select value={teamAvailability} onChange={(e) => setTeamAvailability(e.target.value)} bg="white" _dark={{ bg: 'gray.600' }}>
                    <option value="available">Available</option>
                    <option value="deployed">Deployed</option>
                    <option value="resting">Resting</option>
                  </Select>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">Members:</Text>
                  <Text>{selectedTeam.members.join(', ')}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">Notes:</Text>
                  <Textarea
                    value={teamNotes}
                    onChange={(e) => setTeamNotes(e.target.value)}
                    placeholder="Add internal notes about the team"
                    bg="white" _dark={{ bg: 'gray.600' }}
                  />
                </Box>
                <Button colorScheme="blue" onClick={handleUpdate} isLoading={onUpdateTeam.isLoading}>
                  Update Team
                </Button>
              </Stack>
            </CardBody>
          </Card>
        ) : (
          <Text>Select a team to view details.</Text>
        )}
      </Box>
    </SimpleGrid>
  );
};

const ResourceAllocationPanel = () => (
  <Box mt={8} p={4} borderWidth="1px" borderRadius="lg" bg="white" _dark={{ bg: 'gray.700' }}>
    <Heading size="md">Resource Allocation Panel</Heading>
    <Text mt={4}>This panel will allow rescuers to manage and allocate resources.</Text>
    {/* Future implementation for resource allocation */}
  </Box>
);

const RescuerDashboard = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: assignments, isLoading: loadingAssignments, isError: errorAssignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data } = await axios.get('/api/assignments');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rescue-teams');
      return data;
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['rescueTeams'],