export interface AvatarOption {
  id: string;
  name: string;
  url: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'avatar-1',
    name: '3D Cyber Explorer',
    url: 'https://images.unsplash.com/photo-1772371272228-f4a8247cfe6d?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'avatar-2',
    name: '3D Tech Architect',
    url: 'https://plus.unsplash.com/premium_photo-1739786995646-480d5cfd83dc?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'avatar-3',
    name: '3D Quantum Engineer',
    url: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'avatar-4',
    name: '3D Product Lead',
    url: 'https://images.unsplash.com/photo-1740252117013-4fb21771e7ca?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'avatar-5',
    name: '3D Full Stack Dev',
    url: 'https://images.unsplash.com/photo-1740252117070-7aa2955b25f8?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'avatar-6',
    name: '3D Neural Specialist',
    url: 'https://images.unsplash.com/photo-1740252117044-2af197eea287?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'avatar-7',
    name: '3D Systems Analyst',
    url: 'https://plus.unsplash.com/premium_photo-1739786996022-5ed5b56834e2?w=600&auto=format&fit=crop&q=60',
  },
  {
    id: 'avatar-8',
    name: '3D Senior Executive',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=60',
  },
];

const AVATAR_STORAGE_KEY = 'panel_ai_user_selected_avatar';

export function getSavedAvatar(): string {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (saved) return saved;
    } catch (e) {}
  }
  return AVATAR_OPTIONS[0].url;
}

export function saveSelectedAvatar(url: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(AVATAR_STORAGE_KEY, url);
    } catch (e) {}
  }
}
