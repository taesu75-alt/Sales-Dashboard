import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://gtqbegfibpbozoynkqww.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0cWJlZ2ZpYnBib3pveW5rcXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNDYzODgsImV4cCI6MjA5NjgyMjM4OH0.Qin86Cp7vxq8KUZlXCt_Vh5Tr3Ajy2nmo_dunZMGUGM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
