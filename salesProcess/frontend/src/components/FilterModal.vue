<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  processes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "apply-filter"]);
const { getAuthHeader } = useAuth();

// Filter dropdown data from backend
const filterOptionsData = ref({
  salesManagers: [],
  industries: [],
  countries: [],
  customers: [],
  filterTypes: [],
  fanTypes: [],
});

// System filters
const selectedStep = ref([]);
const selectedSalesManager = ref([]);
const selectedYear = ref([]);
const selectedMonth = ref([]);
const selectedConsent = ref([]);

// Customer Attr. filters
const selectedIndustry = ref([]);
const selectedCountry = ref([]);
const selectedCustomer = ref([]);

// Specification filters
const selectedFilter = ref([]);
const selectedVentilation = ref([]);
const extractionVolumeFrom = ref("");
const extractionVolumeTo = ref("");
const volumeFlowFrom = ref("");
const volumeFlowTo = ref("");

// Fetch filter options from backend
onMounted(async () => {
  try {
    const response = await fetch("/api/processes/filter-options", {
      headers: getAuthHeader(),
    });
    if (response.ok) {
      filterOptionsData.value = await response.json();
    }
  } catch (error) {
    console.error("Error fetching filter options:", error);
  }
});

// Computed properties for dropdowns
const steps = computed(() => [1, 2, 3, 4, 5, 6]);

const salesManagers = computed(() => filterOptionsData.value.salesManagers);

const years = computed(() => {
  const yearSet = new Set();
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    yearSet.add(i);
  }
  return Array.from(yearSet).sort();
});

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const industries = computed(() => filterOptionsData.value.industries);

const countries = computed(() => filterOptionsData.value.countries);

const customers = computed(() => filterOptionsData.value.customers);

const filters = computed(() => filterOptionsData.value.filterTypes);

const ventilations = computed(() => filterOptionsData.value.fanTypes);

// Industry labels mapping
const industryLabels = {
  woodworking: "Woodworking",
  agroAndMilling: "Agro- and Milling",
  recycling: "Recycling",
  metalworking: "Metalworking",
  paper: "Paper",
  other: "Other",
};

function getIndustryLabel(value) {
  return industryLabels[value] || value;
}

function applyFilter() {
  const filterData = {
    step: selectedStep.value,
    salesManager: selectedSalesManager.value,
    year: selectedYear.value,
    month: selectedMonth.value,
    consent: selectedConsent.value,
    industry: selectedIndustry.value,
    country: selectedCountry.value,
    customer: selectedCustomer.value,
    productGroup: selectedFilter.value,
    ventilation: selectedVentilation.value,
    extractionVolumeFrom: extractionVolumeFrom.value,
    extractionVolumeTo: extractionVolumeTo.value,
    volumeFlowFrom: volumeFlowFrom.value,
    volumeFlowTo: volumeFlowTo.value,
  };
  emit("apply-filter", filterData);
  emit("close");
}

function resetFilters() {
  selectedStep.value = [];
  selectedSalesManager.value = [];
  selectedYear.value = [];
  selectedMonth.value = [];
  selectedConsent.value = [];
  selectedIndustry.value = [];
  selectedCountry.value = [];
  selectedCustomer.value = [];
  selectedFilter.value = [];
  selectedVentilation.value = [];
  extractionVolumeFrom.value = "";
  extractionVolumeTo.value = "";
  volumeFlowFrom.value = "";
  volumeFlowTo.value = "";
}

function closeModal() {
  emit("close");
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Filter Processes</h2>
        <button class="close-btn" @click="closeModal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- System Group -->
        <div class="filter-section">
          <h3>System</h3>
          <div class="filter-group">
            <label for="step">Step</label>
            <select
              id="step"
              v-model="selectedStep"
              class="filter-select"
              multiple
            >
              <option value="">All Steps</option>
              <option v-for="step in steps" :key="step" :value="String(step)">
                Step {{ step }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="salesManager">Sales Mng.</label>
            <select
              id="salesManager"
              v-model="selectedSalesManager"
              class="filter-select"
              multiple
            >
              <option value="">All</option>
              <option
                v-for="manager in salesManagers"
                :key="manager.id"
                :value="String(manager.id)"
              >
                {{ manager.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="year">Year</label>
            <select
              id="year"
              v-model="selectedYear"
              class="filter-select"
              multiple
            >
              <option value="">All Years</option>
              <option v-for="year in years" :key="year" :value="String(year)">
                {{ year }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="month">Month</label>
            <select
              id="month"
              v-model="selectedMonth"
              class="filter-select"
              multiple
            >
              <option value="">All Months</option>
              <option v-for="m in months" :key="m.value" :value="m.value">
                {{ m.label }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="consent">Consent</label>
            <select
              id="consent"
              v-model="selectedConsent"
              class="filter-select"
              multiple
            >
              <option value="">All</option>
              <option value="true">Has Consent</option>
              <option value="false">No Consent</option>
            </select>
          </div>
        </div>

        <!-- Customer Attr. Group -->
        <div class="filter-section">
          <h3>Customer Attr.</h3>
          <div class="filter-group">
            <label for="industry">Industry</label>
            <select
              id="industry"
              v-model="selectedIndustry"
              class="filter-select"
              multiple
            >
              <option value="">All</option>
              <option
                v-for="industry in industries"
                :key="industry"
                :value="industry"
              >
                {{ getIndustryLabel(industry) }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="country">Country</label>
            <select
              id="country"
              v-model="selectedCountry"
              class="filter-select"
              multiple
            >
              <option value="">All</option>
              <option
                v-for="country in countries"
                :key="country"
                :value="country"
              >
                {{ country }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="customer">Customer</label>
            <select
              id="customer"
              v-model="selectedCustomer"
              class="filter-select"
              multiple
            >
              <option value="">All</option>
              <option
                v-for="customer in customers"
                :key="customer"
                :value="customer"
              >
                {{ customer }}
              </option>
            </select>
          </div>
        </div>

        <!-- Specification Group -->
        <div class="filter-section">
          <h3>Specification</h3>
          <div class="filter-group">
            <label for="productGroup">Filter</label>
            <select
              id="productGroup"
              v-model="selectedFilter"
              class="filter-select"
              multiple
            >
              <option value="">All</option>
              <option v-for="filter in filters" :key="filter" :value="filter">
                {{ filter }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="ventilation">Ventilation</label>
            <select
              id="ventilation"
              v-model="selectedVentilation"
              class="filter-select"
              multiple
            >
              <option value="">All</option>
              <option
                v-for="ventilation in ventilations"
                :key="ventilation"
                :value="ventilation"
              >
                {{ ventilation }}
              </option>
            </select>
          </div>

          <div class="filter-group-range">
            <label>Tot. Extr. Vol.</label>
            <div class="range-inputs">
              <input
                v-model="extractionVolumeFrom"
                type="number"
                placeholder="From"
                class="filter-input"
              />
              <span class="range-separator">-</span>
              <input
                v-model="extractionVolumeTo"
                type="number"
                placeholder="To"
                class="filter-input"
              />
            </div>
          </div>

          <div class="filter-group-range">
            <label>Volume flow</label>
            <div class="range-inputs">
              <input
                v-model="volumeFlowFrom"
                type="number"
                placeholder="From"
                class="filter-input"
              />
              <span class="range-separator">-</span>
              <input
                v-model="volumeFlowTo"
                type="number"
                placeholder="To"
                class="filter-input"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-reset" @click="resetFilters">Reset</button>
        <div class="action-buttons">
          <button class="btn-cancel" @click="closeModal">Cancel</button>
          <button class="btn-apply" @click="applyFilter">Apply</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0;
  }
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
      font-weight: 500;
      font-size: 0.9rem;
      color: #333;
    }

    .filter-select {
      padding: 0.75rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 0.95rem;
      cursor: pointer;
      transition: border-color 0.2s ease;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: #204485;
        box-shadow: 0 0 0 3px rgba(32, 68, 133, 0.1);
      }
    }
  }

  .filter-group-range {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
      font-weight: 500;
      font-size: 0.9rem;
      color: #333;
    }

    .range-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .filter-input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-size: 0.95rem;
        transition: border-color 0.2s ease;

        &:focus {
          outline: none;
          border-color: #204485;
          box-shadow: 0 0 0 3px rgba(32, 68, 133, 0.1);
        }

        &::placeholder {
          color: #999;
        }
      }

      .range-separator {
        color: #999;
        font-weight: 500;
      }
    }
  }
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  .btn-reset {
    padding: 0.75rem 1.5rem;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    color: #333;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f8f9fa;
      border-color: #204485;
    }
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
  }

  .btn-cancel {
    padding: 0.75rem 1.5rem;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    color: #333;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f8f9fa;
      border-color: #204485;
    }
  }

  .btn-apply {
    padding: 0.75rem 1.5rem;
    background-color: #204485;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    color: white;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #1a3a6b;
    }
  }
}
</style>
