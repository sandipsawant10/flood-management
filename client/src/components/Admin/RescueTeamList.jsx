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
  VStack,
  useToast
} from '@chakra-ui/react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const RescueTeamList = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/rescuers/teams');
      return response.data;
    }
  });

  const createTeam = useMutation({
    mutationFn: async (teamData) => {
      const response = await axios.post('/api/admin/rescuers/teams', teamData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rescueTeams']);
      onClose();
      toast({
        title: 'Team Created',
        status: 'success',
        duration: 3000
      });
    }
  });

  const updateTeam = useMutation({
    mutationFn: async ({ teamId, data }) => {
      const response = await axios.put(`/api/admin/rescuers/teams/${teamId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rescueTeams']);
      onClose();
      toast({
        title: 'Team Updated',
        status: 'success',
        duration: 3000
      });
    }
  });

  const deleteTeam = useMutation({
    mutationFn: async (teamId) => {
      await axios.delete(`/api/admin/rescuers/teams/${teamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rescueTeams']);
      toast({
        title: 'Team Deleted',
        status: 'success',
        duration: 3000
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const teamData = {
      name: formData.get('name'),
      leader: formData.get('leader'),
      specialization: formData.get('specialization'),
      status: formData.get('status'),
      capacity: parseInt(formData.get('capacity'))
    };

    if (selectedTeam) {
      updateTeam.mutate({ teamId: selectedTeam._id, data: teamData });
    } else {
      createTeam.mutate(teamData);
    }
  };

  const handleEdit = (team) => {
    setSelectedTeam(team);
    onOpen();
  };

  return (
    <Box>
      <Button
        leftIcon={<Plus />}
        colorScheme="blue"
        mb={4}
        onClick={() => {
          setSelectedTeam(null);
          onOpen();
        }}
      >
        Add New Team
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Team Name</Th>
            <Th>Leader</Th>
            <Th>Specialization</Th>
            <Th>Status</Th>
            <Th>Members</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {teams.map((team) => (
            <Tr key={team._id}>
              <Td>{team.name}</Td>
              <Td>{team.leader}</Td>
              <Td>{team.specialization}</Td>
              <Td>
                <Badge
                  colorScheme={team.status === 'active' ? 'green' : team.status === 'standby' ? 'yellow' : 'red'}
                >
                  {team.status}
                </Badge>
              </Td>
              <Td>{team.members?.length || 0}</Td>
              <Td>
                <IconButton
                  icon={<Edit2 />}
                  aria-label="Edit team"
                  mr={2}
                  onClick={() => handleEdit(team)}
                />
                <IconButton
                  icon={<Trash2 />}
                  aria-label="Delete team"
                  colorScheme="red"
                  onClick={() => deleteTeam.mutate(team._id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit}>
          <ModalHeader>{selectedTeam ? 'Edit Team' : 'Create New Team'}</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Team Name</FormLabel>
                <Input
                  name="name"
                  defaultValue={selectedTeam?.name}
                  placeholder="Enter team name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Team Leader</FormLabel>
                <Input
                  name="leader"
                  defaultValue={selectedTeam?.leader}
                  placeholder="Enter team leader name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Specialization</FormLabel>
                <Select
                  name="specialization"
                  defaultValue={selectedTeam?.specialization}
                >
                  <option value="water_rescue">Water Rescue</option>
                  <option value="medical">Medical</option>
                  <option value="evacuation">Evacuation</option>
                  <option value="search_rescue">Search & Rescue</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  defaultValue={selectedTeam?.status}
                >
                  <option value="active">Active</option>
                  <option value="standby">Standby</option>
                  <option value="unavailable">Unavailable</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Team Capacity</FormLabel>
                <Input
                  name="capacity"
                  type="number"
                  defaultValue={selectedTeam?.capacity}
                  min={1}
                  max={20}
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
              isLoading={createTeam.isLoading || updateTeam.isLoading}
            >
              {selectedTeam ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RescueTeamList;