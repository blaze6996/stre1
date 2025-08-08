import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Star } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const queryClient = useQueryClient();

  const { data: series, isLoading, error } = useQuery({
    queryKey: ["series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("id,title,description,cover_image_url,dailymotion_playlist_id,created_at,views_count,rating_sum,rating_count")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("series-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "series" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["series"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <main>
      <section className="bg-hero">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="mx-auto mb-4 max-w-3xl text-4xl font-bold md:text-5xl">
            Stream the best Anime, Donghua, Movies & Cartoons
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Production-ready streaming with Dailymotion hosting. Organize by series and playlists, add episodes seamlessly.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild variant="hero">
              <Link to="/">Start Watching</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/admin">Open Admin</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold">Latest Series</h2>
          {error ? (
            <p className="text-sm text-destructive">Failed to load series</p>
          ) : (
            <p className="text-sm text-muted-foreground">{isLoading ? "Loading..." : `${series.length} series`}</p>
          )}
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {series?.map((s) => {
            const avg = s.rating_count > 0 ? (s.rating_sum / s.rating_count).toFixed(1) : "0.0";
            return (
              <Link key={s.id} to={`/series/${s.id}`} className="group">
                <Card className="overflow-hidden">
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <img
                      src={s.cover_image_url || "/placeholder.svg"}
                      alt={`${s.title} cover image`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs text-foreground backdrop-blur">
                      <Eye className="mr-1 h-3 w-3" /> {s.views_count ?? 0}
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs text-foreground backdrop-blur">
                      <Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" /> {avg}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{s.title}</CardTitle>
                  </CardHeader>
                  {s.description && (
                    <CardContent>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Index;


