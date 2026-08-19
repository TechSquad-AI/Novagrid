import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://etklfhihhmavzyntljyz.supabase.co'
const supabaseAnonKey = 'sb_publishable_VSp8wf_twb_zIJajq7mMfg_fJBKZrF7'

let supabase;
try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
    console.warn("Supabase init failed, using mock client");
}

export { supabase };
