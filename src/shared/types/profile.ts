export interface Profile {
  user_id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  last_seen_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PrivacySettings {
  user_id: string;
  profile_visibility: 'everyone' | 'contacts' | 'nobody';
  last_seen_visibility: 'everyone' | 'contacts' | 'nobody';
  avatar_visibility: 'everyone' | 'contacts' | 'nobody';
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  username?: string;
  bio?: string;
}

export interface Contact {
  contact_id: string;
  alias?: string;
  created_at: string;
  profile?: Profile;
}

export interface AddContactData {
  contact_id: string;
  alias?: string;
}
