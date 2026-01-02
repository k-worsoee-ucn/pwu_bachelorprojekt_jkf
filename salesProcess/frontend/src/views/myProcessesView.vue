<script setup>
import { ref, computed, onMounted, watch, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProcessCard from "@/components/ProcessCard.vue";
import FilterModal from "@/components/FilterModal.vue";
import { useAuth } from "@/composables/useAuth";

const { user } = useAuth();
const route = useRoute();
const router = useRouter();
const searchQuery = ref("");
const searchDisplayText = ref("");
let debounceTimer = null;
const allProcesses = ref([]);
const activeTab = ref("ongoing");
const salesManagerCount = inject("salesManagerCount");
const isFilterModalOpen = ref(false);
const displayCount = ref(6); // Number of processes to show initially
const activeFilters = ref({
  step: [],
  salesManager: [],
  year: [],
  month: [],
  consent: [],
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
      credentials: 'include',
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

// Debounce search display text
watch(searchQuery, (newValue) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  if (newValue.trim()) {
    debounceTimer = setTimeout(() => {
      searchDisplayText.value = newValue;
    }, 1000);
  } else {
    searchDisplayText.value = "";
  }
});

onMounted(() => {
  fetchProcesses();
});

// Refresh data when returning to the view
watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/my-processes") {
      fetchProcesses();
    }
  }
);

const userProcesses = computed(() => {
  if (!user.value?.id) return [];
  return allProcesses.value.filter(
    (process) => process.sale?.salesManager?.id === user.value.id
  );
});

const filteredProcesses = computed(() => {
  let filtered = userProcesses.value;

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

  // Apply sales manager filter (though this is my processes, so usually only one)
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

  // Apply consent filter
  if (activeFilters.value.consent && activeFilters.value.consent.length > 0) {
    filtered = filtered.filter((process) => {
      const consentValue = process.consent ? "true" : "false";
      return activeFilters.value.consent.includes(consentValue);
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

const actionsRequiredProcesses = computed(() => {
  // Steps that require salesManager action: 1 (sales creation) and 4 (installation images)
  const salesManagerSteps = [1, 4];
  return filteredProcesses.value.filter(
    (process) =>
      salesManagerSteps.includes(parseInt(process.currentStep)) &&
      process.status !== "completed"
  );
});

const ongoingProcesses = computed(() => {
  return filteredProcesses.value.filter((process) => process.currentStep < 6);
});

const completedProcesses = computed(() => {
  return filteredProcesses.value.filter((process) => process.currentStep === 6);
});

// Update the injected count whenever actions required processes change
watch(
  actionsRequiredProcesses,
  (newActionsRequired) => {
    if (salesManagerCount) {
      salesManagerCount.value = newActionsRequired.length;
    }
  },
  { immediate: true }
);

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

function handleApplyFilter(filters) {
  activeFilters.value = { ...filters };
}
</script>

<template>
  <div class="processes-container">
    <h1>My Processes</h1>
    <div class="search-filter-bar">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, case number, or date..."
          class="search-input"
        />
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <p v-if="searchDisplayText" class="search-result-text">Viser resultater for: {{ searchDisplayText }}</p>
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

    <!-- Actions Required Section -->
    <div
      v-if="actionsRequiredProcesses.length > 0 && activeTab === 'ongoing'"
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

<style scoped lang="scss">

</style>