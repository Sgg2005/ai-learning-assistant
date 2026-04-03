import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads/documents");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") return cb(null, true);
  cb(new Error("Only PDF files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024), // 10MB default
  },
});

export default upload;