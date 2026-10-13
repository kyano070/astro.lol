import type { IconType } from 'react-icons';
import {
  FaDiscord,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaSpotify,
  FaTiktok,
  FaTwitch,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import type { Platform } from '@/lib/constants';

const ICONS: Record<Platform, IconType> = {
  discord: FaDiscord,
  youtube: FaYoutube,
  twitch: FaTwitch,
  github: FaGithub,
  instagram: FaInstagram,
  x: FaXTwitter,
  tiktok: FaTiktok,
  spotify: FaSpotify,
  website: FaGlobe,
};

export default function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  const Icon = ICONS[platform] ?? FaGlobe;
  return <Icon className={className} aria-hidden />;
}
