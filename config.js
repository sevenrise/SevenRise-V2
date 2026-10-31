const SUPABASE_URL = "https://eyhvzkqjnpuepqedvprl.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_8octlvT4wMspfEX14uFMuA_ShwqQYbj";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
