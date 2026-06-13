import { BackendAdapter } from './types';
import { supabaseAdapter } from './supabaseAdapter';
import { firebaseAdapter } from './firebaseAdapter';
import { convexAdapter } from './convexAdapter';

const provider = import.meta.env.VITE_BACKEND_PROVIDER || 'supabase';

let activeAdapter: BackendAdapter;

switch (provider.toLowerCase()) {
  case 'firebase':
    activeAdapter = firebaseAdapter;
    console.log('[Backend] Running with Firebase provider');
    break;
  case 'convex':
    activeAdapter = {
      auth: firebaseAdapter.auth,
      db: convexAdapter.db,
      storage: convexAdapter.storage
    };
    console.log('[Backend] Running with Convex provider (with Firebase Auth)');
    break;
  case 'supabase':
  default:
    activeAdapter = supabaseAdapter;
    console.log('[Backend] Running with Supabase provider');
    break;
}

export const auth = activeAdapter.auth;
export const db = activeAdapter.db;
export const storage = activeAdapter.storage;

export default activeAdapter;
export * from './types';
