
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = "/tmp/public/files/images"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'), false);
  }
};


const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});


const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};


const uploadMultiple = (fieldName, maxCount) => {
  return upload.array(fieldName, maxCount);
};


module.exports = upload;