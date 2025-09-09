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
} from "@chakra-ui/react";
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import adminService from "../../services/adminService";
import { useAuthStore } from "../../store/authStore";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const toast = useToast();
  const { updateRole } = useAuthStore();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (roleFilter !== "all") filters.role = roleFilter;

      const response = await adminService.getUsers(page, 10, filters);
      setUsers(response.users);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error) {
      toast({
        title: "Error fetching users",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateRole(userId, newRole);
      toast({
        title: "Role updated",
        description: "User role has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error updating role",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "red",
      official: "purple",
      volunteer: "green",
      citizen: "blue",
    };
    return colors[role] || "gray";
  };

  return (
    <Box p={4}>
      <Stack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold">
          User Management
        </Text>

        <HStack spacing={4}>
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftElement={<SearchIcon color="gray.400" />}
          />
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            w="200px"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="official">Official</option>
            <option value="volunteer">Volunteer</option>
            <option value="citizen">Citizen</option>
          </Select>
        </HStack>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Trust Score</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user._id}>
                <Td>{user.name}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <Badge colorScheme={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </Td>
                <Td>{user.trustScore}</Td>
                <Td>
                  <Select
                    size="sm"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    w="150px"
                  >
                    <option value="admin">Admin</option>
                    <option value="official">Official</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="citizen">Citizen</option>
                  </Select>
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
    </Box>
  );
};

export default UserManagement;