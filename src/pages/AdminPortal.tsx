import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { User } from '../types/user';
import { formatDate, formatDateTime } from '../utils/formatters'; // Import formatDateTime
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardLayout from '../layouts/DashboardLayout'; // Import DashboardLayout
import Input from '../components/common/Input'; // Import Input component

// Define the available roles for the select dropdown
type SettableUserRole = 'user' | 'admin';
const ROLES_FOR_SELECT: SettableUserRole[] = ['user', 'admin'];

interface UserToDelete {
  id: string;
  name: string;
}

interface UserLimitInputs {
  max_messages_per_month: string;
  max_reactions_per_month: string;
  max_reactions_per_message: string;
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

  // State for Edit Limits Modal
  const [isEditLimitsModalOpen, setIsEditLimitsModalOpen] = useState(false);
  const [selectedUserForLimits, setSelectedUserForLimits] = useState<User | null>(null);
  const [limitInputs, setLimitInputs] = useState<UserLimitInputs>({
    max_messages_per_month: '',
    max_reactions_per_month: '',
    max_reactions_per_message: '',
  });
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false);
  const [isUpdatingLimits, setIsUpdatingLimits] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminApi.getUsers();
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

  const handleLimitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (e.target.type === 'number' && value !== '' && !/^\d+$/.test(value) && value !== '-') {
      // Allow only numbers, empty string, or a single hyphen for potential negative (though we use min="0")
      return;
    }
    setLimitInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveLimits = async () => {
    if (!selectedUserForLimits) return;

    setIsUpdatingLimits(true);

    const parseInput = (value: string): number | null => {
      if (value === '') return null;
      const num = parseInt(value, 10);
      return isNaN(num) ? null : num; // Convert NaN (from invalid parse like "abc") to null
    };

    const payload = {
      max_messages_per_month: parseInput(limitInputs.max_messages_per_month),
      max_reactions_per_month: parseInput(limitInputs.max_reactions_per_month),
      max_reactions_per_message: parseInput(limitInputs.max_reactions_per_message),
    };

    try {
      await adminApi.updateUserLimits(selectedUserForLimits.id, payload);
      setUsers(prevUsers => prevUsers.map(u =>
        u.id === selectedUserForLimits.id
          ? {
            ...u,
            max_messages_per_month: payload.max_messages_per_month,
            max_reactions_per_month: payload.max_reactions_per_month,
            max_reactions_per_message: payload.max_reactions_per_message,
            // Note: current_... values and last_usage_reset_date are not updated by this call directly,
            // they are modified by actual usage or a cron job.
            // If API returns updated user, spread that instead.
          }
          : u
      ));
      toast.success('Limits updated successfully!');
      setIsEditLimitsModalOpen(false);
      setSelectedUserForLimits(null);
    } catch (err) {
      toast.error('Failed to update limits.');
      console.error("Update limits error:", err);
    } finally {
      setIsUpdatingLimits(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: SettableUserRole) => {
    setUpdatingRoleId(userId);
    try {
      await adminApi.updateUserRole(userId, newRole);
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
      await adminApi.deleteUser(userToDelete.id);
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
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"> {/* Adjust min-height if needed */}
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-500 p-4"> {/* Added p-4 for some spacing */}
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (users.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-4"> {/* Added p-4 for some spacing */}
          <h1 className="text-2xl font-semibold mb-6">Admin Portal - User Management</h1>
          <p>No users found.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div> {/* Main content wrapper div */}
        <h1 className="text-2xl font-semibold mb-6">Admin Portal - User Management</h1>
        
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
            <thead className="bg-gray-50 dark:bg-neutral-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300 hidden sm:table-cell">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300 hidden sm:table-cell">Last Login</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300 hidden md:table-cell">Created At</th>
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.blocked ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {user.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-300 hidden sm:table-cell">
                    {user.lastLogin ? formatDateTime(user.lastLogin) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-300 hidden md:table-cell">
                    {user.createdAt ? formatDateTime(user.createdAt) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <select
                        value={user.role} // Keep displaying the actual current role
                        onChange={(e) => handleRoleChange(user.id, e.target.value as SettableUserRole)}
                        disabled={updatingRoleId === user.id || isLoading}
                        className="block w-auto pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white disabled:opacity-50"
                      >
                        {/* Add a disabled option for 'guest' if it's the current role, as it's not settable */}
                        {user.role === 'guest' && (
                          <option value="guest" disabled>Guest (Current)</option>
                        )}
                        {ROLES_FOR_SELECT.map((role) => (
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          setSelectedUserForLimits(user);
                          setIsLoadingUserDetails(true);
                          try {
                            const response = await adminApi.getUserDetails(user.id);
                            setSelectedUserForLimits(response.data);
                            setLimitInputs({
                              max_messages_per_month: response.data.max_messages_per_month?.toString() || '',
                              max_reactions_per_month: response.data.max_reactions_per_month?.toString() || '',
                              max_reactions_per_message: response.data.max_reactions_per_message?.toString() || '',
                            });
                            setIsEditLimitsModalOpen(true);
                          } catch (err) {
                            toast.error('Failed to fetch user details.');
                            console.error("Fetch user details error:", err);
                            setSelectedUserForLimits(null); // Clear optimistic set if fetch fails
                          } finally {
                            setIsLoadingUserDetails(false);
                          }
                        }}
                        disabled={(isLoadingUserDetails && selectedUserForLimits?.id === user.id) || (isEditLimitsModalOpen && selectedUserForLimits?.id !== user.id) || !!updatingRoleId || isDeletingUser}
                        isLoading={isLoadingUserDetails && selectedUserForLimits?.id === user.id}
                      >
                        Manage Limits
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> {/* Close table wrapper div */}

        {/* Delete User Confirmation Modal */}
        {userToDelete && (
          <Modal
            isOpen={isDeleteUserModalOpen}
            onClose={() => {
              if (isDeletingUser) return; 
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

        {/* Edit Limits Modal */}
        {isEditLimitsModalOpen && selectedUserForLimits && (
          <Modal
            isOpen={isEditLimitsModalOpen}
            onClose={() => {
              if (isUpdatingLimits) return;
              setIsEditLimitsModalOpen(false);
              setSelectedUserForLimits(null);
            }}
            title={`Manage Limits for ${selectedUserForLimits.name}`}
            size="lg" // Consider 'lg' or 'xl' for more content
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-semibold mb-1">Current Usage:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Messages This Month: {selectedUserForLimits.current_messages_this_month ?? 0} / {selectedUserForLimits.max_messages_per_month !== null ? selectedUserForLimits.max_messages_per_month : 'Unlimited'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Reactions This Month: {selectedUserForLimits.current_reactions_this_month ?? 0} / {selectedUserForLimits.max_reactions_per_month !== null ? selectedUserForLimits.max_reactions_per_month : 'Unlimited'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Last Usage Reset Date: {selectedUserForLimits.last_usage_reset_date ? formatDate(selectedUserForLimits.last_usage_reset_date) : 'N/A'}
                </p>
              </div>

              <hr className="dark:border-neutral-700"/>

              <div>
                <label htmlFor="max_messages_per_month" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Messages/Month (empty for unlimited)
                </label>
                <Input
                  type="number"
                  name="max_messages_per_month"
                  id="max_messages_per_month"
                  value={limitInputs.max_messages_per_month}
                  onChange={handleLimitInputChange}
                  className="mt-1"
                  placeholder="e.g., 100"
                  min="0"
                  disabled={isUpdatingLimits}
                />
              </div>

              <div>
                <label htmlFor="max_reactions_per_month" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Reactions/Month (empty for unlimited)
                </label>
                <Input
                  type="number"
                  name="max_reactions_per_month"
                  id="max_reactions_per_month"
                  value={limitInputs.max_reactions_per_month}
                  onChange={handleLimitInputChange}
                  className="mt-1"
                  placeholder="e.g., 500"
                  min="0"
                  disabled={isUpdatingLimits}
                />
              </div>

              <div>
                <label htmlFor="max_reactions_per_message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Reactions/Message (empty for unlimited)
                </label>
                <Input
                  type="number"
                  name="max_reactions_per_message"
                  id="max_reactions_per_message"
                  value={limitInputs.max_reactions_per_message}
                  onChange={handleLimitInputChange}
                  className="mt-1"
                  placeholder="e.g., 5"
                  min="0"
                  disabled={isUpdatingLimits}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditLimitsModalOpen(false);
                  setSelectedUserForLimits(null);
                }}
                disabled={isUpdatingLimits}
              >
                Cancel
              </Button>
              <Button
                variant="primary" // Changed from danger to primary for save action
                onClick={handleSaveLimits}
                isLoading={isUpdatingLimits}
                disabled={isUpdatingLimits}
              >
                Save Limits
              </Button>
            </div>
          </Modal>
        )}
      </div> {/* Close main content wrapper div */}
    </DashboardLayout> 
  );
};

export default AdminPortalPage;
