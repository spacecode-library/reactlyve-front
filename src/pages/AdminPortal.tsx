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
  moderateImages: boolean;
  moderateVideos: boolean;
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
    moderateImages: false,
    moderateVideos: false,
  });
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false);
  const [isUpdatingLimits, setIsUpdatingLimits] = useState(false);
  const [lastUpdatedUserId, setLastUpdatedUserId] = useState<string | null>(null);

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

  useEffect(() => {
    if (lastUpdatedUserId) {
      // const updatedUser = users.find(u => u.id === lastUpdatedUserId);
      // console.log('[AdminPortal] useEffect after users change, updated user:', updatedUser); // Removed
      setLastUpdatedUserId(null); // Reset for next update
    }
  }, [users, lastUpdatedUserId]);

  const handleLimitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setLimitInputs(prev => ({ ...prev, [name]: checked }));
      return;
    }
    if (type === 'number' && value !== '' && !/^\d+$/.test(value) && value !== '-') {
      return;
    }
    setLimitInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveLimits = async () => {
    if (!selectedUserForLimits) return;

    // console.log('handleSaveLimits called. Current limitInputs:', limitInputs); // Removed

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
              } // else {
                // console.warn(`Input date ${rawDate} resulted in an invalid UTC date after construction (e.g., day out of range for month).`); // Removed
              // }
            } // else {
              // console.warn(`Could not construct a valid UTC date from ${rawDate} (Date.UTC returned NaN).`); // Removed
            // }
          } // else {
            // console.warn(`Could not parse numeric components from ${rawDate}.`); // Removed
          // }
        } // else {
          // console.warn(`Date string ${rawDate} is not in YYYY-MM-DD format.`); // Removed
        // }
      } catch (error) {
        // console.error(`Error processing date ${rawDate}:`, error); // Removed
        // formattedDateForPayload remains null
        // It's generally good to keep actual error handling, but task asks to remove specific logs.
        // For a production system, one might log this to an error tracking service.
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
      moderate_images: limitInputs.moderateImages,
      moderate_videos: limitInputs.moderateVideos,
    };

    // console.log('Parsed payload to be sent:', finalPayload); // Removed

    // Check if all payload properties are null
    const allNull = Object.values(finalPayload).every(value => value === null);

    if (allNull) {
      toast.error("Please provide at least one limit value to update.");
      setIsUpdatingLimits(false); // Reset loading state
      return; // Exit the function
    }

    try {
      // console.log('[AdminPortal] handleSaveLimits: Preparing to send to adminApi.updateUserLimits', {
      //   userId: selectedUserForLimits.id,
      //   payload: finalPayload
      // }); // Removed
      await adminApi.updateUserLimits(selectedUserForLimits.id, finalPayload);
      // const response = await adminApi.updateUserLimits(selectedUserForLimits.id, finalPayload); // Keep if response is used
      // console.log('[AdminPortal] handleSaveLimits: adminApi.updateUserLimits - Backend response:', response); // Removed

      // Optimistic update for local state (uses camelCase as per User type)
      const camelCaseUpdateData = {
          maxMessagesPerMonth: maxMessages,
          maxReactionsPerMonth: maxReactions,
          maxReactionsPerMessage: maxReactionsMsg,
          lastUsageResetDate: formattedDateForPayload, // This is the ISO string or null
          moderateImages: limitInputs.moderateImages,
          moderateVideos: limitInputs.moderateVideos,
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

    const user = users.find(u => u.id === userId);
    const oldRole = user?.role;

    try {
      let finalApiResponse: any; // To hold the response that updates the state
      let updatedUserData: User | undefined;

      if (oldRole === 'guest' && newRole === 'user') {
        // console.log(`[AdminPortal] handleRoleChange (Guest-to-User): Step 1 - Updating role for ${userId} to ${newRole}`); // Removed
        const roleUpdateResponse = await adminApi.updateUserRole(userId, newRole); // No date here
        // console.log('[AdminPortal] handleRoleChange (Guest-to-User): Step 1 - Role update API response:', roleUpdateResponse); // Removed

        if (roleUpdateResponse && (roleUpdateResponse.status === 200 || roleUpdateResponse.status === 204 || roleUpdateResponse.data)) {
          const newLastUsageResetDate = new Date().toISOString();
          // console.log(`[AdminPortal] handleRoleChange (Guest-to-User): Step 2 - Setting lastUsageResetDate for ${userId} to ${newLastUsageResetDate}`); // Removed
          finalApiResponse = await adminApi.updateUserLimits(userId, {
            last_usage_reset_date: newLastUsageResetDate
          });
          // console.log('[AdminPortal] handleRoleChange (Guest-to-User): Step 2 - Limits update API response:', finalApiResponse); // Removed
          updatedUserData = finalApiResponse.data;
        } else {
          throw new Error(roleUpdateResponse?.data?.message || `Role update to '${newRole}' failed`);
        }
      } else {
        // Handle other role changes as before
        // console.log(`[AdminPortal] handleRoleChange (Other role change): Updating role for ${userId} to ${newRole}`); // Removed
        finalApiResponse = await adminApi.updateUserRole(userId, newRole);
        // console.log('[AdminPortal] handleRoleChange (Other role change): Role update API response:', finalApiResponse); // Removed
        updatedUserData = finalApiResponse.data;
      }

      toast.success(`User ${userId} role updated to ${newRole}.`);

      // Common logic to update state using finalApiResponse / updatedUserData
      let finalUserUpdate: Partial<User> = {};
      if (updatedUserData) {
        finalUserUpdate = {
            ...updatedUserData, // Spread all fields from the API response
            role: newRole, // Ensure newRole is set if not already from API response (e.g. updateUserLimits might not return role)
        };
        // If guest-to-user, ensure the newLastUsageResetDate is in finalUserUpdate
        if (oldRole === 'guest' && newRole === 'user' && finalUserUpdate.lastUsageResetDate) {
            // The lastUsageResetDate from updateUserLimits response should be the correct one
        }
      } else if (oldRole === 'guest' && newRole === 'user') {
        // Fallback if updatedUserData is not available from limits call, but we know the date
         finalUserUpdate = { role: newRole, lastUsageResetDate: new Date().toISOString() }; // This might be slightly off if limits call failed but role didn't
      } else {
        // Fallback for other role changes if API response structure is unexpected
        finalUserUpdate = { role: newRole, lastUsageResetDate: user?.lastUsageResetDate || null };
      }


      if (newRole === 'guest' && oldRole !== 'guest') { // Ensure this runs only when changing TO guest
        // Define guest default limits (values)
        const guestMaxMessages = 3;
        const guestMaxReactions = 9;
        const guestMaxReactionsMsg = 3;
        let guestLastUsageResetDateIso: string | null = null;
        try {
          const [year, month, day] = "2999-01-19".split('-').map(Number);
          guestLastUsageResetDateIso = new Date(Date.UTC(year, month - 1, day)).toISOString();
        } catch (e) {
            console.error("Error formatting guest lastUsageResetDate:", e);
        }

        const apiGuestPayload = {
          max_messages_per_month: guestMaxMessages,
          max_reactions_per_month: guestMaxReactions,
          max_reactions_per_message: guestMaxReactionsMsg,
          last_usage_reset_date: guestLastUsageResetDateIso,
        };

        try {
          // Note: If newRole is 'guest', this might overwrite parts of finalUserUpdate from earlier.
          // Consider merging:
          const guestLimitsResponse = await adminApi.updateUserLimits(userId, apiGuestPayload);
          toast.success(`User ${userId} limits reset to guest defaults.`);
          // The finalUserUpdate should now primarily be based on guestLimitsResponse.data
          if (guestLimitsResponse.data) {
             finalUserUpdate = { ...finalUserUpdate, ...guestLimitsResponse.data, role: newRole }; // Ensure role is guest
          } else {
             // Fallback if no data from limits call
             finalUserUpdate = {
                ...finalUserUpdate, // Keep role from previous step
                maxMessagesPerMonth: guestMaxMessages,
                maxReactionsPerMonth: guestMaxReactions,
                maxReactionsPerMessage: guestMaxReactionsMsg,
                lastUsageResetDate: guestLastUsageResetDateIso,
             };
          }
        } catch (limitErr) {
          console.error('Failed to set guest limits:', limitErr);
          toast.error('Role set to guest, but failed to reset limits. Manual limit adjustment might be needed.');
          // If setting guest limits fails, finalUserUpdate might be from the role change call,
          // which might not have the guest limits.
        }
      }

      // Update local state with all changes
      if (Object.keys(finalUserUpdate).length > 0) { // Ensure there's something to update
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.id === userId ? { ...u, ...finalUserUpdate } : u
          )
        );
        setLastUpdatedUserId(userId); // Trigger useEffect for logging
      }

    } catch (err) {
      console.error('[AdminPortal] handleRoleChange: Role update API call failed', err);
      toast.error(
        (err as any)?.response?.data?.message || 'Failed to update user role.'
      );
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
              {users.map((user) => {
                // console.log('[AdminPortal] Passing props to child component for user:', user.id, user); // Removed
                return (
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
                            const apiResponse = await adminApi.getUserDetails(user.id);
                            const userDetailsToDisplay: User = apiResponse.data;

                            setSelectedUserForLimits(userDetailsToDisplay);

                            const resetDateForInput = userDetailsToDisplay.lastUsageResetDate
                              ? new Date(userDetailsToDisplay.lastUsageResetDate).toISOString().split('T')[0]
                              : '';

                            setLimitInputs({
                              maxMessagesPerMonth: userDetailsToDisplay.maxMessagesPerMonth?.toString() || '',
                              maxReactionsPerMonth: userDetailsToDisplay.maxReactionsPerMonth?.toString() || '',
                              maxReactionsPerMessage: userDetailsToDisplay.maxReactionsPerMessage?.toString() || '',
                              lastUsageResetDate: resetDateForInput,
                              moderateImages: !!userDetailsToDisplay.moderateImages,
                              moderateVideos: !!userDetailsToDisplay.moderateVideos,
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
              );
            })}
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="moderateImages"
                  id="moderateImages"
                  checked={limitInputs.moderateImages}
                  onChange={handleLimitInputChange}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600 dark:border-neutral-700 dark:bg-neutral-900"
                  disabled={isUpdatingLimits}
                />
                <label htmlFor="moderateImages" className="text-sm text-neutral-800 dark:text-neutral-100">
                  Moderate image uploads
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="moderateVideos"
                  id="moderateVideos"
                  checked={limitInputs.moderateVideos}
                  onChange={handleLimitInputChange}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600 dark:border-neutral-700 dark:bg-neutral-900"
                  disabled={isUpdatingLimits}
                />
                <label htmlFor="moderateVideos" className="text-sm text-neutral-800 dark:text-neutral-100">
                  Moderate video uploads
                </label>
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
