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

router.post(
  "/processes/:processId/images",
  verifyToken,
  upload.array("images", 10),
  canManageImages,
  uploadImages
);

router.get("/processes/:processId/images", verifyToken, getProcessImages);

router.delete("/images/:id", verifyToken, canManageImages, deleteImage);

module.exports = router;
