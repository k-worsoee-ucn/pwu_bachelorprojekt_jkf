const prisma = require("../utils/prisma");
const fs = require("fs");
const path = require("path");

async function uploadImages(processId, files, type = "production") {
  if (!files || files.length === 0) {
    throw { status: 400, message: "No files uploaded" };
  }

  const process = await prisma.process.findUnique({
    where: { id: parseInt(processId) },
  });

  if (!process) {
    throw { status: 404, message: "Process not found" };
  }

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

  return imageRecords;
}

async function getProcessImages(processId, type = null) {
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

  return images;
}

async function deleteImage(imageId) {
  const image = await prisma.image.findUnique({
    where: { id: parseInt(imageId) },
  });

  if (!image) {
    throw { status: 404, message: "Image not found" };
  }

  const filePath = path.join(
    __dirname,
    "..",
    "uploads",
    image.filename
  );
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await prisma.image.delete({
    where: { id: parseInt(imageId) },
  });

  return { message: "Image deleted successfully" };
}

module.exports = {
  uploadImages,
  getProcessImages,
  deleteImage,
};
