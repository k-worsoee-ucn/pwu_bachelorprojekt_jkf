const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const handleFileSelect = (event, selectedFiles) => {
  const files = Array.from(event.target.files);

  if (files.length + selectedFiles.value.length > 20) {
    return { valid: false, error: "Maximum 20 images can be uploaded at once" };
  }

  const invalidFiles = files.filter((file) => file.size > 20 * 1024 * 1024);
  if (invalidFiles.length > 0) {
    return {
      valid: false,
      error: `Some files exceed 20MB limit: ${invalidFiles.map((f) => f.name).join(", ")}`,
    };
  }

  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const invalidTypes = files.filter((file) => !validTypes.includes(file.type));
  if (invalidTypes.length > 0) {
    return {
      valid: false,
      error: `Invalid file types: ${invalidTypes.map((f) => f.name).join(", ")}`,
    };
  }

  return { valid: true, files };
};

export const uploadImages = async (processId, selectedFiles, imageType) => {
  const formData = new FormData();
  selectedFiles.forEach((file) => {
    formData.append("images", file);
  });
  formData.append("type", imageType);

  const response = await fetch(`${apiBaseUrl}/api/processes/${processId}/images`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  return await response.json();
};

export const fetchUploadedImages = async (processId, imageType) => {
  try {
    const response = await fetch(
      `${apiBaseUrl}/api/processes/${processId}/images?type=${imageType}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch images");
    }

    const result = await response.json();
    return result.images || [];
  } catch (error) {
    console.error("Error fetching images:", error);
  }
};

export const deleteImage = async (imageId) => {
  const response = await fetch(`${apiBaseUrl}/api/images/${imageId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Delete failed");
  }
};

export const getImageUrl = (url) => {
  return `${apiBaseUrl}${url}`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("da-DK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getFilePreview = (file) => {
  return URL.createObjectURL(file);
};
