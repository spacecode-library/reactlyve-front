import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { messagesApi } from '../../services/api';
import { VALIDATION_ERRORS } from '../constants/errorMessages';
import { MessageFormData } from '../../types/message';
import { classNames } from '../../utils/classNames';
import Button from '../common/Button';
import ImageUploader from './ImageUploader';
import PasscodeCreator from './PasscodeCreator';
import LinkGenerator from './LinkGenerator';
import { showToast } from '../common/ErrorToast';

// Form validation schema
const messageSchema = z.object({
  message: z
    .string()
    .min(1, VALIDATION_ERRORS.REQUIRED_FIELD)
    .max(500, VALIDATION_ERRORS.MESSAGE_TOO_LONG),
  hasPasscode: z.boolean().default(false),
  passcode: z.string().optional(),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface MessageFormProps {
  className?: string;
}

const MessageForm: React.FC<MessageFormProps> = ({ className }) => {
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>('');
  
  // React Hook Form setup
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    mode: 'onChange',
    defaultValues: {
      message: '',
      hasPasscode: false,
      passcode: '',
    },
  });
  
  // Watch form values
  const hasPasscode = watch('hasPasscode');
  const passcode = watch('passcode');
  
  // Handle image upload
  const handleImageSelect = useCallback((file: File | null) => {
    setImage(file);
  }, []);
  
  // Handle passcode toggle
  const handleTogglePasscode = useCallback((enabled: boolean) => {
    setValue('hasPasscode', enabled, { shouldValidate: true });
    if (!enabled) {
      setValue('passcode', '', { shouldValidate: true });
    }
  }, [setValue]);
  
  // Handle passcode change
  const handlePasscodeChange = useCallback((passcode: string) => {
    setValue('passcode', passcode, { shouldValidate: true });
  }, [setValue]);
  
// Submit form
const onSubmit = useCallback(async (data: MessageFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Prepare form data for API
      const formData: MessageFormData = {
        message: data.message,
        image: image,
        hasPasscode: data.hasPasscode,
      };
      
      if (data.hasPasscode && data.passcode) {
        formData.passcode = data.passcode;
      }
      
      // Call API to create message
      const response = await messagesApi.create(formData);
      console.log('API response:', JSON.stringify(response, null, 2));
      console.log('Message created successfully, full response:', response);
      console.log('Response data structure:', Object.keys(response.data));
      
      // Check if the response contains a URL that could be the shareable link
      // Sometimes the backend might name it differently
      const possibleLinkKeys = ['shareableLink', 'link', 'url', 'shareLink', 'shareUrl'];
      let linkFound = false;
      
      for (const key of possibleLinkKeys) {
        if (response.data[key]) {
          console.log(`Found shareable link with key "${key}":`, response.data[key]);
          setShareableLink(response.data[key]);
          linkFound = true;
          break;
        }
      }
      
      // Show success message
      showToast({
        message: linkFound 
          ? 'Message created successfully!' 
          : 'Message created but unable to generate link. Please check your dashboard.',
        type: linkFound ? 'success' : 'warning',
      });
    } catch (error) {
      console.error('Error creating message:', error);
      showToast({
        message: 'Failed to create message. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [image]);
  
  // Calculate remaining character count
  const messageValue = watch('message') || '';
  const remainingChars = 500 - messageValue.length;
  
  // If we have a shareable link, show the link generator instead of the form
  if (shareableLink) {
    return (
      <LinkGenerator
        shareableLink={shareableLink}
        hasPasscode={hasPasscode}
        passcode={passcode}
        className={className}
      />
    );
  }
  
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={classNames('space-y-6', className || '')}
    >
      {/* Message input */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Your Surprise Message
        </label>
        <div className="mt-1">
          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                id="message"
                rows={5}
                placeholder="Write your surprise message here..."
                className={classNames(
                  'block w-full rounded-md border border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm',
                  errors.message ? 'border-red-300 dark:border-red-700' : ''
                )}
              />
            )}
          />
          {errors.message ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.message.message}
            </p>
          ) : (
            <p
              className={classNames(
                'mt-1 text-right text-sm',
                remainingChars <= 50
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-neutral-500 dark:text-neutral-400'
              )}
            >
              {remainingChars} characters remaining
            </p>
          )}
        </div>
      </div>
      
      {/* Image uploader */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Add an Image (Optional)
        </label>
        <div className="mt-1">
          <ImageUploader
            onImageSelect={handleImageSelect}
            onError={(error) => showToast({ message: error, type: 'error' })}
          />
        </div>
      </div>
      
      {/* Passcode creator */}
      <div>
        <PasscodeCreator
          onTogglePasscode={handleTogglePasscode}
          onPasscodeChange={handlePasscodeChange}
          enabled={hasPasscode}
        />
      </div>
      
      {/* Submit button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? 'Creating Message...' : 'Create Message'}
        </Button>
      </div>
    </form>
  );
};

export default MessageForm;