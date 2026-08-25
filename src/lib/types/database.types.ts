export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "member" | "moderator" | "admin";
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
  interests: string[];
  role: UserRole;
  gender: UserGender | null;
  completed_modules: string[];
  created_at: string;
  updated_at: string;
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
