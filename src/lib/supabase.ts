import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error(
    'CRITICAL SUPABASE CONFIG ERROR (CLIENT-SIDE): Supabase URL is missing. Supabase functionality will be DISABLED. ',
    'This usually means NEXT_PUBLIC_SUPABASE_URL is not correctly set in your .env.local file, or the server was not restarted after changes.'
  );
}

if (!supabaseAnonKey) {
  console.error(
    'CRITICAL SUPABASE CONFIG ERROR (CLIENT-SIDE): Supabase Anon Key is missing. Supabase functionality will be DISABLED. ',
    'This usually means NEXT_PUBLIC_SUPABASE_ANON_KEY is not correctly set in your .env.local file, or the server was not restarted after changes.'
  );
}

// Inicializa o Supabase apenas se as variáveis estiverem presentes
let supabase: SupabaseClient | null = null;
let supabaseServicesAvailable = false;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    supabaseServicesAvailable = true;
    console.log('Supabase client initialized successfully.');
  } catch (error) {
    console.error('Supabase client initialization error:', error);
    supabase = null; // Garante que supabase seja null em caso de erro
    supabaseServicesAvailable = false;
  }
} else {
  console.warn('Supabase URL or Anon Key is missing. Supabase client not initialized.');
  // supabase já é null por padrão, supabaseServicesAvailable já é false
}

export { supabase, supabaseServicesAvailable };