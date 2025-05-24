import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MESSAGE_ROUTES, REACTION_ROUTES } from '../components/constants/apiRoutes.ts';
import { useAuth } from '../context/AuthContext';
import { MessageWithReactions } from '../types/message';
import { Reaction } from '../types/reaction';
import DashboardLayout from '../layouts/DashboardLayout';
import MessageList from '../components/dashboard/MessageList';
import ReactionViewer from '../components/dashboard/ReactionViewer';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import api from '@/services/api.ts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<MessageWithReactions[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentPage,setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalReactions: 0,
    viewRate: 0,
    reactionRate: 0,
  });
  
  interface DashboardApiResponse {
      messages: MessageWithReactions[];
      stats: {
        totalMessages: number;
        totalReactions: number;
        viewRate: string;         // e.g. "85.23%"
        reactionRate: string;     // returned by backend but not used here
        viewedMessages: number;
      };
    }

useEffect(() => {
  const fetchMessages = async () => {
    try {
      setLoading(true);

      const response = await api.get<DashboardApiResponse>(
        `${MESSAGE_ROUTES.GET_ALL}?page=${currentPage}&limit=${limit}`
      );

      const { messages: fetchedMessages, stats: fetchedStats } = response.data;

      setMessages(fetchedMessages);

      const {
        totalMessages,
        totalReactions,
        viewRate,
        viewedMessages,
      } = fetchedStats;

      const safeViewedMessages = Number(viewedMessages) || 0;

      const messagesWithReactions = Array.isArray(fetchedMessages)
        ? fetchedMessages.filter(
            (msg: MessageWithReactions) =>
              Array.isArray(msg.reactions) && msg.reactions.length > 0
          ).length
        : 0;

      const parsedViewRate = parseFloat(viewRate);
      const safeViewRate = isNaN(parsedViewRate) ? 0 : parsedViewRate;

      setStats({
        totalMessages: Number(totalMessages) || 0,
        totalReactions: Number(totalReactions) || 0,
        viewRate: safeViewRate,
        reactionRate:
          safeViewedMessages > 0
            ? parseFloat(((messagesWithReactions / safeViewedMessages) * 100).toFixed(2))
            : 0,
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load your messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  fetchMessages();
}, [currentPage, messageToDelete]);

  // handle page change
  const handlepagechange = (page:number)=>{
    setCurrentPage(page)

  }
  
  // Handle message deletion
  const handleDeleteMessage = (messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteModalOpen(true);
  };
  
  // Confirm message deletion
  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
  
    try {
      await api.delete(MESSAGE_ROUTES.DELETE(messageToDelete)); // <- ✅ Use your configured `api`
  
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== messageToDelete)
      );
  
      toast.success('Message deleted successfully.');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete the message. Please try again.');
    } finally {
      setMessageToDelete(null);
      setDeleteModalOpen(false);
    }
  };

  // Handle viewing a reaction
  const handleViewReaction = (reactionId: string) => {
     navigate(`/message/${reactionId}`);
    };

  
  // Handle deleting a reaction
  // const handleDeleteReaction = async (reactionId: string) => {
  //   try {

  //     await api.delete(MESSAGE_ROUTES.DELETE(reactionId))
      
  //     // Update messages state
  //     setMessages(prevMessages => 
  //       prevMessages.map(msg => ({
  //         ...msg,
  //         reactions: msg.reactions.filter(r => r.id !== reactionId)
  //       }))
  //     );
      
  //     // Close the reaction viewer
  //     setSelectedReaction(null);
      
  //     toast.success('Reaction deleted successfully.');
  //   } catch (error) {
  //     console.error('Error deleting reaction:', error);
  //     toast.error('Failed to delete the reaction. Please try again.');
  //   }
  // };
  
  // Helper function to truncate strings
  const truncateString = (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  };
  
  return (
    <DashboardLayout>
      <div className="pb-12">
        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Your Dashboard
            </h1>
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
              Manage your surprise messages and view reactions.
            </p>
          </div>
          
          <Link
            to="/create"
            className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="-ml-1 mr-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Message
          </Link>
        </div>
        
        {/* Stats overview */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-neutral-800">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-primary-100 p-3 dark:bg-primary-900/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary-600 dark:text-primary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Total Messages
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-neutral-900 dark:text-white">
                        {stats.totalMessages}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-neutral-800">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-green-100 p-3 dark:bg-green-900/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      View Rate
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-neutral-900 dark:text-white">
                        {stats.viewRate.toFixed(0)}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-neutral-800">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-red-100 p-3 dark:bg-red-900/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Total Reactions
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-neutral-900 dark:text-white">
                        {stats.totalReactions}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-neutral-800">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-yellow-100 p-3 dark:bg-yellow-900/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Reaction Rate (Viewed Messages)
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-neutral-900 dark:text-white">
                        {stats.reactionRate.toFixed(0)}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Message list */}
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-neutral-800">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Your Messages
            </h2>
            <div className="mt-4">
              <MessageList
                messages={messages}
                onDeleteMessage={handleDeleteMessage}
                onViewReaction={handleViewReaction}
                loading={loading}
              />
            </div>
          </div>
        </div>
        <div className='flex justify-end items-center mt-4'>
          <Button
          variant='outline'
          onClick={()=>handlepagechange(currentPage -1)}
          disabled = {currentPage === 1}
          >
            Previous
          </Button>
          <span className='mx-2 text-neutral-500 dark:text-neutral-400'>
            Page {currentPage} of {Math.ceil( stats.totalMessages / limit)}
          </span>
          <Button
          variant='outline'
          onClick={()=>handlepagechange(currentPage + 1)}
          disabled = {currentPage === Math.ceil(stats.totalMessages / limit)}
          >
            Next
          </Button>
          
        </div>
      </div>


      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Message"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteMessage}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-neutral-600 dark:text-neutral-300">
          Are you sure you want to delete this message? This will also delete all associated reactions and cannot be undone.
        </p>
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;
