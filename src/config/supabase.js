import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing. Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,   // keep session alive automatically
        persistSession: true,   // save session in localStorage    
        detectSessionInUrl: true,   // handle OAuth redirect URLs
        storageKey: 'moniq-auth'
    },
    realtime: {
        params: { eventsPerSecond: 10 }
    }
})