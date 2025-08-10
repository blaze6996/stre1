import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const ADMIN_CODE = "Shivam2008";

const Admin = () => {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [authorized, setAuthorized] = useState(false);

  // Series form state
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cover, setCover] = useState("");
  const [playlist, setPlaylist] = useState(""); // Dailymotion playlist
  const [ytPlaylist, setYtPlaylist] = useState(""); // YouTube playlist
  const [category, setCategory] = useState<"donghua" | "anime" | "movie" | "cartoon" | "">("");
  // Episode form state
  const [epSeriesId, setEpSeriesId] = useState("");
  const [epTitle, setEpTitle] = useState("");
  const [videoId, setVideoId] = useState("");
  const [episodeProvider, setEpisodeProvider] = useState<"dailymotion" | "youtube">("dailymotion");

  // Playlist import state (Dailymotion)
  const [plUrl, setPlUrl] = useState("");
  const [plVideos, setPlVideos] = useState<Array<{ id: string; title: string; description?: string; thumbnail_url?: string }>>([]);
  const [plSelected, setPlSelected] = useState<Record<string, boolean>>({});
  const [isFetchingPlaylist, setIsFetchingPlaylist] = useState(false);
  const [isImportingEpisodes, setIsImportingEpisodes] = useState(false);

  // Playlist import state (YouTube)
  const [ytPlUrl, setYtPlUrl] = useState("");
  const [ytPlVideos, setYtPlVideos] = useState<Array<{ id: string; title: string; description?: string; thumbnail_url?: string }>>([]);
  const [ytSelected, setYtSelected] = useState<Record<string, boolean>>({});
  const [isFetchingYt, setIsFetchingYt] = useState(false);
  const [isImportingYt, setIsImportingYt] = useState(false);

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

  const extractYouTubeId = (input: string) => {
    if (!input) return input;
    try {
      const url = new URL(input);
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
    } catch {}
    return input.trim();
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
    if (!title) {
      toast({ title: "Title required", description: "Please enter a title" });
      return;
    }
    if (!category) {
      toast({ title: "Category required", description: "Please select a category" });
      return;
    }
    try {
      const { data, error } = await (supabase as any).rpc("admin_create_series", {
        admin_code: code,
        title,
        description: desc || null,
        cover_image_url: cover || null,
        dailymotion_playlist_id: playlist || null,
        slug: null,
        is_published: false,
        category,
        youtube_playlist_id: ytPlaylist || null,
      });
      if (error) throw error;
      toast({ title: "Series saved", description: `Created: ${data?.title}` });
      setTitle("");
      setDesc("");
      setCover("");
      setPlaylist("");
      setCategory("");
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
      const dmId = episodeProvider === "dailymotion" ? extractDailymotionId(videoId) : null;
      const ytId = episodeProvider === "youtube" ? extractYouTubeId(videoId) : null;
      const { data, error } = await (supabase as any).rpc("admin_create_episode", {
        admin_code: code,
        series_id: epSeriesId,
        title: epTitle,
        dailymotion_video_id: dmId,
        youtube_video_id: ytId,
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

  const extractDailymotionPlaylistId = (input: string) => {
    if (!input) return input;
    const clean = input.trim();
    const match = clean.match(/playlist\/([A-Za-z0-9]+)/i);
    if (match) return match[1];
    return clean;
  };

  const handleFetchPlaylist = async () => {
    if (!plUrl) {
      toast({ title: "Playlist URL required", description: "Paste a public Dailymotion playlist link or ID" });
      return;
    }
    setIsFetchingPlaylist(true);
    try {
      const pid = extractDailymotionPlaylistId(plUrl);
      let page = 1;
      const limit = 100;
      let all: any[] = [];
      for (let i = 0; i < 10; i++) {
        const res = await fetch(`https://api.dailymotion.com/playlist/${pid}/videos?fields=id,title,description,thumbnail_url&page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error(`Dailymotion API error: ${res.status}`);
        const data = await res.json();
        const list = (data.list ?? data.result ?? data.videos ?? []) as any[];
        all = all.concat(list);
        if (!data.has_more) break;
        page += 1;
      }
      setPlVideos(all.map((v: any) => ({ id: v.id, title: v.title, description: v.description, thumbnail_url: v.thumbnail_url })));
      setPlSelected({});
      toast({ title: "Playlist fetched", description: `Found ${all.length} videos` });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to fetch playlist", description: err.message || String(err), variant: "destructive" });
    } finally {
      setIsFetchingPlaylist(false);
    }
  };

  const handleImportSelected = async () => {
    if (!epSeriesId) {
      toast({ title: "Series ID required", description: "Enter the Series ID to import into", variant: "destructive" });
      return;
    }
    const selectedIds = plVideos.filter(v => plSelected[v.id]).map(v => v.id);
    if (selectedIds.length === 0) {
      toast({ title: "No videos selected", description: "Select at least one video to import" });
      return;
    }
    setIsImportingEpisodes(true);
    try {
      const results = await Promise.allSettled(
        selectedIds.map((vidId, idx) =>
          supabase.rpc("admin_create_episode", {
            admin_code: code,
            series_id: epSeriesId,
            title: plVideos.find(v => v.id === vidId)?.title || `Episode ${idx + 1}`,
            dailymotion_video_id: vidId,
            description: null,
            season_number: null,
            episode_number: null,
            published_at: null,
          })
        )
      );
      const success = results.filter((r) => r.status === "fulfilled").length;
      const failures = results.length - success;
      toast({ title: "Import complete", description: `${success} added, ${failures} failed` });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message || String(err), variant: "destructive" });
    } finally {
      setIsImportingEpisodes(false);
    }
  };

  // YouTube helpers
  const extractYouTubePlaylistId = (input: string) => {
    if (!input) return input;
    try {
      const url = new URL(input);
      const list = url.searchParams.get("list");
      if (list) return list;
    } catch {}
    return input.trim();
  };

  const handleFetchYouTubePlaylist = async () => {
    if (!ytPlUrl) {
      toast({ title: "Playlist URL required", description: "Paste a public YouTube playlist link or ID" });
      return;
    }
    setIsFetchingYt(true);
    try {
      const { data, error } = await (supabase as any).functions.invoke("youtube-playlist", {
        body: { playlist: ytPlUrl },
      });
      if (error) throw error;
      const items = (data?.items || []) as Array<{ id: string; title: string; description?: string; thumbnail_url?: string }>;
      setYtPlVideos(items);
      setYtSelected({});
      toast({ title: "Playlist fetched", description: `Found ${items.length} videos` });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to fetch playlist", description: err.message || String(err), variant: "destructive" });
    } finally {
      setIsFetchingYt(false);
    }
  };

  const handleImportSelectedYt = async () => {
    if (!epSeriesId) {
      toast({ title: "Series ID required", description: "Enter the Series ID to import into", variant: "destructive" });
      return;
    }
    const selectedIds = ytPlVideos.filter(v => ytSelected[v.id]).map(v => v.id);
    if (selectedIds.length === 0) {
      toast({ title: "No videos selected", description: "Select at least one video to import" });
      return;
    }
    setIsImportingYt(true);
    try {
      const results = await Promise.allSettled(
        selectedIds.map((vidId, idx) =>
          (supabase as any).rpc("admin_create_episode", {
            admin_code: code,
            series_id: epSeriesId,
            title: ytPlVideos.find(v => v.id === vidId)?.title || `Episode ${idx + 1}`,
            dailymotion_video_id: null,
            youtube_video_id: vidId,
            description: null,
            season_number: null,
            episode_number: null,
            published_at: null,
          })
        )
      );
      const success = results.filter((r) => r.status === "fulfilled").length;
      const failures = results.length - success;
      toast({ title: "Import complete", description: `${success} added, ${failures} failed` });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message || String(err), variant: "destructive" });
    } finally {
      setIsImportingYt(false);
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
        <p className="text-muted-foreground">Create and manage series cards, playlists, and episodes. Dailymotion & YouTube are supported.</p>
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
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donghua">Donghua</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="movie">Movie</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                  </SelectContent>
                </Select>
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
            <CardTitle>Import Episodes from Dailymotion Playlist</CardTitle>
            <CardDescription>Paste a public playlist link or ID, fetch videos, select and import into the series.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pl-series">Series ID</Label>
                <Input id="pl-series" placeholder="Series UUID" value={epSeriesId} onChange={(e) => setEpSeriesId(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pl-url">Playlist URL or ID</Label>
                <Input id="pl-url" placeholder="https://www.dailymotion.com/playlist/x85adw" value={plUrl} onChange={(e) => setPlUrl(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleFetchPlaylist} disabled={isFetchingPlaylist}>{isFetchingPlaylist ? "Fetching..." : "Fetch Videos"}</Button>
                {plVideos.length > 0 && (
                  <Button variant="secondary" onClick={handleImportSelected} disabled={isImportingEpisodes}>
                    {isImportingEpisodes ? "Importing..." : `Import Selected (${Object.values(plSelected).filter(Boolean).length})`}
                  </Button>
                )}
              </div>
              {plVideos.length > 0 && (
                <div className="rounded-md border">
                  <div className="flex items-center gap-2 p-3 border-b">
                    <Checkbox id="select-all" checked={plVideos.length > 0 && plVideos.every(v => plSelected[v.id])} onCheckedChange={(c) => {
                      const checked = Boolean(c);
                      const next: Record<string, boolean> = {};
                      plVideos.forEach(v => next[v.id] = checked);
                      setPlSelected(next);
                    }} />
                    <Label htmlFor="select-all">Select all ({plVideos.length})</Label>
                  </div>
                  <div className="max-h-80 overflow-auto divide-y">
                    {plVideos.map(v => (
                      <div key={v.id} className="flex items-center gap-3 p-3">
                        <Checkbox id={`v-${v.id}`} checked={!!plSelected[v.id]} onCheckedChange={(c) => {
                          setPlSelected(prev => ({ ...prev, [v.id]: Boolean(c) }));
                        }} />
                        <Label htmlFor={`v-${v.id}`} className="flex-1">
                          <span className="font-medium">{v.title}</span>
                          <span className="ml-2 text-xs text-muted-foreground">({v.id})</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
