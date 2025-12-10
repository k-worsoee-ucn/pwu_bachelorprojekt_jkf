<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import SalesStep from "@/components/SalesStep.vue";

const route = useRoute();
const router = useRouter();
const { getAuthHeader, user } = useAuth();
const processId = computed(() => route.params.id);

const process = ref(null);
const isNewSale = computed(() => processId.value === "new");
const activeStep = ref(null);
const shippingDate = ref(null); // Mock shipping date for production step
const currentUserId = ref(null);

const steps = [
  { id: 1, title: "Salg - Sag oprettelse", component: "SalesStep" },
  { id: 2, title: "Under produktion", component: "ProductionStep" },
  {
    id: 3,
    title: "Marketing - Billedtagning af produkter",
    component: "ProdImgStep",
  },
  {
    id: 4,
    title: "Salg - Case samtykke & installations billeder",
    component: "InstallImgStep",
  },
  {
    id: 5,
    title: "Marketing - Case og reference oprettelse",
    component: "CaseRefStep",
  },
  {
    id: 6,
    title: "Marketing - (Efter godkendelse) case upload",
    component: "CaseUploadStep",
  },
];

const getCurrentStep = () => {
  if (isNewSale.value) return 1;
  return process.value?.currentStep || 1;
};

const getStepState = (stepId) => {
  const currentStep = getCurrentStep();
  if (stepId < currentStep) return "completed";
  if (stepId === currentStep) return "active";
  return "locked";
};

const getStepIcon = (stepId) => {
  const state = getStepState(stepId);
  if (state === "completed") return "fa-circle-check";
  if (state === "active") return "fa-circle-exclamation";
  return "fa-lock";
};

const canToggleStep = (stepId) => {
  const state = getStepState(stepId);
  return state !== "locked";
};

const toggleStep = (stepId) => {
  // Production step (step 2) should not have accordion functionality
  if (stepId === 2) return;

  if (!canToggleStep(stepId)) return;

  if (activeStep.value === stepId) {
    activeStep.value = null;
  } else {
    activeStep.value = stepId;
  }
};

onMounted(async () => {
  // Get current user ID
  if (user.value?.id) {
    currentUserId.value = user.value.id;
  }

  console.log("Route params:", route.params);
  console.log("processId:", processId.value);
  console.log("isNewSale:", isNewSale.value);

  if (!isNewSale.value && processId.value) {
    try {
      console.log("Fetching process:", processId.value);
      const response = await fetch(`/api/processes/${processId.value}`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Process data:", data);
      process.value = data;
      console.log("process.value after assignment:", process.value);
    } catch (error) {
      console.error("Error fetching process:", error);
    }
  }
  console.log("Final process.value:", process.value);
  console.log("Final isNewSale.value:", isNewSale.value);
  // Open first step by default
  activeStep.value = 1;
});

const goBack = () => {
  router.back();
};

const handleSaleCreated = (savedSale) => {
  console.log("Sale created:", savedSale);
  // Navigate to the created process
  if (savedSale.process?.id) {
    router.push(`/processes/${savedSale.process.id}`);
  }
};
</script>

<template>
  <div v-if="isNewSale" class="single-process-container">
    <button class="back-button" @click="goBack">
      <i class="fa-solid fa-chevron-left"></i> Back
    </button>
    <h1>Create New Sale</h1>
    <p><strong>Current Step:</strong> 1 / 6</p>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: (1 / 6) * 100 + '%' }"></div>
    </div>

    <div class="steps-container">
      <div
        v-for="step in steps"
        :key="step.id"
        class="step-accordion"
        :class="[
          { 'is-active': activeStep === step.id },
          `state-${getStepState(step.id)}`,
        ]"
      >
        <div
          class="accordion-header"
          @click="step.id !== 2 ? toggleStep(step.id) : null"
          :class="{
            'not-allowed': !canToggleStep(step.id),
            'no-expand': step.id === 2,
          }"
        >
          <div class="step-info">
            <i class="fa-solid step-icon" :class="getStepIcon(step.id)"></i>
            <div class="step-text">
              <h3>{{ step.title }}</h3>
              <p
                v-if="
                  step.id === 2 &&
                  getStepState(step.id) === 'active' &&
                  !shippingDate
                "
                class="step-status"
              >
                Forventet dato: xx/xx
              </p>
              <p v-if="step.id === 2 && shippingDate" class="step-status">
                Sidst ændret: {{ shippingDate }}
              </p>
              <p
                v-if="getStepState(step.id) === 'completed' && step.id !== 2"
                class="step-status"
              >
                Sidst ændret: {{ new Date().toLocaleDateString("da-DK") }}
              </p>
            </div>
          </div>
          <i
            v-if="canToggleStep(step.id) && step.id !== 2"
            class="fa-solid chevron-icon"
            :class="
              activeStep === step.id ? 'fa-chevron-up' : 'fa-chevron-down'
            "
          ></i>
        </div>
        <div
          v-if="
            activeStep === step.id && canToggleStep(step.id) && step.id !== 2
          "
          class="accordion-content"
        >
          <SalesStep
            v-if="step.component === 'SalesStep'"
            :process-id="0"
            :current-user-id="currentUserId || 0"
            :sale="null"
            @sale-created="handleSaleCreated"
          />
          <div v-else class="placeholder">
            {{ step.component }} - Content coming soon
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="process" class="single-process-container">
    <button class="back-button" @click="goBack">
      <i class="fa-solid fa-chevron-left"></i> Back
    </button>
    <h1>{{ process.title }}</h1>
    <p><strong>Case Number:</strong> {{ process.caseNo }}</p>
    <p><strong>Status:</strong> {{ process.status }}</p>
    <p><strong>Current Step:</strong> {{ process.currentStep }} / 6</p>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: (process.currentStep / 6) * 100 + '%' }"
      ></div>
    </div>

    <div class="steps-container">
      <div
        v-for="step in steps"
        :key="step.id"
        class="step-accordion"
        :class="[
          { 'is-active': activeStep === step.id },
          `state-${getStepState(step.id)}`,
        ]"
      >
        <div
          class="accordion-header"
          @click="step.id !== 2 ? toggleStep(step.id) : null"
          :class="{
            'not-allowed': !canToggleStep(step.id),
            'no-expand': step.id === 2,
          }"
        >
          <div class="step-info">
            <i class="fa-solid step-icon" :class="getStepIcon(step.id)"></i>
            <div class="step-text">
              <h3>{{ step.title }}</h3>
              <p
                v-if="
                  step.id === 2 &&
                  getStepState(step.id) === 'active' &&
                  !shippingDate
                "
                class="step-status"
              >
                Forventet dato: xx/xx
              </p>
              <p v-if="step.id === 2 && shippingDate" class="step-status">
                Sidst ændret: {{ shippingDate }}
              </p>
              <p
                v-if="getStepState(step.id) === 'completed' && step.id !== 2"
                class="step-status"
              >
                Sidst ændret: {{ new Date().toLocaleDateString("da-DK") }}
              </p>
            </div>
          </div>
          <i
            v-if="canToggleStep(step.id) && step.id !== 2"
            class="fa-solid chevron-icon"
            :class="
              activeStep === step.id ? 'fa-chevron-up' : 'fa-chevron-down'
            "
          ></i>
        </div>
        <div
          v-if="
            activeStep === step.id && canToggleStep(step.id) && step.id !== 2
          "
          class="accordion-content"
        >
          <SalesStep
            v-if="step.component === 'SalesStep'"
            :process-id="process.id"
            :current-user-id="currentUserId || process.userId || 0"
            :sale="process.sale || null"
          />
          <div v-else class="placeholder">
            {{ step.component }} - Content coming soon
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.single-process-container {
  padding: 2rem;

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    margin-bottom: 1.5rem;
    background-color: #204485;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #0b5ed7;
    }

    i {
      font-size: 1.2rem;
    }
  }

  h1 {
    margin-bottom: 1.5rem;
  }

  p {
    margin-bottom: 1rem;
    font-size: 1rem;
  }

  .progress-bar {
    height: 8px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 1.5rem;
    margin-bottom: 2rem;

    .progress-fill {
      height: 100%;
      background-color: #4caf50;
      transition: width 0.3s ease;
    }
  }

  .steps-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .step-accordion {
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;

      &.state-completed {
        .accordion-header {
          background-color: #204485;
          color: white;

          .step-icon {
            color: white;
          }

          .step-text h3 {
            color: white;
          }

          .step-status {
            color: rgba(255, 255, 255, 0.9);
          }

          .chevron-icon {
            color: white;
          }

          &:hover {
            background-color: #1a3767;
          }
        }
      }

      &.state-active {
        .accordion-header {
          background-color: #89cff0;
          color: #333;

          .step-icon {
            color: #333;
          }

          .step-text h3 {
            color: #333;
          }

          .step-status {
            color: #555;
          }

          .chevron-icon {
            color: #333;
          }

          &:hover {
            background-color: #6fb8d9;
          }
        }
      }

      &.state-locked {
        .accordion-header {
          background-color: #808080;
          color: white;
          cursor: not-allowed;

          .step-icon {
            color: white;
          }

          .step-text h3 {
            color: white;
          }

          &:hover {
            background-color: #808080;
          }
        }
      }

      .accordion-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        cursor: pointer;
        transition: background-color 0.2s ease;

        &.not-allowed {
          cursor: not-allowed;
        }

        &.no-expand {
          cursor: default;
        }

        .step-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;

          .step-icon {
            font-size: 1.75rem;
            flex-shrink: 0;
          }

          .step-text {
            flex: 1;

            h3 {
              margin: 0 0 0.25rem 0;
              font-size: 1.125rem;
              font-weight: 600;
            }

            .step-status {
              margin: 0;
              font-size: 0.875rem;
              opacity: 0.9;
            }
          }
        }

        .chevron-icon {
          font-size: 1.25rem;
          transition: transform 0.3s ease;
          flex-shrink: 0;
          margin-left: 1rem;
        }
      }

      .accordion-content {
        padding: 1.5rem;
        background-color: white;
        border-top: 1px solid #e0e0e0;
        animation: slideDown 0.3s ease;

        .placeholder {
          padding: 2rem;
          text-align: center;
          color: #6b7280;
          font-style: italic;
        }
      }
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .single-process-container {
    padding: 1rem;

    .steps-container {
      .step-accordion {
        .accordion-header {
          padding: 1rem;

          .step-info {
            h3 {
              font-size: 1rem;
            }
          }
        }

        .accordion-content {
          padding: 1rem;
        }
      }
    }
  }
}
</style>
