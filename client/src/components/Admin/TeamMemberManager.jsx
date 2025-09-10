import React, { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  useToast,
  Avatar,
  Badge,
  HStack,
  Text
} from '@chakra-ui/react';
import { Edit2, Trash2, Plus, UserPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const TeamMemberManager = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMember, setSelectedMember] = useState(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/rescuers/members');
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

  const createMember = useMutation({
    mutationFn: async (memberData) => {
      const response = await axios.post('/api/admin/rescuers/members', memberData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers']);
      onClose();
      toast({
        title: 'Team Member Added',
        status: 'success',
        duration: 3000
      });
    }
  });

  const updateMember = useMutation({
    mutationFn: async ({ memberId, data }) => {
      const response = await axios.put(`/api/admin/rescuers/members/${memberId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers']);
      onClose();
      toast({
        title: 'Team Member Updated',
        status: 'success',
        duration: 3000
      });
    }
  });

  const deleteMember = useMutation({
    mutationFn: async (memberId) => {
      await axios.delete(`/api/admin/rescuers/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers']);
      toast({
        title: 'Team Member Removed',
        status: 'success',
        duration: 3000
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const memberData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      team: formData.get('team'),
      specializations: formData.get('specializations').split(','),
      certifications: formData.get('certifications').split(','),
      status: formData.get('status')
    };

    if (selectedMember) {
      updateMember.mutate({ memberId: selectedMember._id, data: memberData });
    } else {
      createMember.mutate(memberData);
    }
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    onOpen();
  };

  return (
    <Box>
      <Button
        leftIcon={<UserPlus />}
        colorScheme="blue"
        mb={4}
        onClick={() => {
          setSelectedMember(null);
          onOpen();
        }}
      >
        Add Team Member
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Member</Th>
            <Th>Role</Th>
            <Th>Team</Th>
            <Th>Specializations</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {members.map((member) => (
            <Tr key={member._id}>
              <Td>
                <HStack spacing={3}>
                  <Avatar name={member.name} size="sm" />
                  <Box>
                    <Text fontWeight="medium">{member.name}</Text>
                    <Text fontSize="sm" color="gray.600">{member.email}</Text>
                  </Box>
                </HStack>
              </Td>
              <Td>{member.role}</Td>
              <Td>{teams.find(team => team._id === member.team)?.name || 'Unassigned'}</Td>
              <Td>
                <HStack spacing={2}>
                  {member.specializations.map((spec, index) => (
                    <Badge key={index} colorScheme="purple">{spec}</Badge>
                  ))}
                </HStack>
              </Td>
              <Td>
                <Badge
                  colorScheme={member.status === 'active' ? 'green' : member.status === 'on_leave' ? 'yellow' : 'red'}
                >
                  {member.status}
                </Badge>
              </Td>
              <Td>
                <IconButton
                  icon={<Edit2 />}
                  aria-label="Edit member"
                  mr={2}
                  onClick={() => handleEdit(member)}
                />
                <IconButton
                  icon={<Trash2 />}
                  aria-label="Delete member"
                  colorScheme="red"
                  onClick={() => deleteMember.mutate(member._id)}
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
            {selectedMember ? 'Edit Team Member' : 'Add New Team Member'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  defaultValue={selectedMember?.name}
                  placeholder="Enter member name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  defaultValue={selectedMember?.email}
                  placeholder="Enter email address"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Phone</FormLabel>
                <Input
                  name="phone"
                  type="tel"
                  defaultValue={selectedMember?.phone}
                  placeholder="Enter phone number"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  name="role"
                  defaultValue={selectedMember?.role}
                >
                  <option value="team_leader">Team Leader</option>
                  <option value="rescuer">Rescuer</option>
                  <option value="medic">Medic</option>
                  <option value="coordinator">Coordinator</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Team</FormLabel>
                <Select
                  name="team"
                  defaultValue={selectedMember?.team}
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
                <FormLabel>Specializations</FormLabel>
                <Input
                  name="specializations"
                  defaultValue={selectedMember?.specializations?.join(',')}
                  placeholder="Enter specializations (comma-separated)"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Certifications</FormLabel>
                <Input
                  name="certifications"
                  defaultValue={selectedMember?.certifications?.join(',')}
                  placeholder="Enter certifications (comma-separated)"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  defaultValue={selectedMember?.status}
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="inactive">Inactive</option>
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
              isLoading={createMember.isLoading || updateMember.isLoading}
            >
              {selectedMember ? 'Update' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TeamMemberManager;