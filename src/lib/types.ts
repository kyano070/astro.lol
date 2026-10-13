import type { FontId, Platform, ThemeId } from './constants';

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  status: string | null;
  avatar_url: string | null;
  background_url: string | null;
  music_url: string | null;
  accent_color: string;
  bg_color: string;
  text_color: string;
  font: FontId;
  theme: ThemeId | string;
  effect_animation: boolean;
  effect_glow: boolean;
  effect_particles: boolean;
  effect_blur: boolean;
  is_public: boolean;
  views: number;
  created_at: string;
};

export type LinkItem = {
  id: string;
  platform: Platform;
  label: string;
  url: string;
  position: number;
};

export type CardProfile = Pick<
  Profile,
  'username' | 'display_name' | 'bio' | 'avatar_url' | 'background_url' | 'accent_color' | 'bg_color' | 'views'
>;
