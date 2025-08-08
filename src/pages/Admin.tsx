import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_CODE = "Shivam2008";

const Admin = () => {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [authorized, setAuthorized] = useState(false);

  // Series form state
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cover, setCover] = useState("");
  const [playlist, setPlaylist] = useState("");

  // Episode form state
  const [epSeriesId, setEpSeriesId] = useState("");
  const [epTitle, setEpTitle] = useState("");
  const [videoId, setVideoId] = useState("");

  // Delete form state
  const [delSeriesId, setDelSeriesId] = useState("");
  const [delEpisodeId, setDelEpisodeId] = useState("");

  const extractDailymotionId = (input: string) => {
    if (!input) return input;
    const clean = input.trim().split("?")[0];
    const short = clean.match(/dai\.ly\/([A-Za-z0-9]+)/i);
    if (short) return short[1];
    const full = clean.match(/dailymotion\.com\/video\/([A-Za-z0-9]+)/i);
    if (full) return full[1];
    return clean.replace(/^https?:\/\/.+\//, "").split("_")[0];
  };

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === ADMIN_CODE) {
      setAuthorized(true);
      toast({ title: "Access granted", description: "Welcome to the admin panel" });
    } else {
      toast({ title: "Invalid code", description: "Please check the code and try again", variant: "destructive" });
    }
  };

  const handleSaveSeries = async () => {
    try {
      const { data, error } = await supabase.rpc("admin_create_series", {
        admin_code: code,
        title,
        description: desc || null,
        cover_image_url: cover || null,
        dailymotion_playlist_id: playlist || null,
        slug: null,
        is_published: false,
      });
      if (error) throw error;
      toast({ title: "Series saved", description: `Created: ${data?.title}` });
      setTitle("");
      setDesc("");
      setCover("");
      setPlaylist("");
    } catch (err: any) {
      toast({ title: "Failed to save series", description: err.message || String(err), variant: "destructive" });
    }
  };

  const handleSaveEpisode = async () => {
    if (!epSeriesId || !epTitle || !videoId) {
      toast({ title: "Missing fields", description: "Please fill Series ID, Episode Title and Video ID" });
      return;
    }
    try {
      const normalizedVideoId = extractDailymotionId(videoId);
      const { data, error } = await supabase.rpc("admin_create_episode", {
        admin_code: code,
        series_id: epSeriesId,
        title: epTitle,
        dailymotion_video_id: normalizedVideoId,
        description: null,
        season_number: null,
        episode_number: null,
        published_at: null,
      });
      if (error) throw error;
      toast({ title: "Episode saved", description: `Created: ${data?.title}` });
      setEpSeriesId("");
      setEpTitle("");
      setVideoId("");
    } catch (err: any) {
      toast({ title: "Failed to save episode", description: err.message || String(err), variant: "destructive" });
    }
  };

  const handleDeleteSeries = async () => {
    if (!delSeriesId) {
      toast({ title: "Series ID required", description: "Enter the Series UUID to delete" });
      return;
    }
    try {
      const { error } = await supabase.rpc("admin_delete_series", {
        admin_code: code,
        p_series_id: delSeriesId,
      });
      if (error) throw error;
      toast({ title: "Series deleted", description: delSeriesId });
      setDelSeriesId("");
    } catch (err: any) {
      toast({ title: "Failed to delete series", description: err.message || String(err), variant: "destructive" });
    }
  };

  const handleDeleteEpisode = async () => {
    if (!delEpisodeId) {
      toast({ title: "Episode ID required", description: "Enter the Episode UUID to delete" });
      return;
    }
    try {
      const { error } = await supabase.rpc("admin_delete_episode", {
        admin_code: code,
        p_episode_id: delEpisodeId,
      });
      if (error) throw error;
      toast({ title: "Episode deleted", description: delEpisodeId });
      setDelEpisodeId("");
    } catch (err: any) {
      toast({ title: "Failed to delete episode", description: err.message || String(err), variant: "destructive" });
    }
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
                <Input id="title" placeholder="e.g. Demon Slayer" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Input id="desc" placeholder="Short synopsis" value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cover">Cover Image URL</Label>
                <Input id="cover" placeholder="https://...jpg" value={cover} onChange={(e) => setCover(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="playlist">Dailymotion Playlist ID (optional)</Label>
                <Input id="playlist" placeholder="x123abc" value={playlist} onChange={(e) => setPlaylist(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveSeries}>Save Series</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Episode to Series</CardTitle>
            <CardDescription>Attach a Dailymotion video to a series as an episode (paste ID or public URL)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="series">Series ID</Label>
                <Input id="series" placeholder="Paste the Series UUID" value={epSeriesId} onChange={(e) => setEpSeriesId(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ep-title">Episode Title</Label>
                <Input id="ep-title" placeholder="S01E01 - Episode name" value={epTitle} onChange={(e) => setEpTitle(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="videoId">Dailymotion Video ID or URL</Label>
                <Input id="videoId" placeholder="x7xyzab or https://www.dailymotion.com/video/x7xyzab" value={videoId} onChange={(e) => setVideoId(e.target.value)} />
              </div>
              <Button onClick={handleSaveEpisode}>Upload/Link Episode</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delete Series or Episode</CardTitle>
            <CardDescription>Danger zone: this permanently removes data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="del-series">Series ID</Label>
                <Input id="del-series" placeholder="Series UUID" value={delSeriesId} onChange={(e) => setDelSeriesId(e.target.value)} />
                <Button variant="destructive" onClick={handleDeleteSeries}>Delete Series (and its Episodes)</Button>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="del-episode">Episode ID</Label>
                <Input id="del-episode" placeholder="Episode UUID" value={delEpisodeId} onChange={(e) => setDelEpisodeId(e.target.value)} />
                <Button variant="destructive" onClick={handleDeleteEpisode}>Delete Episode</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Admin;
