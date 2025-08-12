import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { useViewTracker } from "@/hooks/useViewTracker";
import { useState, useEffect } from "react";

interface DailymotionPlayerProps {
  videoId?: string;
  playlistId?: string;
  title?: string;
  className?: string;
  seriesId?: string;
  onViewUpdate?: (views: number) => void;
}

const DailymotionPlayer = ({ 
  videoId, 
  playlistId, 
  title = "Player", 
  className,
  seriesId,
  onViewUpdate 
}: DailymotionPlayerProps) => {
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
    const clean = input.split("?")[0];
    const short = clean.match(/dai\.ly\/([A-Za-z0-9]+)/i);
    if (short) return short[1];
    const full = clean.match(/dailymotion\.com\/video\/([A-Za-z0-9]+)/i);
    if (full) return full[1];
    return input;
  };
  const normalizePlaylistId = (input?: string) => {
    if (!input) return undefined;
    const clean = input.split("?")[0];
    const fromUrl = clean.match(/playlist\/([A-Za-z0-9]+)/i);
    if (fromUrl) return fromUrl[1];
    return input;
  };
  const effectiveVideoId = normalizeVideoId(videoId);
  const effectivePlaylistId = normalizePlaylistId(playlistId);
  const src = effectivePlaylistId
    ? `https://www.dailymotion.com/embed/playlist/${effectivePlaylistId}?queue-enable=false&sharing-enable=false&ui-start-screen-info=false&autoplay=0&mute=0&queue-autoplay-next=false`
    : `https://www.dailymotion.com/embed/video/${effectiveVideoId}?queue-enable=false&sharing-enable=false&ui-start-screen-info=false&autoplay=0&mute=0&queue-autoplay-next=false`;

  useEffect(() => {
    // Listen for player events via postMessage
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.dailymotion.com') return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        switch (data.event) {
          case 'apiready':
            setPlayerReady(true);
            break;
          case 'play':
            setIsPlaying(true);
            break;
          case 'pause':
          case 'ended':
            setIsPlaying(false);
            break;
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
          src={`${src}&api=postMessage`}
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

export default DailymotionPlayer;
