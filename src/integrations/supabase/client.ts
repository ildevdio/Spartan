import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { mockSupabase } from '@/lib/mock-db';
import { deobfuscate } from '@/lib/crypto';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

// Customer keys (stored obfuscated in .env)
const MGCONSULT_KEY = deobfuscate(import.meta.env.VITE_SPARTAN_MGCONSULT_LICENSE_KEY || "");

// Developer keys (stored plain in .env)
const DEV_KEYS = [
  import.meta.env.VITE_SPARTAN_DEV_DIOGO || "",
  import.meta.env.VITE_SPARTAN_DEV_SAMUEL || "",
  import.meta.env.VITE_SPARTAN_DEV_NICOLAS || "",
].filter(Boolean);

const checkAccess = () => {
  const stored = localStorage.getItem("spartan_license_key");
  if (!stored) return false;

  // Key is valid if it's a dev key OR if its deobfuscated version matches a customer key
  const isDev = DEV_KEYS.includes(stored);
  const deobfuscatedStored = deobfuscate(stored);
  const isCustomer = deobfuscatedStored === MGCONSULT_KEY;
  
  return isDev || isCustomer;
};

export const isRealDb = checkAccess();

export const supabase = isRealDb 
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  })
  : mockSupabase as any;