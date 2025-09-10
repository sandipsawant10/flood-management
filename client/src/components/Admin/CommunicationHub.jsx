import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  IconButton,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Avatar,
  Divider,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@chakra-ui/react';
import { MessageCircle, Send, Phone, Video, Users, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

const CommunicationHub = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [message, setMessage] = useState('');
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: channels = [] } = useQuery({
    queryKey: ['communicationChannels'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/rescuers/communication/channels');
      return response.data;
    }
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['channelMessages', selectedChannel?._id],
    queryFn: async () => {
      if (!selectedChannel) return [];
      const response = await axios.get(`/api/admin/rescuers/communication/channels/${selectedChannel._id}/messages`);
      return response.data;
    },
    enabled: !!selectedChannel
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['rescueTeams'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/rescuers/teams');
      return response.data;
    }
  });

  const createChannel = useMutation({
    mutationFn: async (channelData) => {
      const response = await axios.post('/api/admin/rescuers/communication/channels', channelData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['communicationChannels']);
      onClose();
      toast({
        title: 'Channel Created',
        status: 'success',
        duration: 3000
      });
    }
  });

  const sendMessage = useMutation({
    mutationFn: async ({ channelId, messageData }) => {
      const response = await axios.post(`/api/admin/rescuers/communication/channels/${channelId}/messages`, messageData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['channelMessages', selectedChannel?._id]);
      setMessage('');
    }
  });

  const handleCreateChannel = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const channelData = {
      name: formData.get('name'),
      type: formData.get('type'),
      teams: Array.from(e.target.teams.selectedOptions).map(option => option.value),
      description: formData.get('description')
    };

    createChannel.mutate(channelData);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChannel) return;

    sendMessage.mutate({
      channelId: selectedChannel._id,
      messageData: {
        content: message,
        type: 'text'
      }
    });
  };

  return (
    <Box>
      <HStack spacing={4} mb={4}>
        <Button
          leftIcon={<Plus />}
          colorScheme="blue"
          onClick={onOpen}
        >
          Create Channel
        </Button>
      </HStack>

      <Tabs variant="enclosed" size="md">
        <TabList>
          <Tab>Channels</Tab>
          <Tab>Direct Messages</Tab>
          <Tab>Announcements</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <HStack align="start" spacing={4} height="600px">
              {/* Channels List */}
              <VStack
                width="250px"
                height="100%"
                borderRight="1px"
                borderColor="gray.200"
                spacing={2}
                p={2}
                overflowY="auto"
              >
                {channels.map((channel) => (
                  <Button
                    key={channel._id}
                    width="100%"
                    justifyContent="start"
                    variant={selectedChannel?._id === channel._id ? 'solid' : 'ghost'}
                    leftIcon={<MessageCircle />}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <Text isTruncated>{channel.name}</Text>
                  </Button>
                ))}
              </VStack>

              {/* Chat Area */}
              {selectedChannel ? (
                <VStack flex={1} height="100%" spacing={4}>
                  <HStack width="100%" p={4} borderBottom="1px" borderColor="gray.200">
                    <Text fontWeight="bold">{selectedChannel.name}</Text>
                    <Badge ml={2}>{selectedChannel.type}</Badge>
                    <IconButton
                      icon={<Phone />}
                      aria-label="Voice call"
                      variant="ghost"
                      ml="auto"
                    />
                    <IconButton
                      icon={<Video />}
                      aria-label="Video call"
                      variant="ghost"
                    />
                    <IconButton
                      icon={<Users />}
                      aria-label="Participants"
                      variant="ghost"
                    />
                  </HStack>

                  <VStack
                    flex={1}
                    width="100%"
                    overflowY="auto"
                    spacing={4}
                    p={4}
                  >
                    {messages.map((msg) => (
                      <HStack key={msg._id} width="100%" alignItems="start">
                        <Avatar
                          size="sm"
                          name={msg.sender.name}
                          src={msg.sender.avatar}
                        />
                        <Box>
                          <HStack>
                            <Text fontWeight="bold">{msg.sender.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {format(new Date(msg.timestamp), 'MMM d, HH:mm')}
                            </Text>
                          </HStack>
                          <Text mt={1}>{msg.content}</Text>
                        </Box>
                      </HStack>
                    ))}
                  </VStack>

                  <HStack
                    as="form"
                    onSubmit={handleSendMessage}
                    width="100%"
                    p={4}
                    borderTop="1px"
                    borderColor="gray.200"
                  >
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <IconButton
                      type="submit"
                      icon={<Send />}
                      colorScheme="blue"
                      isLoading={sendMessage.isLoading}
                    />
                  </HStack>
                </VStack>
              ) : (
                <VStack flex={1} justify="center" align="center" height="100%">
                  <MessageCircle size={48} color="gray" />
                  <Text color="gray.500">Select a channel to start messaging</Text>
                </VStack>
              )}
            </HStack>
          </TabPanel>

          <TabPanel>
            <Text>Direct Messages feature coming soon...</Text>
          </TabPanel>

          <TabPanel>
            <Text>Announcements feature coming soon...</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleCreateChannel}>
          <ModalHeader>Create New Channel</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Channel Name</FormLabel>
                <Input
                  name="name"
                  placeholder="Enter channel name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Channel Type</FormLabel>
                <Select name="type">
                  <option value="team">Team Channel</option>
                  <option value="emergency">Emergency Channel</option>
                  <option value="coordination">Coordination Channel</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Teams</FormLabel>
                <Select
                  name="teams"
                  multiple
                  size={3}
                >
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  placeholder="Enter channel description"
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
              isLoading={createChannel.isLoading}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CommunicationHub;