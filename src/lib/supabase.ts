import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dczdbkuycxdiyhzfpqau.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjemRia3V5Y3hkaXloemZwcWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MDUyMjEsImV4cCI6MjA0NzI4MTIyMX0.-gl06KSUIej3anV64EeT9iStBWNBDf4ay08LsnKcbh8';

export const supabase = createClient(supabaseUrl, supabaseKey);