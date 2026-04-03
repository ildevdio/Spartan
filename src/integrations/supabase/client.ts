import { createClient } from '@supabase/supabase-js';

// Initial config from environment (Master/Primary Database)
const masterUrl = import.meta.env.VITE_SUPABASE_URL || "";
const masterKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

/**
 * masterSupabase is the FIXED connection to the primary project
 * used for managing licenses and developer settings.
 */
export const masterSupabase = createClient(masterUrl, masterKey, {
  auth: { persistSession: false }
});

// We'll use a local variable to hold the active client (initially pointing to master)
let activeClient = createClient(masterUrl, masterKey, {
  auth: { persistSession: true }
});

/**
 * Updates the global Supabase client with new credentials.
 * This is used for Multi-Tenant database switching.
 */
export const updateSupabaseConfig = (url: string, key: string) => {
  console.log(`[Spartan] Switching database to: ${url}`);
  activeClient = createClient(url, key, {
    auth: { persistSession: true }
  });
};

/**
 * Proxy handler to intercept all calls to the 'supabase' export
 * and forward them to the current 'activeClient'.
 */
const dynamicHandler = {
  get: (_target: any, prop: string) => {
    return (activeClient as any)[prop];
  }
};

// The exported 'supabase' instance is now a Proxy that always points to the activeClient
export const supabase = new Proxy({}, dynamicHandler) as ReturnType<typeof createClient>;

// Export connection status helpers
export const supabaseUrl = masterUrl;
export const isRealDb = masterUrl && !masterUrl.includes("supabase.co"); 