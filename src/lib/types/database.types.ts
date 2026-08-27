export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "member" | "moderator" | "admin" | "superadmin";
export type UserGender = "male" | "female";
export type PostStatus = "draft" | "scheduled" | "published";
export type EventStatus = "draft" | "published" | "cancelled";
export type RSVPStatus = "going" | "waitlist" | "cancelled";
export type ReactionType = "like";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  skills: string[];
  angkatan?: string | null;
  kota?: string | null;
  camp_history?: any[] | null;
  services_history?: any[] | null;
  interests: string[];
  role: UserRole;
  gender: UserGender | null;
  completed_modules: string[];
  created_at: string;
  updated_at: string;
}

export interface DevotionCategory {
  id: string;
  name: string;
  name_id?: string | null;
  created_at: string;
}

export interface DevotionPlan {
  id: string;
  category_id: string;
  title: string;
  title_id?: string | null;
  subtitle?: string | null;
  subtitle_id?: string | null;
  summary?: string | null;
  summary_id?: string | null;
  cover_image_url: string | null;
  duration_days: number;
  description: string | null;
  description_id?: string | null;
  created_at: string;
  categories?: DevotionCategory;
}

export interface DevotionPlanDay {
  id: string;
  plan_id: string;
  day_number: number;
  devotional_title: string | null;
  devotional_title_id?: string | null;
  subtitle?: string | null;
  subtitle_id?: string | null;
  summary?: string | null;
  summary_id?: string | null;
  devotional_content: string | null;
  devotional_content_id?: string | null;
  reflection?: string | null;
  reflection_id?: string | null;
  prayer?: string | null;
  prayer_id?: string | null;
  created_at: string;
  verses?: DevotionDayVerse[];
}

export interface DevotionDayVerse {
  id: string;
  day_id: string;
  verse_reference: string;
  translation: string;
  order_index: number;
  created_at: string;
}

export interface UserDevotionProgress {
  id: string;
  user_id: string;
  plan_id: string;
  current_day: number;
  completed_days: number[];
  last_completed_at: string | null;
  is_finished: boolean;
  started_at: string;
  plans?: DevotionPlan;
}

export interface DailyDevotion {
  id: string;
  publish_date: string;
  verse_reference: string;
  verse_text: string;
  prayer_title: string;
  prayer_text: string;
  created_at: string;
  updated_at: string;
}

export type PrayerCategory =
  | 'rosario'
  | 'bunda_maria'
  | 'hati_kudus_yesus'
  | 'roh_kudus'
  | 'malaikat'
  | 'jalan_salib'
  | 'para_kudus'
  | 'keluarga'
  | 'doa_harian'
  | 'tobat_syukur';

export const PRAYER_CATEGORIES: { value: PrayerCategory; label_id: string; label_en: string }[] = [
  { value: 'doa_harian', label_id: 'Doa Harian', label_en: 'Daily Prayers' },
  { value: 'rosario', label_id: 'Rosario', label_en: 'Rosary' },
  { value: 'bunda_maria', label_id: 'Bunda Maria', label_en: 'Virgin Mary' },
  { value: 'hati_kudus_yesus', label_id: 'Hati Kudus Yesus', label_en: 'Sacred Heart' },
  { value: 'roh_kudus', label_id: 'Roh Kudus', label_en: 'Holy Spirit' },
  { value: 'malaikat', label_id: 'Malaikat', label_en: 'Angels' },
  { value: 'jalan_salib', label_id: 'Jalan Salib', label_en: 'Stations of the Cross' },
  { value: 'para_kudus', label_id: 'Para Kudus', label_en: 'Saints' },
  { value: 'keluarga', label_id: 'Keluarga', label_en: 'Family' },
  { value: 'tobat_syukur', label_id: 'Tobat & Syukur', label_en: 'Repentance & Gratitude' },
];

export interface Prayer {
  id: string;
  slug: string;
  title_id: string;
  title_en: string;
  body_id: string;
  body_en: string;
  category: PrayerCategory;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  body: string;
  cover_image_url: string | null;
  category: string;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsComment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface Event {
  id: string;
  author_id: string;
  title: string;
  description: string;
  banner_image_url: string | null;
  event_date: string;
  end_date: string | null;
  location: string;
  capacity: number | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: RSVPStatus;
  created_at: string;
}

// Supabase Database type for the typed client
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string };
        Update: Partial<Omit<Profile, "id">>;
        Relationships: [];
      };
      news_posts: {
        Row: NewsPost;
        Insert: Partial<NewsPost> & { author_id: string; title: string; slug: string };
        Update: Partial<Omit<NewsPost, "id" | "author_id">>;
        Relationships: [];
      };
      news_comments: {
        Row: NewsComment;
        Insert: Partial<NewsComment> & { post_id: string; author_id: string; body: string };
        Update: Partial<Omit<NewsComment, "id" | "post_id" | "author_id">>;
        Relationships: [];
      };
      news_reactions: {
        Row: NewsReaction;
        Insert: Partial<NewsReaction> & { post_id: string; user_id: string };
        Update: Partial<Omit<NewsReaction, "id">>;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: Partial<Event> & { author_id: string; title: string; event_date: string };
        Update: Partial<Omit<Event, "id" | "author_id">>;
        Relationships: [];
      };
      event_rsvps: {
        Row: EventRSVP;
        Insert: Partial<EventRSVP> & { event_id: string; user_id: string };
        Update: Partial<Omit<EventRSVP, "id" | "event_id" | "user_id">>;
        Relationships: [];
      };
      daily_devotions: {
        Row: DailyDevotion;
        Insert: Partial<DailyDevotion> & { publish_date: string; verse_reference: string; verse_text: string; prayer_title: string; prayer_text: string };
        Update: Partial<Omit<DailyDevotion, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
      is_admin_or_mod: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      event_going_count: {
        Args: { event_uuid: string };
        Returns: number;
      };
    };
    Enums: {
      user_role: UserRole;
      user_gender: UserGender;
      post_status: PostStatus;
      event_status: EventStatus;
      rsvp_status: RSVPStatus;
      reaction_type: ReactionType;
    };
    CompositeTypes: Record<string, never>;
  };
};






