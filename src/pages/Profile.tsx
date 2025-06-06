import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../services/api';
import { User } from '../types/user';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDateTime } from '../utils/formatters'; // Import formatDateTime
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardLayout from '../layouts/DashboardLayout'; // Import DashboardLayout

// Assuming a Card component might exist for layout, will add if available or use simple divs
// import Card from '../components/common/Card'; 

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate(); // For redirection

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // To show loading state on confirm button

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await profileApi.getProfileMe();
        console.log('Raw profile data from API:', JSON.stringify(response.data, null, 2));
        setProfileData(response.data);
      } catch (err) {
        setError('Failed to fetch profile data. Please try again later.');
        console.error('Fetch profile error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

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

  if (!profileData) {
    return (
      <DashboardLayout>
        <div className="text-center p-4"> {/* Added p-4 for some spacing */}
          <p>No profile data available.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Fallback to authUser if profileData is incomplete for some fields, though API should be source of truth
  const name = profileData.name || authUser?.name;
  const email = profileData.email || authUser?.email;
  const picture = profileData.picture || authUser?.picture;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await profileApi.deleteProfileMe();
      toast.success('Account deleted successfully.');
      setIsDeleteModalOpen(false); // Close modal
      logout(); // Clear auth context and local token
      navigate('/login'); // Redirect to login page
    } catch (err) {
      console.error('Delete account error:', err);
      toast.error(
        (err as any)?.response?.data?.message || 'Failed to delete account. Please try again.'
      );
      // Optionally keep modal open, or close as done for success:
      // setIsDeleteModalOpen(false); 
    } finally {
      setIsDeleting(false);
    }
  };

  console.log('ProfileData at render time:', JSON.stringify(profileData, null, 2));
  console.log('Render-time currentMessages VAL:', profileData.current_messages_this_month, 'TYPE:', typeof profileData.current_messages_this_month);
  console.log('Render-time maxMessages VAL:', profileData.max_messages_per_month, 'TYPE:', typeof profileData.max_messages_per_month);
  console.log('Render-time maxReactionsMessage VAL:', profileData.max_reactions_per_message, 'TYPE:', typeof profileData.max_reactions_per_message);
  console.log('Render-time lastUsageResetDate VAL:', profileData.last_usage_reset_date, 'TYPE:', typeof profileData.last_usage_reset_date);
  return (
    <DashboardLayout>
      <div className="space-y-6"> {/* Main content div ensuring it's properly closed before DashboardLayout closes */}
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
      <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6"> {/* Added dark:bg-neutral-800 */}
        <div className="flex items-center space-x-4 mb-6">
          {picture && (
            <img 
              src={picture} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover" 
            />
          )}
          <div>
            <h2 className="text-2xl font-semibold">{name}</h2>
            <p className="text-gray-600">{email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <span className="font-semibold">Role:</span>
            <span className="ml-2 capitalize bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
              {profileData.role}
            </span>
          </div>
          <div>
            <span className="font-semibold">Last Login:</span>
            <span className="ml-2">{profileData.lastLogin ? formatDateTime(profileData.lastLogin) : 'Not available'}</span>
          </div>
          <div>
            <span className="font-semibold">User ID:</span>
            <span className="ml-2">{profileData.id}</span>
          </div>
        </div>
      </div>

      {/* Usage and Limits Section */}
      <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4">Usage and Limits</h3>
        <div className="space-y-3">
          <div>
            <span className="font-semibold">Messages This Month:</span>
            <span className="ml-2">
              {(profileData.current_messages_this_month ?? 0)} / {profileData.max_messages_per_month != null ? profileData.max_messages_per_month : 'Unlimited'}
            </span>
          </div>
          <div>
            <span className="font-semibold">Reactions Received by Your Content This Month:</span>
            <span className="ml-2">
              {(profileData.reactions_received_this_month ?? 0)} / {profileData.max_reactions_per_month != null ? profileData.max_reactions_per_month : 'Unlimited'}
            </span>
          </div>
          <div>
            <span className="font-semibold">Default Reactions Allowed for New Messages:</span>
            <span className="ml-2">
              {profileData.max_reactions_per_message != null ? profileData.max_reactions_per_message : 'Not set'}
            </span>
          </div>
          {profileData.role !== 'guest' && (
            <div>
              <span className="font-semibold">Usage Resets On:</span>
              <span className="ml-2">
                {profileData.last_usage_reset_date ? formatDate(profileData.last_usage_reset_date) : 'N/A'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3">Account Management</h3>
        <Button 
          variant="danger"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          Delete Account
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          This action is irreversible and will permanently delete your account and all associated data.
        </p>
      </div>

      {isDeleteModalOpen && ( // Ensure Modal is only rendered when isOpen is true
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Account Deletion"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete your account? This action is irreversible and will remove all your messages, reactions, replies, and associated content.
            </p>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              All your data will be permanently lost.
            </p>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </Modal>
      )}
      </div> {/* This is the crucial closing div for "space-y-6" */}
    </DashboardLayout> // This is the crucial closing tag for DashboardLayout
  );
};

export default ProfilePage;
