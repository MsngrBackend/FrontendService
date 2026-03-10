import { profileHttp, uploadAvatar } from './client';
import type { Profile, PrivacySettings, UpdateProfileData, Contact, AddContactData } from '../types/profile';

export const profileApi = {
  getMyProfile: () =>
    profileHttp.get<Profile>('/me'),

  getProfileById: (userId: string) =>
    profileHttp.get<Profile>(`/${userId}`),

  updateProfile: (data: UpdateProfileData) =>
    profileHttp.patch<Profile>('/me', data),

  uploadAvatar,

  deleteAvatar: () =>
    profileHttp.delete<void>('/me/avatar'),

  getPrivacy: () =>
    profileHttp.get<PrivacySettings>('/me/privacy'),

  updatePrivacy: (data: Partial<Omit<PrivacySettings, 'user_id'>>) =>
    profileHttp.put<PrivacySettings>('/me/privacy', data),

  getContacts: () =>
    profileHttp.get<Contact[]>('/contacts'),

  addContact: (data: AddContactData) =>
    profileHttp.post<Contact>('/contacts', data),

  removeContact: (contactId: string) =>
    profileHttp.delete<void>(`/contacts/${contactId}`),
};
