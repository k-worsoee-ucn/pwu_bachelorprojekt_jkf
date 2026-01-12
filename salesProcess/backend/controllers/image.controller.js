const imageService = require("../services/image.service");

const uploadImages = async (req, res) => {
  try {
    const { processId } = req.params;
    const files = req.files;
    const { type } = req.body;

    const imageRecords = await imageService.uploadImages(
      processId,
      files,
      type
    );

    res.status(201).json({
      message: `${files.length} image(s) uploaded successfully`,
      images: imageRecords,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    const statusCode = error.status || 500;
    const message = error.message || "Failed to upload images";
    res.status(statusCode).json({ error: message });
  }
};

const getProcessImages = async (req, res) => {
  try {
    const { processId } = req.params;
    const { type } = req.query;

    const images = await imageService.getProcessImages(processId, type);

    res.json({ images });
  } catch (error) {
    console.error("Error fetching images:", error);
    const statusCode = error.status || 500;
    const message = error.message || "Failed to fetch images";
    res.status(statusCode).json({ error: message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await imageService.deleteImage(id);

    res.json(result);
  } catch (error) {
    console.error("Error deleting image:", error);
    const statusCode = error.status || 500;
    const message = error.message || "Failed to delete image";
    res.status(statusCode).json({ error: message });
  }
};

module.exports = {
  uploadImages,
  getProcessImages,
  deleteImage,
};
