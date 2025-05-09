// import React, { useState, useEffect } from 'react';
// import { Motion, spring } from 'react-motion';
// import { classNames } from '../../utils/classNames';
// import Button from '../common/Button';
// import WebcamRecorder from './WebcamRecorder';
// import { formatRelativeTime } from '../../utils/formatters';

// interface MessageViewerProps {
//   message: {
//     id: string;
//     content: string;
//     imageUrl?: string;
//     createdAt: string;
//     sender?: {
//       name: string;
//       picture?: string;
//     };
//   };
//   onRecordReaction: (messageId: string, videoBlob: Blob) => Promise<void>;
//   onSkipReaction?: () => void;
//   className?: string;
// }

// const MessageViewer: React.FC<MessageViewerProps> = ({
//   message,
//   onRecordReaction,
//   onSkipReaction,
//   className,
// }) => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [showRecorder, setShowRecorder] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Animate in when component mounts
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVisible(true);
//     }, 500);
    
//     return () => clearTimeout(timer);
//   }, []);
  
//   // Handle recording completion
//   const handleRecordingComplete = async (blob: Blob) => {
//     setIsLoading(true);
    
//     try {
//       await onRecordReaction(message.id, blob);
//     } catch (error) {
//       console.error('Error uploading reaction:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Handle start recording
//   const handleStartRecording = () => {
//     setShowRecorder(true);
//   };
  
//   // Handle cancel recording
//   const handleCancelRecording = () => {
//     setShowRecorder(false);
//   };
  
//   // Handle skip reaction
//   const handleSkipReaction = () => {
//     if (onSkipReaction) {
//       onSkipReaction();
//     }
//   };
  
//   // If recording, show the webcam recorder
//   if (showRecorder) {
//     return (
//       <div className={classNames('flex flex-col', className || '')}>
//         <WebcamRecorder
//           onRecordingComplete={handleRecordingComplete}
//           onCancel={handleCancelRecording}
//           maxDuration={20000} // 20 seconds
//           countdownDuration={3} // 3 seconds
//         />
//       </div>
//     );
//   }
  
//   return (
//     <div className={classNames('mx-auto max-w-2xl', className || '')}>
//       <Motion
//         defaultStyle={{ opacity: 0, y: 20 }}
//         style={{
//           opacity: spring(isVisible ? 1 : 0),
//           y: spring(isVisible ? 0 : 20),
//         }}
//       >
//         {interpolatedStyle => (
//           <div
//             className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-neutral-800"
//             style={{
//               opacity: interpolatedStyle.opacity,
//               transform: `translateY(${interpolatedStyle.y}px)`,
//             }}
//           >
//             {/* Message content */}
//             <div className="p-6">
//               {/* Sender info (if available) */}
//               {message.sender && (
//                 <div className="mb-4 flex items-center">
//                   <div className="flex-shrink-0">
//                     <img
//                       src={message.sender.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.name)}&background=random`}
//                       alt={message.sender.name}
//                       className="h-10 w-10 rounded-full"
//                     />
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-sm font-medium text-neutral-900 dark:text-white">
//                       {message.sender.name}
//                     </p>
//                     <p className="text-xs text-neutral-500 dark:text-neutral-400">
//                       {formatRelativeTime(message.createdAt)}
//                     </p>
//                   </div>
//                 </div>
//               )}
              
//               {/* Message text */}
//               <div className="prose prose-sm max-w-none dark:prose-invert sm:prose-base">
//                 {message.content.split('\n').map((line, index) => (
//                   <p key={index} className="whitespace-pre-line">
//                     {line}
//                   </p>
//                 ))}
//               </div>
              
//               {/* Message image (if available) */}
//               {message.imageUrl && (
//                 <div className="mt-4">
//                   <img
//                     src={message.imageUrl}
//                     alt="Message attachment"
//                     className="mx-auto max-h-96 max-w-full rounded-md object-contain"
//                   />
//                 </div>
//               )}
//             </div>
            
//             {/* Action buttons */}
//             <div className="flex justify-between border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-700 dark:bg-neutral-900">
//               <Button
//                 variant="outline"
//                 onClick={handleSkipReaction}
//                 disabled={isLoading}
//               >
//                 Skip Reaction
//               </Button>
              
//               <Button
//                 variant="primary"
//                 onClick={handleStartRecording}
//                 disabled={isLoading}
//                 isLoading={isLoading}
//                 rightIcon={
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="ml-1 h-5 w-5"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                   >
//                     <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
//                   </svg>
//                 }
//               >
//                 Record Reaction
//               </Button>
//             </div>
//           </div>
//         )}
//       </Motion>
      
//       <div className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
//         <p>
//           Your reaction will be recorded via webcam and sent back to the sender.
//         </p>
//         <p className="mt-1">
//           Make sure your camera and microphone are enabled.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default MessageViewer;

import React, { useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';

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

interface MessageViewerProps {
  message: MessageData;
  onRecordReaction: (messageId: string, videoBlob: Blob) => Promise<void>;
  onSkipReaction: () => void;
}

const MessageViewer: React.FC<MessageViewerProps> = ({
  message,
  onRecordReaction,
  onSkipReaction,
}) => {
  const [recordingState, setRecordingState] = useState<
    'idle' | 'requesting' | 'recording' | 'processing' | 'preview' | 'uploading'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Format the date for display
  const formattedDate = message.createdAt 
    ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
    : '';
  
  // Start the recording process
  const handleStartRecording = async () => {
    setErrorMessage(null);
    setRecordingState('requesting');
    
    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      // Store the stream
      streamRef.current = stream;
      
      // Preview the video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Mute to prevent feedback
        videoRef.current.play();
      }
      
      // Start countdown
      setCountdown(3);
      setRecordingState('requesting');
      
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Clear countdown and start recording
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            startRecordingAfterCountdown();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setErrorMessage('Unable to access camera or microphone. Please check permissions.');
      setRecordingState('idle');
    }
  };
  
  // Start recording after countdown
  const startRecordingAfterCountdown = () => {
    if (!streamRef.current) return;
    
    // Create media recorder
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    
    // Set up data handling
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    
    // Set up recording completion
    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideo(videoUrl);
      setRecordingState('preview');
      
      // Clean up recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
    
    // Start recording
    mediaRecorder.start();
    setRecordingState('recording');
    setRecordingTime(0);
    
    // Update recording time
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    
    // Auto-stop after 60 seconds
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        stopRecording();
      }
    }, 60000);
  };
  
  // Stop recording
  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;
    
    mediaRecorderRef.current.stop();
    setRecordingState('processing');
    
    // Clean up stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };
  
  // Discard the recorded video and start over
  const handleDiscardRecording = () => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
      setRecordedVideo(null);
    }
    setRecordingState('idle');
    setErrorMessage(null);
  };
  
  // Submit the recorded video
  const handleSubmitRecording = async () => {
    if (!recordedVideo || !message.id) return;
    
    setRecordingState('uploading');
    setErrorMessage(null);
    
    try {
      // Convert video URL back to Blob
      const response = await fetch(recordedVideo);
      const videoBlob = await response.blob();
      
      // Upload the video
      await onRecordReaction(message.id, videoBlob);
      
      // Cleanup
      URL.revokeObjectURL(recordedVideo);
      setRecordedVideo(null);
    } catch (error) {
      console.error('Error submitting reaction:', error);
      setErrorMessage('Failed to upload your reaction. Please try again.');
      setRecordingState('preview');
    }
  };
  
  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render the message content
  const renderMessageContent = () => {
    return (
      <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
        {/* Sender info (if available) */}
        {message.sender && (
          <div className="mb-4 flex items-center">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              {message.sender.picture ? (
                <img 
                  src={message.sender.picture} 
                  alt={message.sender.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-600 text-white">
                  {message.sender.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium text-neutral-900 dark:text-white">{message.sender.name}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{formattedDate}</p>
            </div>
          </div>
        )}
        
        {/* Message text */}
        <div className="prose prose-neutral dark:prose-invert">
          <p className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
            {message.content}
          </p>
        </div>
        
        {/* Message image (if available) */}
        {message.imageUrl && (
          <div className="mt-4 overflow-hidden rounded-lg">
            <img
              src={message.imageUrl}
              alt="Message attachment"
              className="w-full object-cover"
            />
          </div>
        )}
      </div>
    );
  };
  
  // Render the reaction section based on state
  const renderReactionSection = () => {
    switch (recordingState) {
      case 'idle':
        return (
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
            <h3 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
              Record Your Reaction
            </h3>
            <p className="mb-6 text-neutral-600 dark:text-neutral-300">
              The sender would love to see your reaction to this message! Would you like to record a short video response?
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <button
                onClick={handleStartRecording}
                className="flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Record Reaction
              </button>
              <button
                onClick={onSkipReaction}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Skip
              </button>
            </div>
          </div>
        );
        
      case 'requesting':
        return (
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
            <h3 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
              {countdown > 0 ? `Starting in ${countdown}...` : 'Getting ready...'}
            </h3>
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <video 
                ref={videoRef} 
                className="h-full w-full object-cover" 
                autoPlay 
                playsInline
                muted
              />
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop());
                  }
                  setRecordingState('idle');
                }}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Cancel
              </button>
            </div>
          </div>
        );
        
      case 'recording':
        return (
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Recording...
              </h3>
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                <span className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
                  {formatTime(recordingTime)}
                </span>
              </div>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <video 
                ref={videoRef} 
                className="h-full w-full object-cover" 
                autoPlay 
                playsInline
                muted
              />
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={stopRecording}
                className="flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
                Stop Recording
              </button>
            </div>
          </div>
        );
        
      case 'processing':
        return (
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
            <h3 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
              Processing...
            </h3>
            <div className="flex justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 border-t-primary-600 dark:border-neutral-600 dark:border-t-primary-500"></div>
            </div>
          </div>
        );
        
      case 'preview':
        return (
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
            <h3 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
              Preview Your Reaction
            </h3>
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              {recordedVideo && (
                <video 
                  src={recordedVideo} 
                  className="h-full w-full object-cover" 
                  controls
                  autoPlay
                />
              )}
            </div>
            {errorMessage && (
              <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
              </div>
            )}
            <div className="mt-4 flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <button
                onClick={handleSubmitRecording}
                className="flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Send Reaction
              </button>
              <button
                onClick={handleDiscardRecording}
                className="flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Discard & Re-record
              </button>
            </div>
          </div>
        );
        
      case 'uploading':
        return (
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
            <h3 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
              Uploading Reaction...
            </h3>
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div className="h-full animate-pulse bg-primary-600 dark:bg-primary-500" style={{ width: '100%' }}></div>
            </div>
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
              Please wait while we upload your reaction video
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full max-w-lg">
      {renderMessageContent()}
      {renderReactionSection()}
    </div>
  );
};

export default MessageViewer;