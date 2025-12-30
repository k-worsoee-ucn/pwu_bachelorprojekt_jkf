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
          :disabled="props.disabled"
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
        :disabled="!selectedFiles.length || uploading || props.disabled"
        class="success-btn"
      >
        Upload Images
      </button>
    </div>

    <!-- Preview Selected Files -->
    <div v-if="selectedFiles.length" class="preview-section">
      <hr />
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
            <button @click="deleteImage(image.id)" class="error-btn">
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
  disabled: {
    type: Boolean,
    default: false,
  },
});

const fileInput = ref(null);
const selectedFiles = ref([]);
const uploadedImages = ref([]);
const uploading = ref(false);
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
  display: flex;
  flex-direction: column;
  gap: 2rem;

  .upload-section {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .file-input-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .file-input {
    display: none;
  }

  .file-label {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    padding: 0.6rem 1.2rem;
    background-color: $neutral-100-light;
    @include default-border;

    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: $neutral-200-light;
    }

    span {
      font-size: 1rem;
    }
  }

  .preview-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .preview-item,
    .gallery-item {
      position: relative;
      @include default-border;
      overflow: hidden;
      background-color: $neutral-100-light;
  
      img {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }
    }
    
    .file-name {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        padding: 0 1rem 1rem 1rem;
    }

    .remove-button {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 30px;
      height: 30px;
      background-color: $error-500-main;
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
        background-color: $error-600;
      }
    }
  }

  .gallery-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    .image-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;

      .gallery-item {
        @include default-border;
        background-color: $neutral-100-light;

        img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .gallery-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
        }
      
        .gallery-filename {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
