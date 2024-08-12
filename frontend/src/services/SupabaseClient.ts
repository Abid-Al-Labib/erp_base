
import { createClient } from '@supabase/supabase-js'

const supabase_url="https://outgycradjrfbjglnyxr.supabase.co"
const supabase_anon_key ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dGd5Y3JhZGpyZmJqZ2xueXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjExODcyNDIsImV4cCI6MjAzNjc2MzI0Mn0.vLBW-adZlymfFtfONdJlmgljgGwgck3EPIhSlphPNmA"

export const supabase_client = createClient(supabase_url, supabase_anon_key)