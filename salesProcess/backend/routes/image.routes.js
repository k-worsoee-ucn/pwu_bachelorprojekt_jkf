const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const {
  uploadImages,
  getProcessImages,
  deleteImage,
} = require("../controllers/image.controller");

// Upload multiple images for a process
router.post(
  "/processes/:processId/images",
  upload.array("images", 10),
  uploadImages
);

// Get all images for a process
router.get("/processes/:processId/images", getProcessImages);

// Delete an image
router.delete("/images/:id", deleteImage);

module.exports = router;
