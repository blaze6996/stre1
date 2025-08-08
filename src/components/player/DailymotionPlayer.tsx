import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface DailymotionPlayerProps {
  videoId?: string;
  playlistId?: string;
  title?: string;
  className?: string;
}

const DailymotionPlayer = ({ videoId, playlistId, title = "Player", className }: DailymotionPlayerProps) => {
  const normalizeVideoId = (input?: string) => {
    if (!input) return undefined;
    const clean = input.split("?")[0];
    const short = clean.match(/dai\.ly\/([A-Za-z0-9]+)/i);
    if (short) return short[1];
    const full = clean.match(/dailymotion\.com\/video\/([A-Za-z0-9]+)/i);
    if (full) return full[1];
    return input;
  };
  const effectiveVideoId = normalizeVideoId(videoId);
  const src = playlistId
    ? `https://www.dailymotion.com/embed/playlist/${playlistId}?queue-enable=false&sharing-enable=false&ui-start-screen-info=false&autoplay=0&mute=0&queue-autoplay-next=false`
    : `https://www.dailymotion.com/embed/video/${effectiveVideoId}?queue-enable=false&sharing-enable=false&ui-start-screen-info=false&autoplay=0&mute=0&queue-autoplay-next=false`;

  return (
    <div className={cn("w-full", className)}>
      <AspectRatio ratio={16 / 9}>
        <iframe
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

export default DailymotionPlayer;
