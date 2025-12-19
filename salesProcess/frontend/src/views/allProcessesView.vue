<script setup>
import { ref, computed, onMounted, watch, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProcessCard from "@/components/ProcessCard.vue";
import FilterModal from "@/components/FilterModal.vue";
import { useAuth } from "@/composables/useAuth";

const { getAuthHeader, isMarketingManager } = useAuth();
const route = useRoute();
const router = useRouter();
const searchQuery = ref("");
const allProcesses = ref([]);
const activeTab = ref("ongoing");
const marketingManagerCount = inject("marketingManagerCount");
const isFilterModalOpen = ref(false);
const activeFilters = ref({
  step: [],
  salesManager: [],
  year: [],
  month: [],
  industry: [],
  country: [],
  customer: [],
  productGroup: [],
  ventilation: [],
  extractionVolumeFrom: "",
  extractionVolumeTo: "",
  volumeFlowFrom: "",
  volumeFlowTo: "",
});

const fetchProcesses = async () => {
  try {
    const response = await fetch("/api/processes", {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await response.json();
    allProcesses.value = data;
  } catch (error) {
    console.error("Error fetching processes:", error);
  }
};

// Watch route query for tab changes
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) {
      activeTab.value = newTab;
    }
  },
  { immediate: true }
);

onMounted(() => {
  fetchProcesses();
});

// Refresh data when returning to the view
watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/all-processes") {
      fetchProcesses();
    }
  }
);

const filteredProcesses = computed(() => {
  let filtered = allProcesses.value;

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((process) => {
      const sale = process.sale;
      return (
        process.title.toLowerCase().includes(query) ||
        process.caseNo.toString().includes(query) ||
        process.status.toLowerCase().includes(query) ||
        sale?.description?.toLowerCase().includes(query) ||
        sale?.endUser?.toLowerCase().includes(query) ||
        sale?.country?.toLowerCase().includes(query) ||
        sale?.industry?.toLowerCase().includes(query) ||
        sale?.customIndustry?.toLowerCase().includes(query) ||
        sale?.plantType?.toLowerCase().includes(query) ||
        sale?.filterType?.toLowerCase().includes(query) ||
        sale?.fanType?.toLowerCase().includes(query) ||
        sale?.dustType?.toLowerCase().includes(query) ||
        sale?.ductSystem?.toLowerCase().includes(query) ||
        sale?.totalExtractionVolume?.toString().includes(query) ||
        sale?.pressure?.toString().includes(query) ||
        sale?.volumeFlow?.toString().includes(query) ||
        sale?.phoneNumber?.includes(query) ||
        sale?.customer?.name?.toLowerCase().includes(query) ||
        sale?.salesManager?.name?.toLowerCase().includes(query) ||
        sale?.saleProducts?.some((sp) =>
          sp.product?.title?.toLowerCase().includes(query)
        )
      );
    });
  }

  // Apply step filter
  if (activeFilters.value.step && activeFilters.value.step.length > 0) {
    filtered = filtered.filter((process) =>
      activeFilters.value.step.includes(String(process.currentStep))
    );
  }

  // Apply sales manager filter
  if (
    activeFilters.value.salesManager &&
    activeFilters.value.salesManager.length > 0
  ) {
    filtered = filtered.filter((process) =>
      activeFilters.value.salesManager.includes(
        String(process.sale?.salesManager?.id)
      )
    );
  }

  // Apply year filter
  if (activeFilters.value.year && activeFilters.value.year.length > 0) {
    filtered = filtered.filter((process) => {
      const year = new Date(process.createdAt).getFullYear();
      return activeFilters.value.year.includes(String(year));
    });
  }

  // Apply month filter
  if (activeFilters.value.month && activeFilters.value.month.length > 0) {
    filtered = filtered.filter((process) => {
      const month = String(new Date(process.createdAt).getMonth() + 1).padStart(
        2,
        "0"
      );
      return activeFilters.value.month.includes(month);
    });
  }

  // Apply industry filter
  if (activeFilters.value.industry && activeFilters.value.industry.length > 0) {
    filtered = filtered.filter((process) =>
      activeFilters.value.industry.includes(process.sale?.industry)
    );
  }

  // Apply country filter
  if (activeFilters.value.country && activeFilters.value.country.length > 0) {
    filtered = filtered.filter((process) =>
      activeFilters.value.country.includes(process.sale?.country)
    );
  }

  // Apply customer filter
  if (activeFilters.value.customer && activeFilters.value.customer.length > 0) {
    filtered = filtered.filter((process) =>
      activeFilters.value.customer.includes(process.sale?.customer?.name)
    );
  }

  // Apply filter product type
  if (
    activeFilters.value.productGroup &&
    activeFilters.value.productGroup.length > 0
  ) {
    filtered = filtered.filter((process) => {
      return process.sale?.saleProducts?.some((sp) =>
        activeFilters.value.productGroup.includes(sp.product?.title)
      );
    });
  }

  // Apply ventilation product type
  if (
    activeFilters.value.ventilation &&
    activeFilters.value.ventilation.length > 0
  ) {
    filtered = filtered.filter((process) => {
      return process.sale?.saleProducts?.some((sp) =>
        activeFilters.value.ventilation.includes(sp.product?.title)
      );
    });
  }

  // Apply extraction volume range filter
  if (
    activeFilters.value.extractionVolumeFrom ||
    activeFilters.value.extractionVolumeTo
  ) {
    filtered = filtered.filter((process) => {
      const extractionVolume = process.sale?.totalExtractionVolume;
      if (!extractionVolume) return false;

      if (
        activeFilters.value.extractionVolumeFrom &&
        extractionVolume < parseInt(activeFilters.value.extractionVolumeFrom)
      ) {
        return false;
      }
      if (
        activeFilters.value.extractionVolumeTo &&
        extractionVolume > parseInt(activeFilters.value.extractionVolumeTo)
      ) {
        return false;
      }
      return true;
    });
  }

  // Apply volume flow range filter
  if (activeFilters.value.volumeFlowFrom || activeFilters.value.volumeFlowTo) {
    filtered = filtered.filter((process) => {
      const volumeFlow = process.sale?.volumeFlow;
      if (!volumeFlow) return false;

      if (
        activeFilters.value.volumeFlowFrom &&
        volumeFlow < parseInt(activeFilters.value.volumeFlowFrom)
      ) {
        return false;
      }
      if (
        activeFilters.value.volumeFlowTo &&
        volumeFlow > parseInt(activeFilters.value.volumeFlowTo)
      ) {
        return false;
      }
      return true;
    });
  }

  return filtered;
});

const ongoingProcesses = computed(() => {
  return filteredProcesses.value.filter(
    (process) => process.status !== "completed" && process.status !== "done"
  );
});

// Update the injected count for marketing managers whenever ongoing processes change
watch(
  ongoingProcesses,
  (newOngoing) => {
    if (isMarketingManager && marketingManagerCount) {
      marketingManagerCount.value = newOngoing.length;
    }
  },
  { immediate: true }
);

const completedProcesses = computed(() => {
  return filteredProcesses.value.filter(
    (process) => process.status === "completed" || process.status === "done"
  );
});

const displayedProcesses = computed(() => {
  return activeTab.value === "ongoing"
    ? ongoingProcesses.value
    : completedProcesses.value;
});

const tabLabel = computed(() => {
  return activeTab.value === "ongoing" ? "Ongoing" : "Completed";
});

// Helper to get the number of steps for a process
function getStepCount(process) {
  return process.consent ? 6 : 5;
}

function handleApplyFilter(filters) {
  activeFilters.value = { ...filters };
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
      </div>
      <button class="filter-btn" @click="isFilterModalOpen = true">
        <i class="fa-solid fa-sliders"></i>
        Filter
      </button>
    </div>

    <FilterModal
      :isOpen="isFilterModalOpen"
      :processes="allProcesses"
      @close="isFilterModalOpen = false"
      @apply-filter="handleApplyFilter"
    />

    <!-- Tab Content -->
    <div class="section">
      <h2>{{ tabLabel }}</h2>
      <div class="cards-grid">
        <ProcessCard
          v-for="process in displayedProcesses"
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
    </div>
  </div>
</template>

<style scoped lang="scss">
.processes-container {
  padding: 2rem;

  h1 {
    margin-bottom: 2rem;
    color: #333;
  }

  .search-filter-bar {
    margin-bottom: 2rem;
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .search-container {
    flex: 1;
    position: relative;
    max-width: 500px;

    .search-input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      font-size: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      transition: border-color 0.3s ease;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: #204485;
        box-shadow: 0 0 0 3px rgba(32, 68, 133, 0.1);
      }

      &::placeholder {
        color: #999;
      }
    }

    .search-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
      pointer-events: none;
      font-size: 1rem;
    }
  }

  .filter-btn {
    padding: 0.75rem 1.25rem;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    color: #333;
    transition: all 0.2s ease;
    font-weight: 500;
    white-space: nowrap;

    &:hover {
      border-color: #204485;
      background-color: #f8f9fa;
    }

    i {
      font-size: 1rem;
    }
  }

  .section {
    margin-bottom: 3rem;

    h2 {
      margin-bottom: 1.5rem;
      color: #333;
      font-size: 1.3rem;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 0.75rem;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;

      .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 2rem;
        color: #666;

        p {
          margin: 0;
          font-size: 1.1rem;
        }
      }
    }
  }
}
</style>
