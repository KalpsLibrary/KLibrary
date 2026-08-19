// KLibrary Supabase connection
// The publishable key is safe to use in browser code.
// Do NOT put a secret/service_role key here.

const SUPABASE_URL = "https://skvhapyhylpnjhpsywpa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_RzRW1h8QjMaRvyLLcmPvmA_CUh3XwU3";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
