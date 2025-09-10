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
  Input,
  Select,
  Textarea,
  VStack,
  useToast
} from '@chakra-ui/react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const AssignmentManager = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/rescuers/assignments');
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

  const createAssignment = useMutation({
    mutationFn: async (assignmentData) => {
      const response = await axios.post('/api/admin/rescuers/assignments', assignmentData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments']);
      onClose();
      toast({
        title: 'Assignment Created',
        status: 'success',
        duration: 3000
      });
    }
  });

  const updateAssignment = useMutation({
    mutationFn: async ({ assignmentId, data }) => {
      const response = await axios.put(`/api/admin/rescuers/assignments/${assignmentId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments']);
      onClose();
      toast({
        title: 'Assignment Updated',
        status: 'success',
        duration: 3000
      });
    }
  });

  const deleteAssignment = useMutation({
    mutationFn: async (assignmentId) => {
      await axios.delete(`/api/admin/rescuers/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments']);
      toast({
        title: 'Assignment Deleted',
        status: 'success',
        duration: 3000
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const assignmentData = {
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      status: formData.get('status'),
      assignedTeam: formData.get('assignedTeam'),
      location: formData.get('location'),
      requiredSpecializations: formData.get('requiredSpecializations').split(',')
    };

    if (selectedAssignment) {
      updateAssignment.mutate({ assignmentId: selectedAssignment._id, data: assignmentData });
    } else {
      createAssignment.mutate(assignmentData);
    }
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    onOpen();
  };

  return (
    <Box>
      <Button
        leftIcon={<Plus />}
        colorScheme="blue"
        mb={4}
        onClick={() => {
          setSelectedAssignment(null);
          onOpen();
        }}
      >
        Create Assignment
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Priority</Th>
            <Th>Status</Th>
            <Th>Assigned Team</Th>
            <Th>Location</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {assignments.map((assignment) => (
            <Tr key={assignment._id}>
              <Td>{assignment.title}</Td>
              <Td>
                <Badge
                  colorScheme={assignment.priority === 'high' ? 'red' : assignment.priority === 'medium' ? 'yellow' : 'green'}
                >
                  {assignment.priority}
                </Badge>
              </Td>
              <Td>
                <Badge
                  colorScheme={assignment.status === 'completed' ? 'green' : assignment.status === 'in_progress' ? 'blue' : 'gray'}
                >
                  {assignment.status}
                </Badge>
              </Td>
              <Td>{teams.find(team => team._id === assignment.assignedTeam)?.name || 'Unassigned'}</Td>
              <Td>{assignment.location}</Td>
              <Td>
                <IconButton
                  icon={<Edit2 />}
                  aria-label="Edit assignment"
                  mr={2}
                  onClick={() => handleEdit(assignment)}
                />
                <IconButton
                  icon={<Trash2 />}
                  aria-label="Delete assignment"
                  colorScheme="red"
                  onClick={() => deleteAssignment.mutate(assignment._id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit}>
          <ModalHeader>
            {selectedAssignment ? 'Edit Assignment' : 'Create New Assignment'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  defaultValue={selectedAssignment?.title}
                  placeholder="Enter assignment title"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  defaultValue={selectedAssignment?.description}
                  placeholder="Enter assignment details"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Priority</FormLabel>
                <Select
                  name="priority"
                  defaultValue={selectedAssignment?.priority}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  defaultValue={selectedAssignment?.status}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Assigned Team</FormLabel>
                <Select
                  name="assignedTeam"
                  defaultValue={selectedAssignment?.assignedTeam}
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Input
                  name="location"
                  defaultValue={selectedAssignment?.location}
                  placeholder="Enter location"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Required Specializations</FormLabel>
                <Input
                  name="requiredSpecializations"
                  defaultValue={selectedAssignment?.requiredSpecializations?.join(',')}
                  placeholder="Enter specializations (comma-separated)"
                />
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
              isLoading={createAssignment.isLoading || updateAssignment.isLoading}
            >
              {selectedAssignment ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AssignmentManager;