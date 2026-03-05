import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pjyjonyvwvllppoetbyb.supabase.co'       // paste from Step 5 above
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqeWpvbnl2d3ZsbHBwb2V0YnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDQyNjAsImV4cCI6MjA4ODI4MDI2MH0.qbwIQFqgQOP2jzo6fHk8wP5at_4NIOrtGq5tArtpgu4'   // paste from Step 5 above

export const supabase = createClient(supabaseUrl, supabaseKey)