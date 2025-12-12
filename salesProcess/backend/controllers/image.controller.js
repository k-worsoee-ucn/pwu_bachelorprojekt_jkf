const prisma = require("./prisma");

// Upload images for a process
const uploadImages = async (req, res) => {
  try {
    const { processId } = req.params;
    const files = req.files;
    const { type } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Check if process exists
    const process = await prisma.process.findUnique({
      where: { id: parseInt(processId) },
    });

    if (!process) {
      return res.status(404).json({ error: "Process not found" });
    }

    // Create image records in database
    const imageRecords = await Promise.all(
      files.map((file) =>
        prisma.image.create({
          data: {
            url: `/uploads/${file.filename}`,
            filename: file.filename,
            processId: parseInt(processId),
            type: type || "production",
          },
        })
      )
    );

    res.status(201).json({
      message: `${files.length} image(s) uploaded successfully`,
      images: imageRecords,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ error: "Failed to upload images" });
  }
};

// Get all images for a process
const getProcessImages = async (req, res) => {
  try {
    const { processId } = req.params;
    const { type } = req.query;

    const where = {
      processId: parseInt(processId),
    };

    if (type) {
      where.type = type;
    }

    const images = await prisma.image.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ images });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

// Delete an image
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const fs = require("fs");
    const path = require("path");

    // Get image from database
    const image = await prisma.image.findUnique({
      where: { id: parseInt(id) },
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, "..", "uploads", image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await prisma.image.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
};

module.exports = {
  uploadImages,
  getProcessImages,
  deleteImage,
};
