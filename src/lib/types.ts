export type Profile = {
  id: string;
  slug: string;
  artist_name: string;
  bio: string | null;
  location: string | null;
  avatar_path: string | null;
  background_path: string | null;
  is_signed: boolean;
  created_at: string;
  updated_at: string;
};

export type ReleaseType = "album" | "ep" | "single";

export type Album = {
  id: string;
  artist_id: string;
  title: string;
  release_type: ReleaseType;
  release_date: string | null;
  description: string | null;
  art_path: string | null;
  created_at: string;
};

export type Track = {
  id: string;
  album_id: string;
  artist_id: string;
  title: string;
  track_number: number;
  duration_seconds: number | null;
  audio_path: string;
};

export type AlbumWithTracks = Album & { tracks: Track[] };

export type VideoKind = "music" | "live";

export type Video = {
  id: string;
  artist_id: string;
  kind: VideoKind;
  title: string;
  url: string;
  provider: "youtube" | "vimeo";
  provider_id: string;
  video_date: string | null;
  venue: string | null;
};

export type TourDate = {
  id: string;
  artist_id: string;
  event_date: string;
  venue: string;
  city: string;
  region: string | null;
  country: string | null;
  ticket_url: string | null;
  notes: string | null;
};

export type PressKind = "interview" | "review" | "feature" | "radio" | "podcast" | "tv" | "other";

export type PressDate = {
  id: string;
  artist_id: string;
  press_date: string;
  kind: PressKind;
  outlet: string;
  title: string | null;
  url: string | null;
  notes: string | null;
};

export type ActionState = { ok?: boolean; error?: string; message?: string };

export type Bucket = "avatars" | "backgrounds" | "album-art" | "audio";

export type IndustryRole =
  | "music_supervisor"
  | "sound_designer"
  | "venue"
  | "promoter"
  | "booking_agent"
  | "radio"
  | "podcast"
  | "press"
  | "other";

export type IndustryProfile = {
  id: string;
  name: string;
  title: string | null;
  organization: string | null;
  role: IndustryRole;
  avatar_path: string | null;
};

export type LicenseRequest = {
  id: string;
  created_at: string;
  artist_id: string;
  track_id: string | null;
  track_title: string;
  usage: string;
  project_title: string;
  description: string | null;
  territory: string;
  term: string;
  budget: string | null;
  needed_by: string | null;
  status: "requested" | "quoted" | "licensed" | "declined" | "withdrawn";
};

export type BookingRequest = {
  id: string;
  created_at: string;
  artist_id: string;
  kind: string;
  start_date: string;
  end_date: string;
  venue: string | null;
  city: string | null;
  details: string | null;
  budget: string | null;
  status: "requested" | "confirmed" | "declined" | "withdrawn";
};
