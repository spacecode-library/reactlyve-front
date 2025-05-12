  // import React, { useState, useEffect } from 'react';
  // import { useParams, useNavigate } from 'react-router-dom';
  // import toast from 'react-hot-toast';
  // import { MESSAGE_ERRORS } from '../components/constants/errorMessages';
  // import PasscodeEntry from '../components/recipient/PasscodeEntry';
  // import MessageViewer from '../components/recipient/MessageViewer';
  // import LoadingSpinner from '../components/common/LoadingSpinner';
  // import api from '@/services/api';

  // interface MessageData {
  //   id: string;
  //   content: string;
  //   imageUrl?: string;
  //   hasPasscode: boolean;
  //   viewCount: number;
  //   createdAt: string;
  //   sender?: {
  //     name: string;
  //     picture?: string;
  //   };
  // }

  // // Base API URL - hardcoded to ensure we're using the correct one
  // const API_BASE_URL = 'http://localhost:8000/api';

  // const View: React.FC = () => {
  //   const { id } = useParams<{ id: string }>();
  //   const navigate = useNavigate();
    
  //   const [message, setMessage] = useState<MessageData | null>(null);
  //   const [loading, setLoading] = useState(true);
  //   const [error, setError] = useState<string | null>(null);
  //   const [needsPasscode, setNeedsPasscode] = useState(false);
  //   const [passcodeVerified, setPasscodeVerified] = useState(false);
  //   const [reactionComplete, setReactionComplete] = useState(false);
    
  //   // Fetch message data
  //   useEffect(() => {
  //     const fetchMessage = async () => {
  //       if (!id) {
  //         setError('Invalid message link');
  //         setLoading(false);
  //         return;
  //       }
        
  //       // Extract UUID if the ID contains it (e.g., from a URL path)
  //       const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  //       const match = id.match(uuidRegex);
  //       const cleanId = match ? match[1] : id;
        
  //       console.log('Clean message ID:', cleanId);
        
  //       // Try multiple API endpoints to find the one that works
  //       const endpoints = [
  //         // Try standard message endpoint
  //         `/messages/${cleanId}`,
  //         // Try view-specific endpoint
  //         `/messages/view/${cleanId}`,
  //         // Try shared-specific endpoint
  //         `/messages/shared/${cleanId}`,
  //         // Try messages/m endpoint
  //         `/messages/m/${cleanId}`,
  //         // Try with v prefix (some APIs use this)
  //         `/v1/messages/${cleanId}`,
  //         // Try just the plain endpoint 
  //         `/message/${cleanId}`
  //       ];
        
  //       let foundMessage = false;
        
  //       for (const endpoint of endpoints) {
  //         try {
  //           console.log(`Trying endpoint: ${API_BASE_URL}${endpoint}`);
            
  //           const response = await api.get(`${API_BASE_URL}${endpoint}`, {
  //             withCredentials: true
  //           });
            
  //           // If we get here, the request was successful
  //           console.log('Successful response from endpoint:', endpoint);
  //           console.log('Response data:', response.data);
            
  //           if (response.data) {
  //             setMessage(response.data);
              
  //             // Determine if passcode is needed
  //             const requiresPasscode = 
  //               response.data.hasPasscode === true || 
  //               response.data.requiresPasscode === true;
                
  //             const isVerified = 
  //               response.data.passcodeVerified === true ||
  //               !requiresPasscode;
                
  //             setNeedsPasscode(requiresPasscode && !isVerified);
  //             setPasscodeVerified(isVerified);
              
  //             setLoading(false);
  //             foundMessage = true;
              
  //             // Save the successful endpoint for future use
  //             localStorage.setItem('reactlyve_message_endpoint', endpoint);
              
  //             break;
  //           }
  //         } catch (error) {
  //           console.error(`Error with endpoint ${endpoint}:`, error);
  //           // Continue trying other endpoints
  //         }
  //       }
        
  //       if (!foundMessage) {
  //         // Try one more approach - direct axios call to the display URL
  //         try {
  //           console.log('Trying direct display URL fetch');
            
  //           // This assumes your backend has an endpoint that matches the URL pattern
  //           const displayUrl = `/m/${cleanId}`; 
  //           const response = await api.get(`${API_BASE_URL}${displayUrl}`, {
  //             withCredentials: true
  //           });
            
  //           if (response.data) {
  //             setMessage(response.data);
  //             setNeedsPasscode(
  //               response.data.hasPasscode === true && 
  //               !response.data.passcodeVerified
  //             );
  //             setPasscodeVerified(
  //               response.data.passcodeVerified || 
  //               !response.data.hasPasscode
  //             );
  //             setLoading(false);
              
  //             // Save the successful endpoint for future use
  //             localStorage.setItem('reactlyve_message_endpoint', displayUrl);
              
  //             foundMessage = true;
  //           }
  //         } catch (endpointError) {
  //           console.error('Error with display URL endpoint:', endpointError);
  //           // Continue to error state
  //         }
  //       }
        
  //       if (!foundMessage) {
  //         console.error('Message not found with any endpoint');
  //         setError(MESSAGE_ERRORS.NOT_FOUND);
  //         setLoading(false);
  //       }
  //     };
      
  //     fetchMessage();
  //   }, [id]);
    
  //   // Handle passcode submission
  //   const handleSubmitPasscode = async (passcode: string): Promise<boolean> => {
  //     if (!id || !message) return false;
      
  //     try {
  //       const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  //       const match = id.match(uuidRegex);
  //       const cleanId = match ? match[1] : id;
        
  //       // Use the passcode verification endpoint
  //       const response = await api.post(
  //         `${API_BASE_URL}/messages/${cleanId}/verify-passcode`, 
  //         { passcode },
  //         { withCredentials: true }
  //       );
        
  //       console.log('Passcode verification response:', response);
        
  //       if (response.data && (response.data.verified || response.status === 200)) {
  //         setPasscodeVerified(true);
          
  //         // If the response includes the message data, update it
  //         if (response.data.message) {
  //           setMessage(response.data.message);
  //         }
          
  //         return true;
  //       }
        
  //       return false;
  //     } catch (error) {
  //       console.error('Error verifying passcode:', error);
  //       return false;
  //     }
  //   };
    
  //   // Handle recording reaction
  //   const handleRecordReaction = async (messageId: string, videoBlob: Blob): Promise<void> => {
  //     try {
  //       const formData = new FormData();
  //       formData.append('video', videoBlob, 'reaction.webm');
        
  //       await api.post(
  //         `${API_BASE_URL}/reactions/${messageId}`, 
  //         formData, 
  //         {
  //           headers: {
  //             'Content-Type': 'multipart/form-data',
  //           },
  //           withCredentials: true
  //         }
  //       );
        
  //       setReactionComplete(true);
  //       toast.success('Your reaction has been recorded!');
  //     } catch (error) {
  //       console.error('Error uploading reaction:', error);
  //       toast.error('Failed to upload reaction. Please try again.');
  //       throw error;
  //     }
  //   };
    
  //   // Handle skip reaction
  //   const handleSkipReaction = () => {
  //     setReactionComplete(true);
  //     toast.success('You have chosen to skip recording a reaction.');
  //   };
    
  //   // Display debugging information
  //   const renderDebugInfo = () => {
  //     if (process.env.NODE_ENV !== 'development') return null;
      
  //     return (
  //       <div className="mt-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
  //         <h3 className="text-sm font-semibold">Debug Information:</h3>
  //         <p className="text-xs">Message ID: {id}</p>
  //         <p className="text-xs">Clean ID: {id ? id.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)?.[1] : 'None'}</p>
  //         <p className="text-xs">API Base URL: {API_BASE_URL}</p>
  //         <p className="text-xs">Last successful endpoint: {localStorage.getItem('reactlyve_message_endpoint') || 'None'}</p>
  //       </div>
  //     );
  //   };
    
  //   // Loading state
  //   if (loading) {
  //     return (
  //       <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
  //         <div className="text-center">
  //           <LoadingSpinner size="lg" />
  //           <p className="mt-4 text-neutral-600 dark:text-neutral-300">
  //             Loading message...
  //           </p>
  //           {renderDebugInfo()}
  //         </div>
  //       </div>
  //     );
  //   }
    
  //   // Error state
  //   if (error) {
  //     return (
  //       <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
  //         <div className="max-w-md text-center">
  //           <svg
  //             xmlns="http://www.w3.org/2000/svg"
  //             className="mx-auto h-12 w-12 text-red-500 dark:text-red-400"
  //             fill="none"
  //             viewBox="0 0 24 24"
  //             stroke="currentColor"
  //             strokeWidth={2}
  //           >
  //             <path
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //               d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  //             />
  //           </svg>
  //           <h2 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
  //             {error === MESSAGE_ERRORS.NOT_FOUND
  //               ? 'Message Not Found'
  //               : error === MESSAGE_ERRORS.LINK_EXPIRED
  //               ? 'Link Expired'
  //               : 'Error'}
  //           </h2>
  //           <p className="mt-2 text-neutral-600 dark:text-neutral-300">{error}</p>
  //           <button
  //             type="button"
  //             onClick={() => navigate('/')}
  //             className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
  //           >
  //             Return Home
  //           </button>
  //           {renderDebugInfo()}
  //         </div>
  //       </div>
  //     );
  //   }
    
  //   // Reaction complete state
  //   if (reactionComplete) {
  //     return (
  //       <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
  //         <div className="max-w-md text-center">
  //           <svg
  //             xmlns="http://www.w3.org/2000/svg"
  //             className="mx-auto h-12 w-12 text-green-500 dark:text-green-400"
  //             fill="none"
  //             viewBox="0 0 24 24"
  //             stroke="currentColor"
  //             strokeWidth={2}
  //           >
  //             <path
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //               d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
  //             />
  //           </svg>
  //           <h2 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
  //             Thank You!
  //           </h2>
  //           <p className="mt-2 text-neutral-600 dark:text-neutral-300">
  //             Your response has been recorded and shared with the sender.
  //           </p>
  //           <button
  //             type="button"
  //             onClick={() => navigate('/')}
  //             className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
  //           >
  //             Return Home
  //           </button>
  //         </div>
  //       </div>
  //     );
  //   }
    
  //   // Passcode entry state
  //   if (needsPasscode && !passcodeVerified) {
  //     return (
  //       <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
  //         <PasscodeEntry onSubmitPasscode={handleSubmitPasscode} />
  //         {renderDebugInfo()}
  //       </div>
  //     );
  //   }
    
  //   // Message viewer state
  //   if (message && (passcodeVerified || !needsPasscode)) {
  //     return (
  //       <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-900">
  //         <MessageViewer
  //           message={message}
  //           onRecordReaction={handleRecordReaction}
  //           onSkipReaction={handleSkipReaction}
  //         />
  //         {renderDebugInfo()}
  //       </div>
  //     );
  //   }
    
  //   // Fallback for any other state (shouldn't happen)
  //   return (
  //     <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
  //       <div className="text-center">
  //         <p className="text-neutral-600 dark:text-neutral-300">
  //           Something went wrong. Please try again later.
  //         </p>
  //         <button
  //           type="button"
  //           onClick={() => navigate('/')}
  //           className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
  //         >
  //           Return Home
  //         </button>
  //         {renderDebugInfo()}
  //       </div>
  //     </div>
  //   );
  // };

  // export default View;
// -------------------------
  import React, { useState, useEffect } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import toast from 'react-hot-toast';
  import { MESSAGE_ERRORS } from '../components/constants/errorMessages';
  import PasscodeEntry from '../components/recipient/PasscodeEntry';
  import MessageViewer from '../components/recipient/MessageViewer';
  import LoadingSpinner from '../components/common/LoadingSpinner';
  import api from '../services/api';

  interface MessageData {
    id: string;
    content: string;
    imageUrl?: string;
    hasPasscode: boolean;
    passcodeVerified?: boolean;
    viewCount?: number;
    createdAt: string;
    sender?: {
      name: string;
      picture?: string;
    };
  }

  const View: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [message, setMessage] = useState<MessageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [needsPasscode, setNeedsPasscode] = useState(false);
    const [passcodeVerified, setPasscodeVerified] = useState(false);
    const [reactionComplete, setReactionComplete] = useState(false);
    
    // Fetch message data
    useEffect(() => {
      const fetchMessage = async () => {
        if (!id) {
          setError('Invalid message link');
          setLoading(false);
          return;
        }
        
        try {
          // Use the API endpoint that matches our backend
          const response = await api.get(`/messages/view/${id}`);
          
          if (response.data) {
            setMessage(response.data);
            
            // Determine if passcode is needed
            const requiresPasscode = response.data.hasPasscode === true;
            const isVerified = response.data.passcodeVerified === true || !requiresPasscode;
                
            setNeedsPasscode(requiresPasscode && !isVerified);
            setPasscodeVerified(isVerified);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching message:', error);
          setError(MESSAGE_ERRORS.NOT_FOUND);
          setLoading(false);
        }
      };
      
      fetchMessage();
    }, [id]);
    
    // Handle passcode submission
    const handleSubmitPasscode = async (passcode: string): Promise<boolean> => {
      if (!id || !message) return false;
      
      try {
        // Use the direct verify-passcode endpoint
        const response = await api.post(
          `/messages/${id}/verify-passcode`, 
          { passcode }
        );
        
        if (response.data && (response.data.verified || response.status === 200)) {
          setPasscodeVerified(true);
          
          // If the response includes the message data, update it
          if (response.data.message) {
            setMessage(response.data.message);
          }
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Error verifying passcode:', error);
        return false;
      }
    };
    
    // Handle recording reaction
    const handleRecordReaction = async (messageId: string, videoBlob: Blob): Promise<void> => {
      try {
        const formData = new FormData();
        formData.append('video', videoBlob, 'reaction.webm');
        if(videoBlob.size > 0){
        await api.post(
          `/reactions/${messageId}`, 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }
        );
        
        setReactionComplete(true);
        toast.success('Your reaction has been recorded!');
        }
      } catch (error) {
        console.error('Error uploading reaction:', error);
        toast.error('Failed to upload reaction. Please try again.');
        throw error;
      }
    };
    
    // Handle skip reaction
    const handleSkipReaction = async () => {
      if (!id || !message) return;
      
      try {
        await api.post(`/reactions/${id}/skip`);
        setReactionComplete(true);
        toast.success('You have chosen to skip recording a reaction.');
      } catch (error) {
        console.error('Error skipping reaction:', error);
        // Still mark as complete even if the API call fails
        setReactionComplete(true);
        toast.success('You have chosen to skip recording a reaction.');
      }
    };
    
    // Loading state
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-neutral-600 dark:text-neutral-300">
              Loading message...
            </p>
          </div>
        </div>
      );
    }
    
    // Error state
    if (error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
          <div className="max-w-md text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-red-500 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
              {error === MESSAGE_ERRORS.NOT_FOUND
                ? 'Message Not Found'
                : error === MESSAGE_ERRORS.LINK_EXPIRED
                ? 'Link Expired'
                : 'Error'}
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    
    // Reaction complete state
    if (reactionComplete) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
          <div className="max-w-md text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-green-500 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
              Thank You!
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300">
              Your response has been recorded and shared with the sender.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    
    // Passcode entry state
    if (needsPasscode && !passcodeVerified) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
          <PasscodeEntry onSubmitPasscode={handleSubmitPasscode} />
        </div>
      );
    }
    
    // Message viewer state
    if (message && (passcodeVerified || !needsPasscode)) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-900">
          <MessageViewer
            message={message}
            onRecordReaction={handleRecordReaction}
            onSkipReaction={handleSkipReaction}
          />
        </div>
      );
    }
    
    // Fallback for any other state (shouldn't happen)
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <p className="text-neutral-600 dark:text-neutral-300">
            Something went wrong. Please try again later.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  };

  export default View;
