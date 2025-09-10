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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  HStack,
  Text,
  Progress,
  useToast
} from '@chakra-ui/react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const ResourcePlanning = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedResource, setSelectedResource] = useState(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/rescuers/resources');
      return response.data;
    }
  });

  const createResource = useMutation({
    mutationFn: async (resourceData) => {
      const response = await axios.post('/api/admin/rescuers/resources', resourceData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resources']);
      onClose();
      toast({
        title: 'Resource Added',
        status: 'success',
        duration: 3000
      });
    }
  });

  const updateResource = useMutation({
    mutationFn: async ({ resourceId, data }) => {
      const response = await axios.put(`/api/admin/rescuers/resources/${resourceId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resources']);
      onClose();
      toast({
        title: 'Resource Updated',
        status: 'success',
        duration: 3000
      });
    }
  });

  const deleteResource = useMutation({
    mutationFn: async (resourceId) => {
      await axios.delete(`/api/admin/rescuers/resources/${resourceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resources']);
      toast({
        title: 'Resource Deleted',
        status: 'success',
        duration: 3000
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const resourceData = {
      name: formData.get('name'),
      category: formData.get('category'),
      quantity: parseInt(formData.get('quantity')),
      minQuantity: parseInt(formData.get('minQuantity')),
      unit: formData.get('unit'),
      location: formData.get('location'),
      status: formData.get('status'),
      lastRestockDate: formData.get('lastRestockDate')
    };

    if (selectedResource) {
      updateResource.mutate({ resourceId: selectedResource._id, data: resourceData });
    } else {
      createResource.mutate(resourceData);
    }
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    onOpen();
  };

  const getStockLevel = (quantity, minQuantity) => {
    const ratio = (quantity / minQuantity) * 100;
    if (ratio <= 50) return 'red';
    if (ratio <= 75) return 'yellow';
    return 'green';
  };

  return (
    <Box>
      <Button
        leftIcon={<Plus />}
        colorScheme="blue"
        mb={4}
        onClick={() => {
          setSelectedResource(null);
          onOpen();
        }}
      >
        Add Resource
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Resource</Th>
            <Th>Category</Th>
            <Th>Stock Level</Th>
            <Th>Location</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {resources.map((resource) => (
            <Tr key={resource._id}>
              <Td>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">{resource.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {resource.quantity} {resource.unit}
                  </Text>
                </VStack>
              </Td>
              <Td>{resource.category}</Td>
              <Td>
                <VStack align="start" spacing={1} width="200px">
                  <Progress
                    value={(resource.quantity / resource.minQuantity) * 100}
                    colorScheme={getStockLevel(resource.quantity, resource.minQuantity)}
                    size="sm"
                    width="100%"
                  />
                  <Text fontSize="sm">
                    Min: {resource.minQuantity} {resource.unit}
                  </Text>
                </VStack>
              </Td>
              <Td>{resource.location}</Td>
              <Td>{resource.status}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    icon={<Edit2 />}
                    aria-label="Edit resource"
                    onClick={() => handleEdit(resource)}
                  />
                  <IconButton
                    icon={<Trash2 />}
                    aria-label="Delete resource"
                    colorScheme="red"
                    onClick={() => deleteResource.mutate(resource._id)}
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
          <ModalHeader>
            {selectedResource ? 'Edit Resource' : 'Add New Resource'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  defaultValue={selectedResource?.name}
                  placeholder="Enter resource name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Select
                  name="category"
                  defaultValue={selectedResource?.category}
                >
                  <option value="medical">Medical</option>
                  <option value="equipment">Equipment</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="communication">Communication</option>
                  <option value="supplies">Supplies</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Quantity</FormLabel>
                <NumberInput
                  min={0}
                  defaultValue={selectedResource?.quantity || 0}
                >
                  <NumberInputField name="quantity" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Minimum Quantity</FormLabel>
                <NumberInput
                  min={0}
                  defaultValue={selectedResource?.minQuantity || 0}
                >
                  <NumberInputField name="minQuantity" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Unit</FormLabel>
                <Input
                  name="unit"
                  defaultValue={selectedResource?.unit}
                  placeholder="Enter unit (e.g., pieces, liters)"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Input
                  name="location"
                  defaultValue={selectedResource?.location}
                  placeholder="Enter storage location"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  defaultValue={selectedResource?.status}
                >
                  <option value="available">Available</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="maintenance">Maintenance</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Last Restock Date</FormLabel>
                <Input
                  name="lastRestockDate"
                  type="date"
                  defaultValue={selectedResource?.lastRestockDate?.split('T')[0]}
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
              isLoading={createResource.isLoading || updateResource.isLoading}
            >
              {selectedResource ? 'Update' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ResourcePlanning;