import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://idgmtcjjjxfrkkyeuqft.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZ210Y2pqanhmcmtreWV1cWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MTIxMzAsImV4cCI6MjA4MDE4ODEzMH0.1xYUfb4lxPJ7wuwwGw84NDWfaHOUfM1hDPnksUtZmSY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


