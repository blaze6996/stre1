import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseViewTrackerProps {
  seriesId: string;
  isPlaying?: boolean;
  onViewIncrement?: (newViewCount: number) => void;
}

export const useViewTracker = ({ 
  seriesId, 
  isPlaying = true, 
  onViewIncrement 
}: UseViewTrackerProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTrackingRef = useRef(false);

  useEffect(() => {
    if (!seriesId || !isPlaying) {
      // Clear interval if not playing
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        isTrackingRef.current = false;
      }
      return;
    }

    // Start tracking if not already tracking
    if (!isTrackingRef.current) {
      isTrackingRef.current = true;
      
      // Increment view immediately when starting
      incrementView();
      
      // Then increment every 5 seconds
      intervalRef.current = setInterval(() => {
        incrementView();
      }, 5000); // 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        isTrackingRef.current = false;
      }
    };
  }, [seriesId, isPlaying]);

  const incrementView = async () => {
    try {
      const { data, error } = await supabase.rpc('increment_series_view', {
        p_series_id: seriesId
      });
      
      if (error) {
        console.error('Failed to increment view:', error);
        return;
      }
      
      if (onViewIncrement && typeof data === 'number') {
        onViewIncrement(data);
      }
    } catch (err) {
      console.error('Error incrementing view:', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};