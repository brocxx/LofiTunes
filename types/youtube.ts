export interface YouTubePlaylist {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
    channelTitle: string;
  };
  contentDetails?: {
    itemCount: number;
  };
}

export interface YouTubePlaylistItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    videoOwnerChannelTitle?: string;
    resourceId: {
      videoId: string;
    };
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
    position: number;
  };
}

export interface Song {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  playlistItemId: string;
}

export interface Playlist {
  id: string;
  title: string;
  thumbnail: string;
  itemCount: number;
  songs: Song[];
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: YTPlayerConfig
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
        CUED: number;
        UNSTARTED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayerConfig {
  height?: string | number;
  width?: string | number;
  videoId?: string;
  playerVars?: {
    autoplay?: number;
    controls?: number;
    modestbranding?: number;
    rel?: number;
    showinfo?: number;
    playsinline?: number;
    origin?: string;
  };
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerStateEvent) => void;
    onError?: (event: YTPlayerErrorEvent) => void;
  };
}

interface YTPlayerEvent {
  target: YTPlayer;
}

interface YTPlayerStateEvent {
  target: YTPlayer;
  data: number;
}

interface YTPlayerErrorEvent {
  target: YTPlayer;
  data: number;
}

export interface YTPlayer {
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}
