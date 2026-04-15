import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ikkbukwhccjswnsnldab.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra2J1a3doY2Nqc3duc25sZGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTU5ODIsImV4cCI6MjA5MTY3MTk4Mn0.Wp48dVPfxQ8nHVVRlubyvGgc5pxxrSZUZvA0F8jJxcg'

export const supabase = createClient(supabaseUrl, supabaseKey)