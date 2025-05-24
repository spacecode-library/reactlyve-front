import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/common/Button';

interface ReactionDetails {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

const ReactionPage: React.FC = () => {
  const { reactionId } = useParams<{ reactionId: string }>();
  const navigate = useNavigate();
  const [reaction, setReaction] = useState<ReactionDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReaction = async () => {
      try {
        const response = await api.get(`/reactions/${reactionId}`);
        setReaction(response.data);
      } catch (error) {
        console.error('Error fetching reaction:', error);
      } finally {
        setLoading(false);
      }
    };

    if (reactionId) fetchReaction();
  }, [reactionId]);

  if (loading) {
    return <DashboardLayout><p className="p-4">Loading reaction...</p></DashboardLayout>;
  }

  if (!reaction) {
    return <DashboardLayout><p className="p-4">Reaction not found.</p></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Reaction Details</h1>

        <div className="mb-6">
          <video 
            src={reaction.videoUrl} 
            controls 
            className="w-full max-w-3xl rounded shadow"
          />
          <p className="mt-2 text-sm text-neutral-500">
            Duration: {reaction.duration}s | Uploaded: {new Date(reaction.createdAt).toLocaleString()}
          </p>
        </div>

        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>
    </DashboardLayout>
  );
};

export default ReactionPage;
