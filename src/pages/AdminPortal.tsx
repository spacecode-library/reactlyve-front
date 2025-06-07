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
// type SettableUserRole = 'user' | 'admin'; // No longer strictly needed here
const ROLES_FOR_SELECT: User['role'][] = ['user', 'admin', 'guest'];

interface UserToDelete {
  id: string;
  name: string;
}

interface UserLimitInputs {
  maxMessagesPerMonth: string;
  maxReactionsPerMonth: string;
  maxReactionsPerMessage: string;
  lastUsageResetDate: string; // Added
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
    maxMessagesPerMonth: '',
    maxReactionsPerMonth: '',
    maxReactionsPerMessage: '',
    lastUsageResetDate: '', // Added
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
    console.log('handleLimitInputChange called. Name:', name, 'Value:', value, 'Type:', e.target.type);
    if (e.target.type === 'number' && value !== '' && !/^\d+$/.test(value) && value !== '-') {
      // Allow only numbers, empty string, or a single hyphen for potential negative (though we use min="0")
      return;
    }
    setLimitInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveLimits = async () => {
    if (!selectedUserForLimits) return;

    console.log('handleSaveLimits called. Current limitInputs:', limitInputs);

    setIsUpdatingLimits(true);

    const parseInput = (value: string): number | null => {
      if (value === '') return null;
      const num = parseInt(value, 10);
      return isNaN(num) ? null : num; // Convert NaN (from invalid parse like "abc") to null
    };

    const rawDate = limitInputs.lastUsageResetDate; // YYYY-MM-DD string or empty
    let formattedDateForPayload: string | null = null;
    if (rawDate) {
      try {
        // new Date('YYYY-MM-DD') can interpret the date in local timezone.
        // To ensure it's treated as UTC for date-only inputs, parse components.
        const parts = rawDate.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10); // 1-12
          const day = parseInt(parts[2], 10);

          // Validate numeric parts
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            // Date.UTC expects month to be 0-11
            const utcDate = new Date(Date.UTC(year, month - 1, day));
            if (!isNaN(utcDate.getTime())) { // Check if utcDate is valid
              // Check if the constructed UTC date corresponds to the input parts
              // This guards against invalid dates like "2023-02-30" being accepted by new Date()
              // and rolling over to a different month.
              if (utcDate.getUTCFullYear() === year &&
                  utcDate.getUTCMonth() === month - 1 &&
                  utcDate.getUTCDate() === day) {
                formattedDateForPayload = utcDate.toISOString();
              } else {
                console.warn(`Input date ${rawDate} resulted in an invalid UTC date after construction (e.g., day out of range for month).`);
              }
            } else {
              console.warn(`Could not construct a valid UTC date from ${rawDate} (Date.UTC returned NaN).`);
            }
          } else {
            console.warn(`Could not parse numeric components from ${rawDate}.`);
          }
        } else {
          console.warn(`Date string ${rawDate} is not in YYYY-MM-DD format.`);
        }
      } catch (error) {
        console.error(`Error processing date ${rawDate}:`, error);
        // formattedDateForPayload remains null
      }
    }

    // Prepare values for both API payload and local state update
    const maxMessages = parseInput(limitInputs.maxMessagesPerMonth);
    const maxReactions = parseInput(limitInputs.maxReactionsPerMonth);
    const maxReactionsMsg = parseInput(limitInputs.maxReactionsPerMessage);
    // formattedDateForPayload is already the ISO string or null

    const finalPayload = {
      max_messages_per_month: maxMessages,
      max_reactions_per_month: maxReactions,
      max_reactions_per_message: maxReactionsMsg,
      last_usage_reset_date: formattedDateForPayload,
    };

    console.log('Parsed payload to be sent:', finalPayload);

    // Check if all payload properties are null
    const allNull = Object.values(finalPayload).every(value => value === null);

    if (allNull) {
      toast.error("Please provide at least one limit value to update.");
      setIsUpdatingLimits(false); // Reset loading state
      return; // Exit the function
    }

    try {
      await adminApi.updateUserLimits(selectedUserForLimits.id, finalPayload);

      // Optimistic update for local state (uses camelCase as per User type)
      const camelCaseUpdateData = {
          maxMessagesPerMonth: maxMessages,
          maxReactionsPerMonth: maxReactions,
          maxReactionsPerMessage: maxReactionsMsg,
          lastUsageResetDate: formattedDateForPayload, // This is the ISO string or null
      };
      setUsers(prevUsers => prevUsers.map(u =>
        u.id === selectedUserForLimits.id
          ? { ...u, ...camelCaseUpdateData }
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

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    setUpdatingRoleId(userId);
    try {
      // The API already expects User['role'] from a previous change.
      // This function's local type change is to align with ROLES_FOR_SELECT.
      await adminApi.updateUserRole(userId, newRole);
      // Original optimistic update is removed, will be handled by more comprehensive logic later in this function
      // setUsers((prevUsers) =>
      //   prevUsers.map((user) =>
      //     user.id === userId ? { ...user, role: newRole } : user
      //   )
      // );
      toast.success(`User ${userId} role updated to ${newRole}.`);
      // Logic for guest limits will be added in the next step here.
      // For now, just ensuring the signature and basic call is updated.
      // The full logic for handleRoleChange including guest limits will be applied in a subsequent diff.
      // This step only focuses on changing ROLES_FOR_SELECT and the signature.
      // A placeholder for the more complex logic to be inserted:
      // setUsers(prevUsers => prevUsers.map(user =>
      //   user.id === userId ? { ...user, role: newRole } : user
      // ));
      // --- Start of new comprehensive logic for handleRoleChange ---
      let finalUserUpdate: Partial<User> = { role: newRole };

      if (newRole === 'guest') {
        const guestLimitsPayload: Partial<Pick<User,
          'maxMessagesPerMonth' |
          'maxReactionsPerMonth' |
          'maxReactionsPerMessage' |
          'lastUsageResetDate'
          // Removed 'currentMessagesThisMonth' and 'reactionsReceivedThisMonth' from Pick
        >> = {
          maxMessagesPerMonth: 3,
          maxReactionsPerMonth: 9,
          maxReactionsPerMessage: 3,
          lastUsageResetDate: "2999-01-19", // Far future date as a convention
          // currentMessagesThisMonth: 0,    // Removed
          // reactionsReceivedThisMonth: 0   // Removed
        };
        try {
          // Create a new payload for the API call without the current usage fields
          const apiPayload = {
            maxMessagesPerMonth: guestLimitsPayload.maxMessagesPerMonth,
            maxReactionsPerMonth: guestLimitsPayload.maxReactionsPerMonth,
            maxReactionsPerMessage: guestLimitsPayload.maxReactionsPerMessage,
            lastUsageResetDate: guestLimitsPayload.lastUsageResetDate,
          };
          await adminApi.updateUserLimits(userId, apiPayload);
          toast.success(`User ${userId} limits reset to guest defaults.`);
          // For local state update, we might still want to reflect that current usage *should* be zero
          // or simply update with what was sent to API. For now, align with API payload.
          finalUserUpdate = { ...finalUserUpdate, ...apiPayload };
        } catch (limitErr) {
          console.error('Failed to set guest limits:', limitErr);
          toast.error('Role set to guest, but failed to reset limits. Manual limit adjustment might be needed.');
        }
      }

      // Update local state with all changes
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, ...finalUserUpdate } : user
        )
      );
      // --- End of new comprehensive logic for handleRoleChange ---
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
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                        disabled={updatingRoleId === user.id || isLoading}
                        className="block w-auto pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white disabled:opacity-50"
                      >
                        {/* 'guest' is now a settable option, so no special disabled option needed if it's current. */}
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
                            const dateValue = response.data.lastUsageResetDate;
                            let formattedDateForInput = '';
                            if (dateValue) {
                              try {
                                // Ensure it's a valid date and format to YYYY-MM-DD for <input type="date">
                                formattedDateForInput = new Date(dateValue).toISOString().split('T')[0];
                              } catch (e) {
                                console.error("Error parsing lastUsageResetDate for input: ", dateValue);
                                // Keep it empty if parsing fails, or handle as appropriate
                              }
                            }
                            setLimitInputs({
                              maxMessagesPerMonth: response.data.maxMessagesPerMonth?.toString() || '',
                              maxReactionsPerMonth: response.data.maxReactionsPerMonth?.toString() || '',
                              maxReactionsPerMessage: response.data.maxReactionsPerMessage?.toString() || '',
                              lastUsageResetDate: formattedDateForInput,
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
                  Messages This Month: {selectedUserForLimits.currentMessagesThisMonth ?? 0} / {selectedUserForLimits.maxMessagesPerMonth != null ? selectedUserForLimits.maxMessagesPerMonth : 'Unlimited'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Reactions Received This Month: {selectedUserForLimits.reactionsReceivedThisMonth ?? 0} / {selectedUserForLimits.maxReactionsPerMonth != null ? selectedUserForLimits.maxReactionsPerMonth : 'Unlimited'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Last Usage Reset Date: {selectedUserForLimits.lastUsageResetDate ? formatDate(selectedUserForLimits.lastUsageResetDate) : 'N/A'}
                </p>
              </div>

              <hr className="dark:border-neutral-700"/>

              <div>
                <label htmlFor="maxMessagesPerMonth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Messages/Month (empty for unlimited)
                </label>
                <Input
                  type="number"
                  name="maxMessagesPerMonth"
                  id="maxMessagesPerMonth"
                  value={limitInputs.maxMessagesPerMonth}
                  onChange={handleLimitInputChange}
                  className="mt-1"
                  placeholder="e.g., 100"
                  min="0"
                  disabled={isUpdatingLimits}
                />
              </div>

              <div>
                <label htmlFor="maxReactionsPerMonth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Reactions/Month (empty for unlimited)
                </label>
                <Input
                  type="number"
                  name="maxReactionsPerMonth"
                  id="maxReactionsPerMonth"
                  value={limitInputs.maxReactionsPerMonth}
                  onChange={handleLimitInputChange}
                  className="mt-1"
                  placeholder="e.g., 500"
                  min="0"
                  disabled={isUpdatingLimits}
                />
              </div>

              <div>
                <label htmlFor="maxReactionsPerMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Reactions/Message (empty for unlimited)
                </label>
                <Input
                  type="number"
                  name="maxReactionsPerMessage"
                  id="maxReactionsPerMessage"
                  value={limitInputs.maxReactionsPerMessage}
                  onChange={handleLimitInputChange}
                  className="mt-1"
                  placeholder="e.g., 5"
                  min="0"
                  disabled={isUpdatingLimits}
                />
              </div>

              <div>
                <label htmlFor="lastUsageResetDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Usage Reset Date (YYYY-MM-DD, empty to clear)
                </label>
                <Input
                  type="date"
                  name="lastUsageResetDate"
                  id="lastUsageResetDate"
                  value={limitInputs.lastUsageResetDate}
                  onChange={handleLimitInputChange}
                  className="mt-1"
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
