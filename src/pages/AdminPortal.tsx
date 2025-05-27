import React, { useState, useEffect } from 'react';
import { newAdminApi } from '../services/api';
import { User } from '../types/user';
import { formatDate } from '../utils/formatters';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner'; // Import LoadingSpinner

// Define the available roles for the select dropdown
const ROLES: User['role'][] = ['user', 'admin', 'guest'];

interface UserToDelete {
  id: string;
  name: string;
}

const AdminPortalPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  // State for delete confirmation modal
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserToDelete | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await newAdminApi.getAdminUsers();
        setUsers(response.data.users || response.data);
      } catch (err) {
        setError('Failed to fetch users. Please try again later.');
        console.error('Fetch users error:', err);
        toast.error('Failed to fetch users.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    setUpdatingRoleId(userId);
    try {
      await newAdminApi.updateAdminUserRole(userId, newRole);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      toast.success(`User ${userId} role updated to ${newRole}.`);
    } catch (err) {
      console.error('Update role error:', err);
      toast.error(
        (err as any)?.response?.data?.message || 'Failed to update user role.'
      );
      // Optionally, refetch users or revert optimistic update if needed
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    try {
      await newAdminApi.deleteAdminUser(userToDelete.id);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete.id));
      toast.success(`User ${userToDelete.name} (ID: ${userToDelete.id}) deleted successfully.`);
      setIsDeleteUserModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Delete user error:', err);
      toast.error(
        (err as any)?.response?.data?.message || 'Failed to delete user.'
      );
      // Optionally, keep modal open on error for user to retry or cancel, 
      // or close it as done above for success case. For now, it closes on success and stays open on error.
    } finally {
      setIsDeletingUser(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-200px)]">
        {/* Centering the spinner */}
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        {/* Replace with ErrorMessage component if available */}
        <p>{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-6">Admin Portal - User Management</h1>
        <p>No users found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Admin Portal - User Management</h1>
      
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead className="bg-gray-50 dark:bg-neutral-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300">Last Login</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300">Created At</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-neutral-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    {user.picture && (
                      <img className="h-8 w-8 rounded-full mr-3 object-cover" src={user.picture} alt={user.name} />
                    )}
                    <span>{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-300">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    user.role === 'guest' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                    {user.role}
                  </span>
                  {/* Placeholder for role change UI */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.blocked ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {user.blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-300">
                  {user.last_login ? formatDate(user.last_login) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-300">
                  {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                      disabled={updatingRoleId === user.id || isLoading}
                      className="block w-auto pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white disabled:opacity-50"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => {
                        setUserToDelete({ id: user.id, name: user.name });
                        setIsDeleteUserModalOpen(true);
                      }}
                      disabled={isLoading || !!updatingRoleId || isDeletingUser}
                    >
                      Delete User
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <Modal
          isOpen={isDeleteUserModalOpen}
          onClose={() => {
            if (isDeletingUser) return; // Prevent closing while deletion is in progress
            setIsDeleteUserModalOpen(false);
            setUserToDelete(null);
          }}
          title={`Confirm Delete User: ${userToDelete.name}`}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete the user <span className="font-semibold">{userToDelete.name}</span> (ID: {userToDelete.id})? 
              This action is irreversible and will remove all their messages, reactions, replies, and associated content.
            </p>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              All data associated with this user will be permanently lost.
            </p>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteUserModalOpen(false);
                setUserToDelete(null);
              }}
              disabled={isDeletingUser}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDeleteUser}
              isLoading={isDeletingUser}
              disabled={isDeletingUser}
            >
              Confirm Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminPortalPage;
