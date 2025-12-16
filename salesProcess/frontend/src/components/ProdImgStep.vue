<template>
  <div class="prod-img-step">
    <h3>Production Images</h3>
    <p>Upload images from the production process</p>

    <!-- Upload Section -->
    <div class="upload-section">
      <div class="file-input-wrapper">
        <input
          type="file"
          ref="fileInput"
          @change="handleFileSelect"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          multiple
          class="file-input"
          id="imageUpload"
        />
        <label for="imageUpload" class="file-label">
          <span class="upload-icon">📁</span>
          Choose Images
        </label>
        <span v-if="selectedFiles.length" class="file-count">
          {{ selectedFiles.length }} file(s) selected
        </span>
      </div>

      <button
        @click="uploadImages"
        :disabled="!selectedFiles.length || uploading"
        class="upload-button"
      >
        <span v-if="uploading">Uploading...</span>
        <span v-else>Upload Images</span>
      </button>
    </div>

    <!-- Preview Selected Files -->
    <div v-if="selectedFiles.length" class="preview-section">
      <h4>Selected Files</h4>
      <div class="preview-grid">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="preview-item"
        >
          <img :src="getFilePreview(file)" :alt="file.name" />
          <p class="file-name">{{ file.name }}</p>
          <button @click="removeFile(index)" class="remove-button">×</button>
        </div>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="progress-section">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
      <p>{{ uploadProgress }}%</p>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <!-- Uploaded Images Gallery -->
    <div v-if="uploadedImages.length" class="gallery-section">
      <h4>Uploaded Images</h4>
      <div class="image-gallery">
        <div
          v-for="image in uploadedImages"
          :key="image.id"
          class="gallery-item"
        >
          <img :src="getImageUrl(image.url)" :alt="image.filename" />
          <div class="gallery-info">
            <p class="gallery-filename">{{ image.filename }}</p>
            <p class="gallery-date">{{ formatDate(image.createdAt) }}</p>
            <button @click="deleteImage(image.id)" class="delete-button">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuth } from "../composables/useAuth";

const { getAuthHeader } = useAuth();

const props = defineProps({
  processId: {
    type: [String, Number],
    required: true,
  },
});

const fileInput = ref(null);
const selectedFiles = ref([]);
const uploadedImages = ref([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const errorMessage = ref("");
const successMessage = ref("");

// Fetch existing images when component mounts
onMounted(async () => {
  await fetchUploadedImages();
});

// Handle file selection
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);

  // Validate file count (max 10)
  if (files.length + selectedFiles.value.length > 10) {
    errorMessage.value = "Maximum 10 images can be uploaded at once";
    return;
  }

  // Validate file size (10MB each)
  const invalidFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
  if (invalidFiles.length > 0) {
    errorMessage.value = `Some files exceed 10MB limit: ${invalidFiles
      .map((f) => f.name)
      .join(", ")}`;
    return;
  }

  // Validate file types
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const invalidTypes = files.filter((file) => !validTypes.includes(file.type));
  if (invalidTypes.length > 0) {
    errorMessage.value = `Invalid file types: ${invalidTypes
      .map((f) => f.name)
      .join(", ")}`;
    return;
  }

  selectedFiles.value = [...selectedFiles.value, ...files];
  errorMessage.value = "";
};

// Remove file from selection
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Generate preview URL for file
const getFilePreview = (file) => {
  return URL.createObjectURL(file);
};

// Upload images to server
const uploadImages = async () => {
  if (!selectedFiles.value.length) return;

  uploading.value = true;
  uploadProgress.value = 0;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const formData = new FormData();
    selectedFiles.value.forEach((file) => {
      formData.append("images", file);
    });
    formData.append("type", "production");

    const response = await fetch(
      `http://localhost:3000/api/processes/${props.processId}/images`,
      {
        method: "POST",
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const result = await response.json();
    uploadProgress.value = 100;
    successMessage.value = `Successfully uploaded ${result.images.length} image(s)`;

    // Clear selected files
    selectedFiles.value = [];
    if (fileInput.value) {
      fileInput.value.value = "";
    }

    // Refresh uploaded images
    await fetchUploadedImages();

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    uploading.value = false;
  }
};

// Fetch uploaded images from server
const fetchUploadedImages = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/processes/${props.processId}/images?type=production`,
      {
        headers: {
          ...getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch images");
    }

    const result = await response.json();
    uploadedImages.value = result.images || [];
  } catch (error) {
    console.error("Error fetching images:", error);
  }
};

// Delete image
const deleteImage = async (imageId) => {
  if (!confirm("Are you sure you want to delete this image?")) return;

  try {
    const response = await fetch(
      `http://localhost:3000/api/images/${imageId}`,
      {
        method: "DELETE",
        headers: {
          ...getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Delete failed");
    }

    successMessage.value = "Image deleted successfully";

    // Refresh uploaded images
    await fetchUploadedImages();

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    errorMessage.value = error.message;
  }
};

// Get full image URL
const getImageUrl = (url) => {
  return `http://localhost:3000${url}`;
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped lang="scss">
.prod-img-step {
  padding: 20px;

  h3 {
    margin-bottom: 10px;
    color: #333;
  }

  p {
    color: #666;
    margin-bottom: 20px;
  }

  h4 {
    margin-bottom: 15px;
    color: #333;
  }

  .upload-section {
    display: flex;
    gap: 15px;
    align-items: center;
    margin-bottom: 30px;
  }

  .file-input-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .file-input {
    display: none;
  }

  .file-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background-color: #f0f0f0;
    border: 2px dashed #ccc;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: #e0e0e0;
      border-color: #999;
    }
  }

  .upload-icon {
    font-size: 20px;
  }

  .file-count {
    color: #666;
    font-size: 14px;
  }

  .upload-button {
    padding: 10px 30px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;

    &:hover:not(:disabled) {
      background-color: #45a049;
    }

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }

  .preview-section,
  .gallery-section {
    margin-top: 30px;
  }

  .preview-grid,
  .image-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }

  .preview-item,
  .gallery-item {
    position: relative;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    background-color: #f9f9f9;

    img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
  }

  .file-name {
    padding: 10px;
    font-size: 12px;
    color: #666;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .remove-button {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 30px;
    height: 30px;
    background-color: rgba(255, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: rgba(255, 0, 0, 0.9);
    }
  }

  .gallery-info {
    padding: 10px;
  }

  .gallery-filename {
    font-size: 14px;
    color: #333;
    margin-bottom: 5px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .gallery-date {
    font-size: 12px;
    color: #999;
    margin-bottom: 10px;
  }

  .delete-button {
    padding: 5px 15px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #da190b;
    }
  }

  .progress-section {
    margin: 20px 0;
  }

  .progress-bar {
    width: 100%;
    height: 20px;
    background-color: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .progress-fill {
    height: 100%;
    background-color: #4caf50;
    transition: width 0.3s ease;
  }

  .error-message {
    padding: 10px 15px;
    background-color: #ffebee;
    color: #c62828;
    border-left: 4px solid #c62828;
    border-radius: 4px;
    margin: 15px 0;
  }

  .success-message {
    padding: 10px 15px;
    background-color: #e8f5e9;
    color: #2e7d32;
    border-left: 4px solid #2e7d32;
    border-radius: 4px;
    margin: 15px 0;
  }
}
</style>
