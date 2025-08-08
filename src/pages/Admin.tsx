import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ADMIN_CODE = "Shivam2008";

const Admin = () => {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === ADMIN_CODE) {
      setAuthorized(true);
      toast({ title: "Access granted", description: "Welcome to the admin panel" });
    } else {
      toast({ title: "Invalid code", description: "Please check the code and try again", variant: "destructive" });
    }
  };

  const requireSupabase = () => {
    toast({
      title: "Connect Supabase",
      description: "Please connect Supabase to enable saving and syncing with Dailymotion.",
    });
  };

  if (!authorized) {
    return (
      <main className="container mx-auto max-w-xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter the secret admin code to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthorize} className="flex gap-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="code">Admin Code</Label>
                <Input id="code" type="password" value={code} onChange={(e) => setCode(e.target.value)} required />
              </div>
              <div className="self-end">
                <Button type="submit">Enter</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <section className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Create and manage series cards, playlists, and episodes. Dailymotion will be used for hosting.</p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Series Card</CardTitle>
            <CardDescription>Define a series with cover image and optional Dailymotion playlist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g. Demon Slayer" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Input id="desc" placeholder="Short synopsis" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cover">Cover Image URL</Label>
                <Input id="cover" placeholder="https://...jpg" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="playlist">Dailymotion Playlist ID (optional)</Label>
                <Input id="playlist" placeholder="x123abc" />
              </div>
              <div className="flex gap-2">
                <Button onClick={requireSupabase}>Save Series</Button>
                <Button variant="secondary" onClick={requireSupabase}>Import Playlist</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Episode to Series</CardTitle>
            <CardDescription>Attach a Dailymotion video to a series as an episode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="series">Series</Label>
                <Input id="series" placeholder="Select series (enabled after Supabase)" disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ep-title">Episode Title</Label>
                <Input id="ep-title" placeholder="S01E01 - Episode name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="videoId">Dailymotion Video ID</Label>
                <Input id="videoId" placeholder="x7xyzab" />
              </div>
              <Button onClick={requireSupabase}>Upload/Link Episode</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Admin;
