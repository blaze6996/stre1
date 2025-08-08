import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
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
          <p className="text-sm text-muted-foreground">Connect Supabase to load your live catalog.</p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Content will appear here after Supabase connection */}
        </div>
      </section>
    </main>
  );
};

export default Index;
