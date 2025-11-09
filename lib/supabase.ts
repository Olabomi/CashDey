import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tcnafmkggkixqccgcbkk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbmFmbWtnZ2tpeHFjY2djYmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTYxNDQsImV4cCI6MjA3NzQzMjE0NH0.x6DA6UayEx7kg_f1OEvoKKM37cC33nxBv6G7IiDI0ro';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);