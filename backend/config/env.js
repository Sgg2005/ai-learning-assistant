import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/config -> backend/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL in backend/.env");
}
if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error("Missing SUPABASE_ANON_KEY in backend/.env");
}