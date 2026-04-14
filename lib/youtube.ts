import { YouTubePlaylist, YouTubePlaylistItem, Playlist, Song } from '@/types/youtube';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function fetchUserPlaylists(accessToken: string): Promise<Playlist[]> {
  const playlists: Playlist[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      mine: 'true',
      maxResults: '50',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const response = await fetch(`${YOUTUBE_API_BASE}/playlists?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('TOKEN_EXPIRED');
      }
      throw new Error(`Failed to fetch playlists: ${response.statusText}`);
    }

    const data = await response.json();
    const items: YouTubePlaylist[] = data.items || [];

    for (const item of items) {
      playlists.push({
        id: item.id,
        title: item.snippet.title,
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default?.url ||
          '',
        itemCount: item.contentDetails?.itemCount || 0,
        songs: [],
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return playlists;
}

export async function fetchPlaylistSongs(
  playlistId: string,
  accessToken: string
): Promise<Song[]> {
  const songs: Song[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId,
      maxResults: '50',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const response = await fetch(`${YOUTUBE_API_BASE}/playlistItems?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('TOKEN_EXPIRED');
      }
      throw new Error(`Failed to fetch playlist items: ${response.statusText}`);
    }

    const data = await response.json();
    const items: YouTubePlaylistItem[] = data.items || [];

    for (const item of items) {
      const videoId = item.snippet.resourceId.videoId;
      // Skip deleted/private videos
      if (!videoId || item.snippet.title === 'Deleted video' || item.snippet.title === 'Private video') {
        continue;
      }

      songs.push({
        videoId,
        title: item.snippet.title,
        artist:
          item.snippet.videoOwnerChannelTitle ||
          item.snippet.channelTitle ||
          'Unknown Artist',
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default?.url ||
          '',
        playlistItemId: item.id,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return songs;
}
