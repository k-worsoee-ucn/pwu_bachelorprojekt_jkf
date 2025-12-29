<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import SalesStep from "@/components/SalesStep.vue";
import ProdImgStep from "@/components/ProdImgStep.vue";
import InstallImgStep from "@/components/InstallImgStep.vue";
import CaseRefStep from "@/components/CaseRefStep.vue";
import CaseUploadStep from "@/components/CaseUploadStep.vue";

const route = useRoute();
const router = useRouter();
const { getAuthHeader, user, isViewer } = useAuth();
const processId = computed(() => route.params.id);

const process = ref(null);
const isNewSale = computed(() => processId.value === "new");
const activeStep = ref(null);
const shippingDate = ref(null); // Mock shipping date for production step
const currentUserId = ref(null);
let shippingDateTimer = null;

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

const statusLabels = {
  completed: "Completed",
  ongoing: "Ongoing",
  locked: "Locked",
};

const roleLabels = {
  salesManager: "Sales Manager",
  marketingManager: "Marketing Manager",
  viewer: "Viewer",
};

const visibleSteps = computed(() => {
  // If no process or consent is false, filter out step 6
  if (!process.value?.consent) {
    return steps.filter((step) => step.id !== 6);
  }
  return steps;
});

const getCurrentStep = () => {
  if (isNewSale.value) return 1;
  return process.value?.currentStep || 1;
};

const getStepState = (stepId) => {
  const currentStep = getCurrentStep();
  const isDone =
    process.value?.status === "done" || process.value?.status === "completed";

  // If process is done and we're on step 6, mark it as completed
  if (isDone && currentStep === 6 && stepId === 6) return "completed";

  // If process is done on step 5 without consent, mark step 5 as completed
  if (isDone && currentStep === 5 && !process.value?.consent && stepId === 5)
    return "completed";

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
  // Allow toggling if not locked (allow completed and active steps)
  return state !== "locked";
};

const toggleStep = (stepId) => {
  if (stepId === 2) return;

  if (!canToggleStep(stepId)) return;

  if (activeStep.value === stepId) {
    activeStep.value = null;
  } else {
    activeStep.value = stepId;
  }
};

const getStatusMessage = computed(() => {
  if (!process.value) return "";

  if (process.value.status === "completed" || process.value.status === "done") {
    return "Completed";
  }

  const step = process.value.currentStep;

  switch (step) {
    case 1:
      return "Creating Sale";
    case 2:
      return "In Production";
    case 3:
      return "Awaiting Product Images";
    case 4:
      return "Awaiting Installation Images & Consent";
    case 5:
      return "Creating Case & Reference";
    case 6:
      return "Awaiting Case Upload";
    default:
      return process.value.status;
  }
});

const fetchProcess = async () => {
  if (!isNewSale.value && processId.value && processId.value !== "new") {
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

      // Load shipping date if it exists
      if (data.shippingDate) {
        shippingDate.value = data.shippingDate;
      }

      if (data.currentStep === 2 && !shippingDate.value) {
        startShippingDateTimer();
      }
    } catch (error) {
      console.error("Error fetching process:", error);
    }
  } else {
    process.value = null;
  }
};

const startShippingDateTimer = () => {
  if (shippingDateTimer) {
    clearTimeout(shippingDateTimer);
  }

  shippingDateTimer = setTimeout(async () => {
    // Generate a mock shipping date (7 days from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    shippingDate.value = futureDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    console.log("Mock shipping date set:", shippingDate.value);

    // Save shipping date to database
    try {
      const response = await fetch(`/api/processes/${process.value.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          shippingDate: shippingDate.value,
        }),
      });

      if (response.ok) {
        const updatedProcess = await response.json();
        process.value = updatedProcess;
        console.log("Shipping date saved to database");
      }
    } catch (error) {
      console.error("Error saving shipping date:", error);
    }

    // Production step is now complete, advance to next step
    // Only advance from step 2 to step 3, but step 3 requires manual advancement
    if (process.value.currentStep === 2) {
      await advanceToNextStep();
    }
  }, 5000); // 5 seconds
};

const advanceToNextStep = async () => {
  if (!process.value) return;

  const currentStep = process.value.currentStep;
  const nextStep = currentStep + 1;

  // If on step 6, mark process as complete
  if (currentStep === 6) {
    console.log("Completing process...");
    try {
      const response = await fetch(`/api/processes/${process.value.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          currentStep: 6,
          status: "completed",
        }),
      });

      if (response.ok) {
        const updatedProcess = await response.json();
        process.value = updatedProcess;
        activeStep.value = null; // Close the accordion
        console.log("Process marked as complete", updatedProcess);
        // Force a refresh to ensure all computed properties update
        await fetchProcess();
      } else {
        const error = await response.json();
        console.error("Failed to complete process:", response.status, error);
      }
    } catch (error) {
      console.error("Error completing process:", error);
    }
    return;
  }

  // If on step 5 and consent is false (no step 6), mark process as complete
  if (currentStep === 5 && !process.value.consent) {
    console.log("Completing process (no consent, skipping step 6)...");
    try {
      const response = await fetch(`/api/processes/${process.value.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          currentStep: 5,
          status: "completed",
        }),
      });

      if (response.ok) {
        const updatedProcess = await response.json();
        process.value = updatedProcess;
        activeStep.value = null; // Close the accordion
        console.log("Process marked as complete", updatedProcess);
        // Force a refresh to ensure all computed properties update
        await fetchProcess();
      }
    } catch (error) {
      console.error("Error completing process:", error);
    }
    return;
  }

  // If trying to advance from step 5 but consent is false, don't allow it
  if (currentStep === 5 && nextStep === 6 && !process.value.consent) {
    console.log("Cannot advance to step 6 without consent");
    return;
  }

  // Otherwise, advance to next step
  if (nextStep > 6) {
    console.log("Process already at final step");
    return;
  }

  try {
    const response = await fetch(`/api/processes/${process.value.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ currentStep: nextStep }),
    });

    if (response.ok) {
      const updatedProcess = await response.json();
      const previousStep = process.value.currentStep;
      process.value = updatedProcess;
      console.log(
        `Process advanced from step ${previousStep} to step ${nextStep}`
      );
    }
  } catch (error) {
    console.error("Error advancing process step:", error);
  }
};

watch(
  () => route.params.id,
  async (newId, oldId) => {
    console.log("Route ID changed from", oldId, "to", newId);
    // Clear timer when route changes
    if (shippingDateTimer) {
      clearTimeout(shippingDateTimer);
      shippingDateTimer = null;
    }
    await fetchProcess();
    // Only open first step if it's a new sale
    activeStep.value = newId === "new" ? 1 : null;
  }
);

onMounted(async () => {
  if (user.value?.id) {
    currentUserId.value = user.value.id;
  }

  console.log("Route params:", route.params);
  console.log("processId:", processId.value);
  console.log("isNewSale:", isNewSale.value);

  await fetchProcess();

  console.log("Final process.value:", process.value);
  console.log("Final isNewSale.value:", isNewSale.value);
  // Only open first step if it's a new sale
  activeStep.value = isNewSale.value ? 1 : null;
});

const handleSaleCreated = (savedSale) => {
  console.log("Sale created:", savedSale);
  if (savedSale.process?.id) {
    router.push(`/processes/${savedSale.process.id}`);
  }
};

const handleStepCompleted = async () => {
  console.log("Step completed, advancing to next step");
  await advanceToNextStep();
  activeStep.value = null; // Close the accordion after completing the step
};
</script>

<template>
  <div v-if="isNewSale" class="single-process-container">
    <h1>Create New Sale</h1>
    <div class="steps-container">
      <div
        v-for="step in visibleSteps"
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
                Shipping Date: Pending
              </p>
              <p v-if="step.id === 2 && shippingDate" class="step-status">
                Shipping Date: {{ shippingDate }}
              </p>
              <p
                v-if="getStepState(step.id) === 'completed' && step.id !== 2"
                class="step-status"
              >
                Last changed: {{ new Date().toLocaleDateString("en-US") }}
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
            :disabled="isViewer"
            @sale-created="handleSaleCreated"
          />
          <ProdImgStep
            v-else-if="step.component === 'ProdImgStep'"
            :process-id="processId"
          />
          <InstallImgStep
            v-else-if="step.component === 'InstallImgStep'"
            :process-id="processId"
            :sale="null"
            :process="null"
          />
          <CaseRefStep
            v-else-if="step.component === 'CaseRefStep'"
            :process-id="processId"
            :sale="null"
            :process="null"
          />
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="process" class="single-process-container">
    <div class="process-header">
      <h1>{{ process.title }}</h1>
      <div class="status-row">
        <p><strong>Status:</strong> {{ getStatusMessage }}</p>
        <div class="sales-manager-info" v-if="process.sale?.salesManager">
          <p class="manager-name">{{ process.sale.salesManager.name }}</p>
          <p class="manager-role">
            {{
              roleLabels[process.sale.salesManager.role] ||
              process.sale.salesManager.role
            }}
          </p>
        </div>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{
            width:
              process.status === 'completed'
                ? '100%'
                : ((getCurrentStep() - 1) / visibleSteps.length) * 100 + '%',
          }"
        ></div>
        <div class="step-dots">
          <span
            v-for="(stepObj, idx) in visibleSteps.length - 1"
            :key="visibleSteps[idx + 1].id"
            class="dot"
            :class="{ active: idx < getCurrentStep() - 1 }"
            :style="{ left: ((idx + 1) / visibleSteps.length) * 100 + '%' }"
            :title="visibleSteps[idx + 1].title"
          ></span>
        </div>
      </div>
    </div>

    <div class="steps-container">
      <div
        v-for="step in visibleSteps"
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
            'production-step': step.id === 2,
          }"
        >
          <div class="step-info">
            <i class="fa-solid step-icon" :class="getStepIcon(step.id)"></i>
            <div class="step-text">
              <h3>{{ step.title }}</h3>
              <p
                v-if="getStepState(step.id) === 'completed' && step.id !== 2"
                class="step-status"
              >
                Last changed: {{ new Date().toLocaleDateString("en-US") }}
              </p>
            </div>
          </div>
          <span
            v-if="step.id === 2 && shippingDate"
            class="shipping-date-badge"
          >
            Shipping Date: {{ shippingDate }}
          </span>
          <span
            v-else-if="step.id === 2 && !shippingDate"
            class="shipping-date-badge"
          >
            Shipping Date: Pending...
          </span>
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
            :disabled="isViewer"
            @sale-updated="fetchProcess"
          />
          <ProdImgStep
            v-else-if="step.component === 'ProdImgStep'"
            :process-id="process.id"
            :disabled="isViewer"
          />
          <InstallImgStep
            v-else-if="step.component === 'InstallImgStep'"
            :process-id="process.id"
            :sale="process.sale || null"
            :process="process"
            :disabled="isViewer"
            @consent-updated="fetchProcess"
          />
          <CaseRefStep
            v-else-if="step.component === 'CaseRefStep'"
            :process-id="process.id"
            :sale="process.sale || null"
            :process="process"
            :disabled="isViewer"
          />
          <CaseUploadStep
            v-else-if="step.component === 'CaseUploadStep'"
            :process-id="process.id"
            :process="process"
            :disabled="isViewer"
          />
          <button
            v-if="step.component !== 'SalesStep'"
            @click="handleStepCompleted"
            :disabled="isViewer"
            class="btn"
          >
            Complete Step
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.single-process-container {
  padding: 2rem;

  .process-header {
    margin-bottom: 2rem;

    h1 {
      margin-bottom: 1rem;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 1rem;

      p {
        margin: 0;
      }

      .sales-manager-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .manager-name {
          margin: 0;
          font-weight: 600;
        }

        .manager-role {
          margin: 0;
          color: $neutral-500;
          font-weight: 400;
        }
      }
    }
  }

  .progress-bar {
    height: 8px;
    background-color: $neutral-500-light;
    position: relative;
    border-radius: 4px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background-color: $success-400;
      transition: width 0.3s ease;
      border-radius: 4px;
    }

    .step-dots {
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 0;
      pointer-events: auto;
    }
    .dot {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      background-color: #ffffff;
      border-radius: 50%;
      z-index: 1;
      transition: background 0.3s;
      pointer-events: auto;

      &:first-child {
        transform: translate(0%, -50%);
      }
      &:last-child {
        transform: translate(-100%, -50%);
      }
    }
    .dot.active {
      box-sizing: border-box;
      background: $success-400;
      border: 2px solid #fff;
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
          background-color: $primary-jkf-blue;
          color: white;

          .step-icon {
            color: white;
          }

          .step-text h3 {
            color: white;
          }

          .step-status {
            color: white;
          }

          .chevron-icon {
            color: white;
          }

          &:hover {
            background-color: $jkf-hover-blue;
          }
        }
      }

      &.state-active {
        .accordion-header {
          background-color: $secondary-jkf-blue;

          &:hover {
            background-color: $secondary-hover-blue;
          }
        }
      }

      &.state-locked {
        .accordion-header {
          background-color: $neutral-500;
          color: white;
          cursor: not-allowed;

          .step-icon {
            color: white;
          }

          .step-text h3 {
            color: white;
          }

          &:hover {
            background-color: $neutral-700;
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
            }

            .step-status {
              margin: 0;
            }
          }
        }

        .chevron-icon {
          font-size: 1.25rem;
          transition: transform 0.3s ease;
          flex-shrink: 0;
          margin-left: 1rem;
        }

        &.production-step {
          justify-content: flex-end;
          position: relative;

          .step-info {
            position: absolute;
            left: 1.5rem;
          }
        }

        .shipping-date-badge {
          font-size: 1.15rem;
          color: white;
        }
      }

      .accordion-content {
        padding: 1.5rem;
        background-color: white;
        animation: slideDown 0.3s ease;
        display: flex;
        flex-direction: column;

        > :not(.btn) {
          width: 100%;
        }

        .btn {
          align-self: flex-end;
          margin-top: 1.5rem;
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
