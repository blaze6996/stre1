import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { useViewTracker } from "@/hooks/useViewTracker";
import { useState, useEffect } from "react";

interface YouTubePlayerProps {
  videoId?: string;
  playlistId?: string;
  title?: string;
  className?: string;
  seriesId?: string;
  onViewUpdate?: (views: number) => void;
}

const YouTubePlayer = ({ 
  videoId, 
  playlistId, 
  title = "YouTube Player", 
  className,
  seriesId,
  onViewUpdate 
}: YouTubePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  // Track views every 5 seconds when playing
  useViewTracker({
    seriesId: seriesId || '',
    isPlaying: isPlaying && playerReady && !!seriesId,
    onViewIncrement: onViewUpdate
  });

  const normalizeVideoId = (input?: string) => {
    if (!input) return undefined;
    const url = new URL(input, window.location.origin);
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
      const embed = url.pathname.match(/\/embed\/([A-Za-z0-9_-]{6,})/i);
      if (embed) return embed[1];
    }
    if (url.hostname.includes("youtu.be")) {
      const short = url.pathname.replace(/^\//, "");
      if (short) return short;
    }
    return input;
  };

  const normalizePlaylistId = (input?: string) => {
    if (!input) return undefined;
    try {
      const url = new URL(input, window.location.origin);
      if (url.hostname.includes("youtube.com")) {
        const list = url.searchParams.get("list");
        if (list) return list;
      }
    } catch {}
    return input;
  };

  const effectiveVideoId = normalizeVideoId(videoId);
  const effectivePlaylistId = normalizePlaylistId(playlistId);
  const src = effectivePlaylistId
    ? `https://www.youtube.com/embed/videoseries?list=${effectivePlaylistId}`
    : `https://www.youtube.com/embed/${effectiveVideoId}?enablejsapi=1&origin=${window.location.origin}`;

  useEffect(() => {
    // Listen for YouTube player events via postMessage
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.event === 'video-progress') {
          // YouTube sends progress events, we can use this to detect playing
          setIsPlaying(true);
          setPlayerReady(true);
        } else if (data.event === 'onStateChange') {
          // YouTube player state: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
          switch (data.info) {
            case 1: // playing
              setIsPlaying(true);
              setPlayerReady(true);
              break;
            case 2: // paused
            case 0: // ended
              setIsPlaying(false);
              break;
          }
        }
      } catch (err) {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className={cn("mx-auto w-full max-w-[420px] sm:max-w-[520px] md:max-w-[720px] lg:max-w-[960px]", className)}>
      <AspectRatio ratio={16 / 9}>
        <iframe
          loading="lazy"
          src={src}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
          className="h-full w-full rounded-lg border"
        />
      </AspectRatio>
    </div>
  );
};

export default YouTubePlayer;
