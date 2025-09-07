const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Let cloudinary use CLOUDINARY_URL from .env
cloudinary.config();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "flood-reports",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "mp4", "avi", "mov"],
    resource_type: "auto",
    transformation: [
      { width: 1200, height: 1200, crop: "limit", quality: "auto" },
    ],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) cb(null, true);
    else
      cb(new Error("Invalid file type. Only images and videos are allowed."));
  },
});

module.exports = upload;
