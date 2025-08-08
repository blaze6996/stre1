import { useParams } from "react-router-dom";
import DailymotionPlayer from "@/components/player/DailymotionPlayer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SeriesDetail = () => {
  const { id } = useParams();

  const { data: series } = useQuery({
    queryKey: ["series", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("id,title,description,dailymotion_playlist_id,cover_image_url")
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
        .select("id,title,dailymotion_video_id,season_number,episode_number")
        .eq("series_id", id)
        .order("season_number", { ascending: true, nullsFirst: true })
        .order("episode_number", { ascending: true, nullsFirst: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const firstVideoId = series?.dailymotion_playlist_id ? undefined : episodes?.[0]?.dailymotion_video_id;

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">{series?.title || "Series"}</h1>
        {series?.description && (
          <p className="text-muted-foreground">{series.description}</p>
        )}
      </header>

      <DailymotionPlayer
        title={series?.title || "Series Player"}
        playlistId={series?.dailymotion_playlist_id || undefined}
        videoId={firstVideoId}
      />

      {episodes && episodes.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">Episodes</h2>
          <ul className="grid gap-2">
            {episodes.map((ep) => (
              <li key={ep.id} className="rounded-md border p-3">
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
