import multer from 'multer';
import AppError from '../utils/AppError.js';

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(
      new AppError(
        400,
        'INVALID_FILE_TYPE',
        'jpg, png, webp 이미지만 업로드할 수 있습니다.'
      )
    );
    return;
  }

  cb(null, true);
};

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
