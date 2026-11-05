// TODO: Implement GitHub store

import { create } from 'zustand';

interface GitHubState {
  repositories: unknown[];
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  setRepositories: (repos: unknown[]) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncedAt: (date: Date | null) => void;
}

export const useGithubStore = create<GitHubState>((set) => ({
  repositories: [],
  isSyncing: false,
  lastSyncedAt: null,
  setRepositories: (repositories) => set({ repositories }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
}));
