import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// force-load backend/.env from config folder
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('SUPABASE_URL from env:', process.env.SUPABASE_URL);
console.log('HAS SERVICE KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabaseAdmin;