import React, { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  Text,
  VStack,
  HStack,
  useToast
} from '@chakra-ui/react';
import { PhoneCall, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

const EmergencyCallsList = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCall, setSelectedCall] = useState(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: emergencyCalls = [], isLoading } = useQuery({
    queryKey: ['emergencyCalls'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/rescuers/emergency-calls');
      return response.data;
    }
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/rescuers/teams');
      return response.data;
    }
  });

  const updateCallStatus = useMutation({
    mutationFn: async ({ callId, data }) => {
      const response = await axios.put(`/api/admin/rescuers/emergency-calls/${callId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['emergencyCalls']);
      onClose();
      toast({
        title: 'Emergency Call Updated',
        status: 'success',
        duration: 3000
      });
    }
  });

  const handleStatusUpdate = (call) => {
    setSelectedCall(call);
    onOpen();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updateData = {
      status: formData.get('status'),
      assignedTeam: formData.get('assignedTeam'),
      priority: formData.get('priority')
    };

    updateCallStatus.mutate({
      callId: selectedCall._id,
      data: updateData
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'in_progress':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Caller</Th>
            <Th>Location</Th>
            <Th>Time</Th>
            <Th>Priority</Th>
            <Th>Status</Th>
            <Th>Assigned Team</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {emergencyCalls.map((call) => (
            <Tr key={call._id}>
              <Td>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">{call.callerName}</Text>
                  <Text fontSize="sm" color="gray.600">{call.phoneNumber}</Text>
                </VStack>
              </Td>
              <Td>{call.location}</Td>
              <Td>{format(new Date(call.timestamp), 'MMM d, yyyy HH:mm')}</Td>
              <Td>
                <Badge colorScheme={getPriorityColor(call.priority)}>
                  {call.priority}
                </Badge>
              </Td>
              <Td>
                <Badge colorScheme={getStatusColor(call.status)}>
                  {call.status}
                </Badge>
              </Td>
              <Td>
                {teams.find(team => team._id === call.assignedTeam)?.name || 'Unassigned'}
              </Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    icon={<PhoneCall />}
                    aria-label="Update call status"
                    colorScheme="blue"
                    onClick={() => handleStatusUpdate(call)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit}>
          <ModalHeader>Update Emergency Call</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  defaultValue={selectedCall?.status}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Priority</FormLabel>
                <Select
                  name="priority"
                  defaultValue={selectedCall?.priority}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Assigned Team</FormLabel>
                <Select
                  name="assignedTeam"
                  defaultValue={selectedCall?.assignedTeam}
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={updateCallStatus.isLoading}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EmergencyCallsList;