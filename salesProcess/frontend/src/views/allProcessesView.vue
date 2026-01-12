<script setup>
import { ref, computed, onMounted, watch, inject } from "vue";
import { useRoute } from "vue-router";
import ProcessCard from "@/components/ProcessCard.vue";
import FilterModal from "@/components/FilterModal.vue";
import { useAuth } from "@/utils/useAuth";
import { createFilterState, applyFilters, resetFilters as resetFiltersUtil } from "@/utils/processFilters";

const { isMarketingManager } = useAuth();
const route = useRoute();
const searchQuery = ref("");
const searchDisplayText = ref("");
let delayTimer = null;
const allProcesses = ref([]);
const activeTab = ref("ongoing");
const marketingManagerCount = inject("marketingManagerCount");
const isFilterModalOpen = ref(false);
const displayCount = ref(6);
const activeFilters = ref(createFilterState());

const fetchProcesses = async () => {
  try {
    const response = await fetch("/api/processes", {
      credentials: 'include',
    });
    const data = await response.json();
    allProcesses.value = data;
  } catch (error) {
    console.error("Error fetching processes:", error);
  }
};

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) {
      activeTab.value = newTab;
    }
  },
  { immediate: true }
);

// Search result text
watch(searchQuery, (newValue) => {
  if (delayTimer) {
    clearTimeout(delayTimer);
  }

  if (newValue.trim()) {
    delayTimer = setTimeout(() => {
      searchDisplayText.value = newValue;
    }, 1000);
  } else {
    searchDisplayText.value = "";
  }
});

onMounted(() => {
  fetchProcesses();
});

watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/all-processes") {
      fetchProcesses();
    }
  }
);

const filteredProcesses = computed(() => {
  return applyFilters(allProcesses.value, activeFilters.value, searchDisplayText.value);
});

const actionsRequiredProcesses = computed(() => {
  // Steps that require marketingManagers: 3 (product images), 5 (case & references), 6 (case upload)
  const marketingManagerSteps = [3, 5, 6];
  return filteredProcesses.value.filter(
    (process) =>
      marketingManagerSteps.includes(parseInt(process.currentStep)) &&
      process.status !== "completed"
  );
});

const ongoingProcesses = computed(() => {
  return filteredProcesses.value.filter(
    (process) => process.status !== "completed"
  );
});

// Update marketing manager count
watch(
  actionsRequiredProcesses,
  (newActionsRequired) => {
    if (isMarketingManager && marketingManagerCount) {
      marketingManagerCount.value = newActionsRequired.length;
    }
  },
  { immediate: true }
);

const completedProcesses = computed(() => {
  return filteredProcesses.value.filter(
    (process) => process.status === "completed"
  );
});

const displayedProcesses = computed(() => {
  return activeTab.value === "ongoing"
    ? ongoingProcesses.value
    : completedProcesses.value;
});

const paginatedProcesses = computed(() => {
  return displayedProcesses.value.slice(0, displayCount.value);
});

const hasMoreProcesses = computed(() => {
  return displayedProcesses.value.length > displayCount.value;
});

const showMore = () => {
  displayCount.value += 6;
};

const tabLabel = computed(() => {
  return activeTab.value === "ongoing" ? "Ongoing" : "Completed";
});

function getStepCount(process) {
  return process.consent ? 6 : 5;
}

function handleApplyFilter(filters) {
  activeFilters.value = { ...filters };
}

function resetFilters() {
  resetFiltersUtil(activeFilters);
}
</script>

<template>
  <div class="processes-container">
    <h1>All Processes</h1>
    <div class="search-filter-bar">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, case number, or date..."
          class="search-input"
        />
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <p v-if="searchDisplayText" class="search-result-text">
          Viser resultater for: {{ searchDisplayText }}
        </p>
      </div>
      <div class="filters-container">
        <div class="filter-buttons">
        <button class="filter-btn" @click="isFilterModalOpen = true">
          <i class="fa-solid fa-sliders"></i>
          Filter
        </button>
        <button v-if="Object.values(activeFilters).some(value => (Array.isArray(value) ? value.length > 0 : value))" class="filter-btn" @click="resetFilters">Reset Filters</button>
        </div>
        <div class="active-filters">
          <div v-if="activeFilters.step.length > 0" class="filter-item">
            <strong>Step:</strong> {{ activeFilters.step.join(", ") }}
          </div>
          <div v-if="activeFilters.salesManager.length > 0" class="filter-item">
            <strong>Sales Manager:</strong>
            {{ activeFilters.salesManager.join(", ") }}
          </div>
          <div v-if="activeFilters.year.length > 0" class="filter-item">
            <strong>Year:</strong> {{ activeFilters.year.join(", ") }}
          </div>
          <div v-if="activeFilters.month.length > 0" class="filter-item">
            <strong>Month:</strong> {{ activeFilters.month.join(", ") }}
          </div>
          <div v-if="activeFilters.consent.length > 0" class="filter-item">
            <strong>Consent:</strong> {{ activeFilters.consent.join(", ") }}
          </div>
          <div v-if="activeFilters.industry.length > 0" class="filter-item">
            <strong>Industry:</strong> {{ activeFilters.industry.join(", ") }}
          </div>
          <div v-if="activeFilters.country.length > 0" class="filter-item">
            <strong>Country:</strong> {{ activeFilters.country.join(", ") }}
          </div>
          <div v-if="activeFilters.customer.length > 0" class="filter-item">
            <strong>Customer:</strong> {{ activeFilters.customer.join(", ") }}
          </div>
          <div v-if="activeFilters.productGroup.length > 0" class="filter-item">
            <strong>Product Group:</strong>
            {{ activeFilters.productGroup.join(", ") }}
          </div>
          <div v-if="activeFilters.ventilation.length > 0" class="filter-item">
            <strong>Ventilation:</strong>
            {{ activeFilters.ventilation.join(", ") }}
          </div>
          <div
            v-if="
              activeFilters.extractionVolumeFrom ||
              activeFilters.extractionVolumeTo
            "
            class="filter-item"
          >
            <strong>Extraction Volume:</strong>
            {{ activeFilters.extractionVolumeFrom || "0" }} -
            {{ activeFilters.extractionVolumeTo || "∞" }}
          </div>
          <div
            v-if="activeFilters.volumeFlowFrom || activeFilters.volumeFlowTo"
            class="filter-item"
          >
            <strong>Volume Flow:</strong>
            {{ activeFilters.volumeFlowFrom || "0" }} -
            {{ activeFilters.volumeFlowTo || "∞" }}
          </div>
        </div>
      </div>
    </div>

    <FilterModal
      :isOpen="isFilterModalOpen"
      :processes="allProcesses"
      @close="isFilterModalOpen = false"
      @apply-filter="handleApplyFilter"
    />

    <!-- Actions Required Section -->
    <div
      v-if="
        isMarketingManager &&
        actionsRequiredProcesses.length > 0 &&
        activeTab === 'ongoing'
      "
      class="section actions-required-section"
    >
      <div class="cards-grid required-cards-grid">
        <h2>Actions Required</h2>
        <ProcessCard
          v-for="process in actionsRequiredProcesses"
          :key="process.id"
          :id="process.id"
          :name="process.title"
          :caseNumber="process.caseNo"
          :createdAt="
            new Date(process.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          "
          :step="process.currentStep"
          :status="process.status"
        />
      </div>
    </div>

    <!-- Tab Content -->
    <div class="section">
      <div class="cards-grid">
        <h2>{{ tabLabel }}</h2>
        <ProcessCard
          v-for="process in paginatedProcesses"
          :key="process.id"
          :id="process.id"
          :name="process.title"
          :caseNumber="process.caseNo"
          :createdAt="
            new Date(process.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          "
          :step="process.currentStep"
          :totalSteps="getStepCount(process)"
          :status="process.status"
        />
        <div v-if="displayedProcesses.length === 0" class="no-results">
          <p>No {{ tabLabel.toLowerCase() }} processes found.</p>
        </div>
      </div>
      <div class="show-more-container">
        <button v-if="hasMoreProcesses" @click="showMore" class="show-more-btn">
          Show More
          <i class="fa-solid fa-chevron-down"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
