import { create } from 'zustand';

import type { SubscriptionStatus } from '@/types';

interface UserState {
  subscriptionStatus: SubscriptionStatus;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
}

export const useUserStore = create<UserState>((set) => ({
  subscriptionStatus: 'free',
  setSubscriptionStatus: (status) => set({ subscriptionStatus: status }),
}));
