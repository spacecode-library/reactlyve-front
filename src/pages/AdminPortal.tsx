import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { User } from '../types/user';
import { formatDate, formatDateTime } from '../utils/formatters';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardLayout from '../layouts/DashboardLayout';
import Input from '../components/common/Input';
import { normalizeUser } from '../utils/normalizeKeys';



const ROLES_FOR_SELECT: User['role'][] = ['user', 'admin', 'guest'];

interface UserToDelete {
  id: string;
  name: string;
}

interface UserLimitInputs {
  maxMessagesPerMonth: string;
  maxReactionsPerMonth: string;
  maxReactionsPerMessage: string;
  lastUsageResetDate: string;
}

interface UserModerationInputs {
  moderateImages: boolean;
  moderateVideos: boolean;
  pending?: { id: string; type: string; cloudinaryId: string }[];
}

const AdminPortalPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);


  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserToDelete | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);


  const [isEditLimitsModalOpen, setIsEditLimitsModalOpen] = useState(false);
  const [selectedUserForLimits, setSelectedUserForLimits] = useState<User | null>(null);
  const [limitInputs, setLimitInputs] = useState<UserLimitInputs>({
    maxMessagesPerMonth: '',
    maxReactionsPerMonth: '',
    maxReactionsPerMessage: '',
    lastUsageResetDate: '',
  });
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false);
  const [isUpdatingLimits, setIsUpdatingLimits] = useState(false);
  const [lastUpdatedUserId, setLastUpdatedUserId] = useState<string | null>(null);


  const [isModerationModalOpen, setIsModerationModalOpen] = useState(false);
  const [selectedUserForModeration, setSelectedUserForModeration] = useState<User | null>(null);
  const [moderationInputs, setModerationInputs] = useState<UserModerationInputs>({
    moderateImages: false,
    moderateVideos: false,
    pending: [],
  });
  const [isUpdatingModeration, setIsUpdatingModeration] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [usersRes, countsRes] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getModerationSummary(),
        ]);
        console.log('[AdminPortal] fetched users raw', usersRes.data);
        console.log('[AdminPortal] moderation summary raw', countsRes.data);
        const fetchedUsers = usersRes.data.users || usersRes.data;
        const normalized = fetchedUsers.map(normalizeUser);
        const countsData = countsRes.data || {};
        let counts: Record<string, number> = {};
        if (Array.isArray(countsData)) {
          countsData.forEach((item: any) => {
            const id = item.userId || item.user_id || item.id;
            if (!id) return;
            const value =
              item.pending ??
              item.count ??
              item.pendingCount ??
              (typeof item.messages === 'number' || typeof item.reactions === 'number'
                ? (item.messages || 0) + (item.reactions || 0)
                : undefined);
            counts[id] = value ?? 0;
          });
        } else if (countsData.counts) {
          counts = countsData.counts;
        } else {
          counts = countsData;
        }
        console.log('[AdminPortal] parsed moderation counts', counts);
        const withCounts = normalized.map((u: User) => ({
          ...u,
          pendingManualReviews: counts[u.id] ?? u.pendingManualReviews ?? 0,
        }));
        console.log('[AdminPortal] normalized users', withCounts);
        setUsers(withCounts);
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
      const updatedUser = users.find(u => u.id === lastUpdatedUserId);
      console.log('[AdminPortal] user updated', updatedUser);
      setLastUpdatedUserId(null);
    }
  }, [users, lastUpdatedUserId]);

  const handleLimitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number' && value !== '' && !/^\d+$/.test(value) && value !== '-') {
      return;
    }
    setLimitInputs(prev => ({ ...prev, [name]: value }));
    console.log('[AdminPortal] limit input change', name, value);
  };

  const handleSaveLimits = async () => {
    if (!selectedUserForLimits) return;

    setIsUpdatingLimits(true);

    const parseInput = (value: string): number | null => {
      if (value === '') return null;
      const num = parseInt(value, 10);
      return isNaN(num) ? null : num;
    };

    const rawDate = limitInputs.lastUsageResetDate;
    let formattedDateForPayload: string | null = null;
    if (rawDate) {
      try {


        const parts = rawDate.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);


          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {

            const utcDate = new Date(Date.UTC(year, month - 1, day));
            if (!isNaN(utcDate.getTime())) {



              if (utcDate.getUTCFullYear() === year &&
                  utcDate.getUTCMonth() === month - 1 &&
                  utcDate.getUTCDate() === day) {
                formattedDateForPayload = utcDate.toISOString();
              }

            }

          }

        }

      } catch (error) {



      }
    }


    const maxMessages = parseInput(limitInputs.maxMessagesPerMonth);
    const maxReactions = parseInput(limitInputs.maxReactionsPerMonth);
    const maxReactionsMsg = parseInput(limitInputs.maxReactionsPerMessage);


    const finalPayload = {
      max_messages_per_month: maxMessages,
      max_reactions_per_month: maxReactions,
      max_reactions_per_message: maxReactionsMsg,
      last_usage_reset_date: formattedDateForPayload,
    };

    console.log('[AdminPortal] finalPayload', finalPayload);


    const allNull = Object.values(finalPayload).every(value => value === null);

    if (allNull) {
      toast.error("Please provide at least one limit value to update.");
      setIsUpdatingLimits(false);
      return;
    }

    try {



      const updateRes = await adminApi.updateUserLimits(selectedUserForLimits.id, finalPayload);
      console.log('[AdminPortal] updateUserLimits result', updateRes.data);


      const camelCaseUpdateData = {
          maxMessagesPerMonth: maxMessages,
          maxReactionsPerMonth: maxReactions,
          maxReactionsPerMessage: maxReactionsMsg,
          lastUsageResetDate: formattedDateForPayload,
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

  const handleModerationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, checked } = e.target;
    setModerationInputs(prev => ({ ...prev, [name]: checked }));
    console.log('[AdminPortal] moderation input change', name, checked);
  };

  const handleSaveModeration = async () => {
    if (!selectedUserForModeration) return;
    setIsUpdatingModeration(true);
    const payload = {
      moderate_images: moderationInputs.moderateImages,
      moderate_videos: moderationInputs.moderateVideos,
    };
    try {
      const res = await adminApi.updateUserModeration(
        selectedUserForModeration.id,
        payload,
      );
      console.log('[AdminPortal] updateUserModeration result', res.data);
      setUsers(prev =>
        prev.map(u =>
          u.id === selectedUserForModeration.id
            ? {
                ...u,
                moderateImages: moderationInputs.moderateImages,
                moderateVideos: moderationInputs.moderateVideos,
              }
            : u,
        ),
      );
      toast.success('Moderation settings updated!');
      setIsModerationModalOpen(false);
      setSelectedUserForModeration(null);
    } catch (err) {
      toast.error('Failed to update moderation');
      console.error('Update moderation error:', err);
    } finally {
      setIsUpdatingModeration(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    setUpdatingRoleId(userId);

    const user = users.find(u => u.id === userId);
    const oldRole = user?.role;

    try {
      let finalApiResponse: any;
      let updatedUserData: User | undefined;

      if (oldRole === 'guest' && newRole === 'user') {
        const roleUpdateResponse = await adminApi.updateUserRole(userId, newRole);

        if (roleUpdateResponse && (roleUpdateResponse.status === 200 || roleUpdateResponse.status === 204 || roleUpdateResponse.data)) {
          const newLastUsageResetDate = new Date().toISOString();
          finalApiResponse = await adminApi.updateUserLimits(userId, {
            last_usage_reset_date: newLastUsageResetDate
          });
          updatedUserData = finalApiResponse.data;
        } else {
          throw new Error(roleUpdateResponse?.data?.message || `Role update to '${newRole}' failed`);
        }
      } else {

        finalApiResponse = await adminApi.updateUserRole(userId, newRole);
        updatedUserData = finalApiResponse.data;
      }

      toast.success(`User ${userId} role updated to ${newRole}.`);


      let finalUserUpdate: Partial<User> = {};
      if (updatedUserData) {
        finalUserUpdate = {
            ...updatedUserData,
            role: newRole,
        };

        if (oldRole === 'guest' && newRole === 'user' && finalUserUpdate.lastUsageResetDate) {

        }
      } else if (oldRole === 'guest' && newRole === 'user') {

         finalUserUpdate = { role: newRole, lastUsageResetDate: new Date().toISOString() };
      } else {

        finalUserUpdate = { role: newRole, lastUsageResetDate: user?.lastUsageResetDate || null };
      }


      if (newRole === 'guest' && oldRole !== 'guest') {

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

          const guestLimitsResponse = await adminApi.updateUserLimits(userId, apiGuestPayload);
          console.log('[AdminPortal] guest limits response', guestLimitsResponse.data);
          toast.success(`User ${userId} limits reset to guest defaults.`);

          if (guestLimitsResponse.data) {
             finalUserUpdate = { ...finalUserUpdate, ...guestLimitsResponse.data, role: newRole };
          } else {

             finalUserUpdate = {
                ...finalUserUpdate,
                maxMessagesPerMonth: guestMaxMessages,
                maxReactionsPerMonth: guestMaxReactions,
                maxReactionsPerMessage: guestMaxReactionsMsg,
                lastUsageResetDate: guestLastUsageResetDateIso,
             };
          }
        } catch (limitErr) {
          console.error('Failed to set guest limits:', limitErr);
          toast.error('Role set to guest, but failed to reset limits. Manual limit adjustment might be needed.');


        }
      }


      if (Object.keys(finalUserUpdate).length > 0) {
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.id === userId ? { ...u, ...finalUserUpdate } : u
          )
        );
        setLastUpdatedUserId(userId);
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300 hidden sm:table-cell">Pending Reviews</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300 hidden md:table-cell">Created At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-neutral-300">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-neutral-700">
              {users.map((user) => {
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-300 hidden sm:table-cell">
                  {user.pendingManualReviews ?? 0}
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
                            console.log('[AdminPortal] getUserDetails response', apiResponse.data);
                            const userDetailsToDisplay: User = normalizeUser(apiResponse.data);
                            console.log('[AdminPortal] normalized user details', userDetailsToDisplay);

                            setSelectedUserForLimits(userDetailsToDisplay);

                            const resetDateForInput = userDetailsToDisplay.lastUsageResetDate
                              ? new Date(userDetailsToDisplay.lastUsageResetDate).toISOString().split('T')[0]
                              : '';

                            setLimitInputs({
                              maxMessagesPerMonth: userDetailsToDisplay.maxMessagesPerMonth?.toString() || '',
                              maxReactionsPerMonth: userDetailsToDisplay.maxReactionsPerMonth?.toString() || '',
                              maxReactionsPerMessage: userDetailsToDisplay.maxReactionsPerMessage?.toString() || '',
                              lastUsageResetDate: resetDateForInput,
                            });
                            console.log('[AdminPortal] limitInputs after fetch', {
                              ...userDetailsToDisplay,
                              resetDateForInput,
                            });
                            setIsEditLimitsModalOpen(true);
                          } catch (err) {
                            toast.error('Failed to fetch user details.');
                            console.error("Fetch user details error:", err);
                            setSelectedUserForLimits(null);
                          } finally {
                            setIsLoadingUserDetails(false);
                          }
                        }}
                        disabled={(isLoadingUserDetails && selectedUserForLimits?.id === user.id) || (isEditLimitsModalOpen && selectedUserForLimits?.id !== user.id) || !!updatingRoleId || isDeletingUser}
                        isLoading={isLoadingUserDetails && selectedUserForLimits?.id === user.id}
                      >
                        Manage Limits
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          setSelectedUserForModeration(user);
                          setIsLoadingUserDetails(true);
                          try {
                          const [userRes, pendingRes] = await Promise.all([
                            adminApi.getUserDetails(user.id),
                            adminApi.getUserPendingModeration(user.id),
                          ]);
                          console.log('[AdminPortal] moderation user details raw', userRes.data);
                          console.log('[AdminPortal] user pending moderation raw', pendingRes.data);
                          const normalized = normalizeUser(userRes.data);
                          const pendingRaw = pendingRes.data?.pending || pendingRes.data || {};
                          const pendingArr = [
                            ...((pendingRaw.messages || []).map((m: any) => ({
                              id: m.id,
                              cloudinaryId: m.publicId || m.public_id || m.cloudinaryId,
                              type: 'message',
                            }))),
                            ...((pendingRaw.reactions || []).map((r: any) => ({
                              id: r.id,
                              cloudinaryId: r.publicId || r.public_id || r.cloudinaryId,
                              type: 'reaction',
                            }))),
                          ];
                          console.log('[AdminPortal] normalized moderation user', normalized);
                          console.log('[AdminPortal] parsed pending moderation', pendingArr);
                          setModerationInputs({
                            moderateImages: !!normalized.moderateImages,
                            moderateVideos: !!normalized.moderateVideos,
                            pending: pendingArr,
                          });
                          setUsers(prev =>
                            prev.map(u =>
                              u.id === user.id
                                ? { ...u, pendingManualReviews: pendingArr.length }
                                : u,
                            ),
                          );
                            setIsModerationModalOpen(true);
                          } catch (err) {
                            toast.error('Failed to fetch moderation details.');
                            console.error('Fetch moderation details error:', err);
                            setSelectedUserForModeration(null);
                          } finally {
                            setIsLoadingUserDetails(false);
                          }
                        }}
                        disabled={(isLoadingUserDetails && selectedUserForModeration?.id === user.id) || isModerationModalOpen}
                        isLoading={isLoadingUserDetails && selectedUserForModeration?.id === user.id}
                      >
                        Manage Moderation
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
            size="lg"
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
                variant="primary"
                onClick={handleSaveLimits}
                isLoading={isUpdatingLimits}
                disabled={isUpdatingLimits}
              >
                Save Limits
              </Button>
            </div>
          </Modal>
        )}

        {/* Manage Moderation Modal */}
        {isModerationModalOpen && selectedUserForModeration && (
          <Modal
            isOpen={isModerationModalOpen}
            onClose={() => {
              if (isUpdatingModeration) return;
              setIsModerationModalOpen(false);
              setSelectedUserForModeration(null);
            }}
            title={`Manage Moderation for ${selectedUserForModeration.name}`}
            size="lg"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="moderateImages"
                  id="moderateImages"
                  checked={moderationInputs.moderateImages}
                  onChange={handleModerationInputChange}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600 dark:border-neutral-700 dark:bg-neutral-900"
                  disabled={isUpdatingModeration}
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
                  checked={moderationInputs.moderateVideos}
                  onChange={handleModerationInputChange}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600 dark:border-neutral-700 dark:bg-neutral-900"
                  disabled={isUpdatingModeration}
                />
                <label htmlFor="moderateVideos" className="text-sm text-neutral-800 dark:text-neutral-100">
                  Moderate video uploads
                </label>
              </div>

              {moderationInputs.pending && moderationInputs.pending.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold mb-1">Pending Manual Reviews</h4>
                  <ul className="list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
                    {moderationInputs.pending.map(item => (
                      <li key={item.id}>{item.type} - {item.cloudinaryId}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModerationModalOpen(false);
                  setSelectedUserForModeration(null);
                }}
                disabled={isUpdatingModeration}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveModeration}
                isLoading={isUpdatingModeration}
                disabled={isUpdatingModeration}
              >
                Save Settings
              </Button>
            </div>
          </Modal>
        )}
      </div> {/* Close main content wrapper div */}
    </DashboardLayout>
  );
};

export default AdminPortalPage;
