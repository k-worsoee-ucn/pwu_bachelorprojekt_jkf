const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { verifyToken } = require("../middleware/auth");
const { canManageImages } = require("../middleware/stepAuth");
const {
  uploadImages,
  getProcessImages,
  deleteImage,
} = require("../controllers/image.controller");

// Upload multiple images for a process
// Step 3 (production) or Step 4 (installation) - checked in middleware based on image type
router.post(
  "/processes/:processId/images",
  verifyToken,
  upload.array("images", 10),
  canManageImages,
  uploadImages
);

// Get all images for a process
router.get("/processes/:processId/images", verifyToken, getProcessImages);

// Delete an image
router.delete("/images/:id", verifyToken, canManageImages, deleteImage);

module.exports = router;
