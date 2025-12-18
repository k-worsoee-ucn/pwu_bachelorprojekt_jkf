<script setup>
import { ref, computed, onMounted, watch, inject } from "vue";
import { useRoute } from "vue-router";
import ProcessCard from "@/components/ProcessCard.vue";
import { useAuth } from "@/composables/useAuth";

const { getAuthHeader, user } = useAuth();
const route = useRoute();
const searchQuery = ref("");
const allProcesses = ref([]);
const activeTab = ref("ongoing");
const salesManagerCount = inject("salesManagerCount");

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

onMounted(async () => {
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
});

const userProcesses = computed(() => {
  if (!user.value?.id) return [];
  return allProcesses.value.filter(
    (process) => process.sale?.salesManager?.id === user.value.id
  );
});

const filteredProcesses = computed(() => {
  if (!searchQuery.value.trim()) {
    return userProcesses.value;
  }

  const query = searchQuery.value.toLowerCase();
  return userProcesses.value.filter(
    (process) =>
      process.title.toLowerCase().includes(query) ||
      process.caseNo.toString().includes(query) ||
      process.status.toLowerCase().includes(query)
  );
});

const ongoingProcesses = computed(() => {
  return filteredProcesses.value.filter((process) => process.currentStep < 6);
});

const completedProcesses = computed(() => {
  return filteredProcesses.value.filter((process) => process.currentStep === 6);
});

// Update the injected count whenever ongoing processes change
watch(
  ongoingProcesses,
  (newOngoing) => {
    if (salesManagerCount) {
      salesManagerCount.value = newOngoing.length;
    }
  },
  { immediate: true }
);

const displayedProcesses = computed(() => {
  return activeTab.value === "ongoing"
    ? ongoingProcesses.value
    : completedProcesses.value;
});

const tabLabel = computed(() => {
  return activeTab.value === "ongoing" ? "Ongoing" : "Completed";
});
</script>

<template>
  <div class="processes-container">
    <h1>My Processes</h1>
    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name, case number, or date..."
        class="search-input"
      />
      <i class="fa-solid fa-magnifying-glass search-icon"></i>
    </div>

    <!-- Tab Content -->
    <div class="section">
      <div class="cards-grid">
        <ProcessCard
          v-for="process in displayedProcesses"
          :key="process.id"
          :id="process.id"
          :name="process.title"
          :caseNumber="process.caseNo"
          :startDate="process.startDate"
          :expectedEndDate="process.expectedEndDate"
          :step="process.currentStep"
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

  .search-container {
    margin-bottom: 2rem;
    position: relative;
    width: 100%;
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
