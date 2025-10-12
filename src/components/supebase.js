import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zxkbnadqxgkyknfleqif.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4a2JuYWRxeGdreWtuZmxlcWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mjg3MzQsImV4cCI6MjA3NDMwNDczNH0.Kfk_WunBv28smAgfTYfBB_pwD0q4od8LjQcPqd66rJU'
export const supabase = createClient(supabaseUrl, supabaseKey)
