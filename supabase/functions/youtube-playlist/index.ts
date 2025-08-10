// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface YTItem {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
}

const YT_API = "https://www.googleapis.com/youtube/v3";

function extractPlaylistId(input: string): string | null {
  try {
    const url = new URL(input);
    const list = url.searchParams.get("list");
    if (list) return list;
  } catch {
    // not a URL; assume it's an ID
    if (input && input.length > 5) return input;
  }
  return null;
}

async function fetchPlaylistItems(playlistId: string, apiKey: string): Promise<YTItem[]> {
  let pageToken = "";
  const items: YTItem[] = [];
  for (let i = 0; i < 20; i++) { // up to 1000 items max
    const url = new URL(`${YT_API}/playlistItems`);
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const txt = await res.text();
      throw new Response(txt || `YouTube API error ${res.status}`, { status: res.status });
    }
    const data: any = await res.json();
    for (const it of data.items || []) {
      const vid = it.contentDetails?.videoId || it.snippet?.resourceId?.videoId;
      const title = it.snippet?.title ?? "Untitled";
      const description = it.snippet?.description ?? undefined;
      const thumb = it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url;
      if (vid) items.push({ id: vid, title, description, thumbnail_url: thumb });
    }
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return items;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST" }), { status: 405, headers: { "content-type": "application/json" } });
  }
  const apiKey = Deno.env.get("YOUTUBE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing YOUTUBE_API_KEY secret" }), { status: 500, headers: { "content-type": "application/json" } });
  }
  const body = await req.json().catch(() => ({}));
  const input = body?.playlist as string | undefined;
  if (!input) {
    return new Response(JSON.stringify({ error: "Missing 'playlist' in body" }), { status: 400, headers: { "content-type": "application/json" } });
  }
  const playlistId = extractPlaylistId(input);
  if (!playlistId) {
    return new Response(JSON.stringify({ error: "Invalid playlist URL or ID" }), { status: 400, headers: { "content-type": "application/json" } });
  }
  try {
    const items = await fetchPlaylistItems(playlistId, apiKey);
    return new Response(JSON.stringify({ items }), { headers: { "content-type": "application/json" } });
  } catch (err) {
    if (err instanceof Response) return err;
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "content-type": "application/json" } });
  }
});
