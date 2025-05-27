import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../services/api';
import { User } from '../types/user';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner'; // Import LoadingSpinner

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
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-200px)]"> 
        {/* Centering the spinner */}
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>No profile data available.</p>
        {/* This case might indicate an issue or an unauthorized access attempt if error is not set */}
      </div>
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      {/* Using simple divs for structure, replace with Card if available and desired */}
      <div className="bg-white shadow rounded-lg p-6">
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
            <span className="ml-2">{profileData.lastLogin ? formatDate(profileData.lastLogin) : 'Not available'}</span>
          </div>
          {/* Displaying User ID for completeness, can be removed if not needed */}
          <div>
            <span className="font-semibold">User ID:</span>
            <span className="ml-2">{profileData.id}</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3">Account Management</h3>
        <Button 
          variant="danger"
          onClick={() => setIsDeleteModalOpen(true)} // Open modal
        >
          Delete Account
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          This action is irreversible and will permanently delete your account and all associated data.
        </p>
      </div>

      {/* Delete Account Modal */}
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
    </div>
  );
};

export default ProfilePage;
