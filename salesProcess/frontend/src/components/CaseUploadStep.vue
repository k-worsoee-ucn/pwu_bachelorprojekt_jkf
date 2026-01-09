<template>
  <div class="case-upload-step">
    <h2>Case Content</h2>
    <p class="description">
      Write and format the case content that will be published.
    </p>

    <!-- <div v-if="loading" class="loading">
      <i class="fa-solid fa-spinner fa-spin"></i> Loading...
    </div> -->

    <div class="editor-container">
      <div class="editor-wrapper">
        <QuillEditor
          v-model:content="caseContent"
          :options="editorOptions"
          :readOnly="props.disabled"
          contentType="html"
          theme="snow"
        />
      </div>

      <div class="action-buttons">
        <button @click="saveCase" class="success-btn" :disabled="saving || props.disabled">
          <i
            class="fa-solid"
            :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"
          ></i>
          {{ saving ? "Saving..." : "Save Case Content" }}
        </button>
      </div>

      <div v-if="saveMessage" :class="['save-message', saveMessage.type + '-message']">
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
  disabled: {
    type: Boolean,
    default: false,
  },
});

const { } = useAuth();

const caseContent = ref("");
const saving = ref(false);
const saveMessage = ref(null);
const currentCaseId = ref(null);

// Quill library WYSIWYG
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

  try {
    const response = await fetch(`/api/cases/process/${props.processId}`, {
      credentials: 'include',
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
      },
      credentials: 'include',
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

<style scoped lang="scss">
.case-upload-step {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .editor-container{
    display: flex;
    flex-direction: column;
    gap: 1rem;
    
    .editor-wrapper {
      @include default-border;
  
      :deep(.ql-container) {
        min-height: 400px;
        font-size: 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
          Ubuntu, Cantarell, sans-serif;
      }
  
      :deep(.ql-toolbar) {
        background: #f8f9fa;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
      }
  
      :deep(.ql-disabled .ql-toolbar) {
        background: #f3f4f6;
      }
  
      :deep(.ql-editor.ql-blank::before) {
        display: none !important;
      }
    }
  }
  

  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .save-message {
    padding: 1rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}
</style>
