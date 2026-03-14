import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://uadvjxsyqaukqhxdbohq.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhZHZqeHN5cWF1a3FoeGRib2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjgyMTYsImV4cCI6MjA4OTAwNDIxNn0._H7ekcj37qfelQ4IXF06pvA8QE9QRAjiCBgxK0bhilc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
