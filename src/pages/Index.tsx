import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: series, isLoading, error } = useQuery({
    queryKey: ["series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("id,title,description,cover_image_url,dailymotion_playlist_id,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

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
          {series?.map((s) => (
            <Link key={s.id} to={`/series/${s.id}`} className="group">
              <Card className="overflow-hidden">
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={s.cover_image_url || "/placeholder.svg"}
                    alt={`${s.title} cover image`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
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
          ))}
        </div>
      </section>
    </main>
  );
};

export default Index;

