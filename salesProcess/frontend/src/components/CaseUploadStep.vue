<template>
  <div class="case-upload-step">
    <h2>Case Content</h2>
    <p class="description">
      Write and format the case content that will be published.
    </p>

    <div v-if="loading" class="loading">
      <i class="fa-solid fa-spinner fa-spin"></i> Loading...
    </div>

    <div v-else class="editor-container">
      <div class="editor-wrapper">
        <QuillEditor
          v-model:content="caseContent"
          :options="editorOptions"
          contentType="html"
          theme="snow"
        />
      </div>

      <div class="action-buttons">
        <button @click="saveCase" class="save-button" :disabled="saving">
          <i
            class="fa-solid"
            :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"
          ></i>
          {{ saving ? "Saving..." : "Save Case Content" }}
        </button>
      </div>

      <div v-if="saveMessage" :class="['save-message', saveMessage.type]">
        <i
          class="fa-solid"
          :class="
            saveMessage.type === 'success'
              ? 'fa-circle-check'
              : 'fa-circle-exclamation'
          "
        ></i>
        {{ saveMessage.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useAuth } from "@/composables/useAuth";

const props = defineProps({
  processId: {
    type: [String, Number],
    required: true,
  },
  process: {
    type: Object,
    default: null,
  },
});

const { getAuthHeader } = useAuth();

const caseContent = ref("");
const loading = ref(false);
const saving = ref(false);
const saveMessage = ref(null);
const currentCaseId = ref(null);

const editorOptions = {
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  },
  placeholder: "Start writing the case content here...",
};

const fetchCaseContent = async () => {
  if (!props.processId) return;

  loading.value = true;
  try {
    const response = await fetch(`/api/cases/process/${props.processId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (response.ok) {
      const cases = await response.json();
      if (cases && cases.length > 0) {
        const latestCase = cases[0];
        currentCaseId.value = latestCase.id;
        caseContent.value = latestCase.content || "";
      }
    }
  } catch (error) {
    console.error("Error fetching case content:", error);
  } finally {
    loading.value = false;
  }
};

const saveCase = async () => {
  if (!caseContent.value.trim()) {
    saveMessage.value = {
      type: "error",
      text: "Case content cannot be empty",
    };
    return;
  }

  saving.value = true;
  saveMessage.value = null;

  try {
    const url = currentCaseId.value
      ? `/api/cases/${currentCaseId.value}`
      : "/api/cases";

    const method = currentCaseId.value ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        content: caseContent.value,
        processId: parseInt(props.processId),
      }),
    });

    if (response.ok) {
      const savedCase = await response.json();
      currentCaseId.value = savedCase.id;

      saveMessage.value = {
        type: "success",
        text: "Case content saved successfully!",
      };

      setTimeout(() => {
        saveMessage.value = null;
      }, 3000);
    } else {
      throw new Error("Failed to save case content");
    }
  } catch (error) {
    console.error("Error saving case:", error);
    saveMessage.value = {
      type: "error",
      text: "Failed to save case content. Please try again.",
    };
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.processId,
  () => {
    if (props.processId) {
      fetchCaseContent();
    }
  },
  { immediate: true }
);

onMounted(() => {
  fetchCaseContent();
});
</script>

<style scoped>
.case-upload-step {
  padding: 1.5rem;
}

h2 {
  margin-bottom: 0.5rem;
  color: #204485;
}

.description {
  color: #666;
  margin-bottom: 1.5rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.editor-container {
  background: white;
  border-radius: 8px;
  padding: 1rem;
}

.editor-wrapper {
  margin-bottom: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.editor-wrapper :deep(.ql-container) {
  min-height: 400px;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
}

.editor-wrapper :deep(.ql-toolbar) {
  background: #f8f9fa;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.save-button {
  padding: 0.75rem 1.5rem;
  background: #204485;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.save-button:hover:not(:disabled) {
  background: #163361;
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.save-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.save-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
