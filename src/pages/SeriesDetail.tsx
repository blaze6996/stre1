import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DailymotionPlayer from "@/components/player/DailymotionPlayer";
import YouTubePlayer from "@/components/player/YouTubePlayer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye } from "lucide-react";

const SeriesDetail = () => {
  const { id } = useParams();
  const [currentViews, setCurrentViews] = useState<number | null>(null);

  const { data: series, refetch } = useQuery({
    queryKey: ["series", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("id,title,description,dailymotion_playlist_id,youtube_playlist_id,cover_image_url,views_count,rating_sum,rating_count")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: episodes } = useQuery({
    queryKey: ["episodes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("id,title,dailymotion_video_id,youtube_video_id,season_number,episode_number")
        .eq("series_id", id)
        .order("season_number", { ascending: true, nullsFirst: true })
        .order("episode_number", { ascending: true, nullsFirst: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const [provider, setProvider] = useState<"dailymotion" | "youtube">("dailymotion");
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);

  // Set initial view count
  useEffect(() => {
    if (series?.views_count !== undefined) {
      setCurrentViews(series.views_count);
    }
  }, [series?.views_count]);

  const handleViewUpdate = (newViewCount: number) => {
    setCurrentViews(newViewCount);
    // Optionally refetch series data to keep everything in sync
    refetch();
  };

  useEffect(() => {
    if (series?.dailymotion_playlist_id) {
      setProvider("dailymotion");
      setCurrentId(undefined);
      return;
    }
    if (series?.youtube_playlist_id) {
      setProvider("youtube");
      setCurrentId(undefined);
      return;
    }
    // No playlist: pick first episode
    const first = episodes?.[0];
    if (first?.dailymotion_video_id) {
      setProvider("dailymotion");
      setCurrentId(first.dailymotion_video_id);
    } else if (first?.youtube_video_id) {
      setProvider("youtube");
      setCurrentId(first.youtube_video_id);
    }
  }, [series?.dailymotion_playlist_id, series?.youtube_playlist_id, episodes]);

  const ratingAvg = series && series.rating_count > 0 ? (series.rating_sum / series.rating_count).toFixed(1) : "0.0";
  const displayViews = currentViews !== null ? currentViews : (series?.views_count ?? 0);

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">{series?.title || "Series"}</h1>
        <div className="text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {displayViews.toLocaleString()} views
          </span>
          <span className="mx-2">•</span>
          <span>{ratingAvg} ★</span>
        </div>
        {series?.description && (
          <p className="mt-2 text-muted-foreground">{series.description}</p>
        )}
      </header>

      {provider === "dailymotion" ? (
        <DailymotionPlayer
          title={series?.title || "Series Player"}
          playlistId={series?.dailymotion_playlist_id || undefined}
          videoId={series?.dailymotion_playlist_id ? undefined : currentId}
          seriesId={id}
          onViewUpdate={handleViewUpdate}
        />
      ) : (
        <YouTubePlayer
          title={series?.title || "Series Player"}
          playlistId={series?.youtube_playlist_id || undefined}
          videoId={series?.youtube_playlist_id ? undefined : currentId}
          seriesId={id}
          onViewUpdate={handleViewUpdate}
        />
      )}

      {episodes && episodes.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">Episodes</h2>
          <ul className="grid gap-2">
            {episodes.map((ep) => (
              <li
                key={ep.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (ep.dailymotion_video_id) {
                    setProvider("dailymotion");
                    setCurrentId(ep.dailymotion_video_id);
                  } else if (ep.youtube_video_id) {
                    setProvider("youtube");
                    setCurrentId(ep.youtube_video_id);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (ep.dailymotion_video_id) {
                      setProvider("dailymotion");
                      setCurrentId(ep.dailymotion_video_id);
                    } else if (ep.youtube_video_id) {
                      setProvider("youtube");
                      setCurrentId(ep.youtube_video_id);
                    }
                  }
                }}
                className={`rounded-md border p-3 transition-colors hover:bg-accent ${currentId && ((provider === 'dailymotion' && currentId === ep.dailymotion_video_id) || (provider === 'youtube' && currentId === ep.youtube_video_id)) ? "border-primary" : ""}`}
              >
                <span className="font-medium">{ep.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
};

export default SeriesDetail;
