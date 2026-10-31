const SUPABASE_URL = "ISI_PROJECT_URL";

const SUPABASE_ANON_KEY = "ISI_ANON_PUBLIC_KEY";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
