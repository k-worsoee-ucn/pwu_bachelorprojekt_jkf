const express = require("express");
const path = require("path");
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

router.get("/images/file/:filename", async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "..", "uploads", filename);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(path.join(__dirname, "..", "uploads"))) {
    return res.status(403).json({ error: "Access denied" });
  }
  
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: "Image not found" });
    }
  });
});

router.delete("/images/:id", verifyToken, canManageImages, deleteImage);

module.exports = router;
