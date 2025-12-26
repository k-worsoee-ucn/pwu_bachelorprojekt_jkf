<script setup>
import { ref, computed, onMounted, watch } from "vue";
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

// Prevent page scroll when modal is open
watch(
  () => props.isOpen,
  (isOpen) => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }
);

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

// Dropdown state: only one open at a time

const openDropdownKey = ref(null); // null or string key of open dropdown

function toggleDropdown(key) {
  openDropdownKey.value = openDropdownKey.value === key ? null : key;
}

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
          <div class="filter-groups-wrapper">
            <!-- Steps -->
            <div class="filter-group">
              <div class="dropdown-container">
                <button
                  class="dropdown-button"
                  @click="toggleDropdown('step')"
                >
                  <span>Step</span>
                  <i
                    :class="[
                      'fa-solid',
                      openDropdownKey === 'step'
                        ? 'fa-chevron-up'
                        : 'fa-chevron-down',
                    ]"
                  ></i>
                </button>
                <div v-if="openDropdownKey === 'step'" class="dropdown-menu">
                  <div class="checkbox-group">
                    <label
                      v-for="step in steps"
                      :key="step"
                      class="checkbox-option"
                    >
                      <input
                        type="checkbox"
                        :value="String(step)"
                        v-model="selectedStep"
                      />
                      Step {{ step }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <!-- Sales managers -->
            <div class="filter-group">
              <div class="dropdown-container">
                <button
                  class="dropdown-button"
                  @click="toggleDropdown('salesManager')"
                >
                  <span>Sales Mng.</span>
                  <i
                    :class="[
                      'fa-solid',
                      openDropdownKey === 'salesManager'
                        ? 'fa-chevron-up'
                        : 'fa-chevron-down',
                    ]"
                  ></i>
                </button>
                <div
                  v-if="openDropdownKey === 'salesManager'"
                  class="dropdown-menu"
                >
                  <div class="checkbox-group">
                    <label
                      v-for="manager in salesManagers"
                      :key="manager.id"
                      class="checkbox-option"
                    >
                      <input
                        type="checkbox"
                        :value="String(manager.id)"
                        v-model="selectedSalesManager"
                      />
                      {{ manager.name }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <!-- Year -->
            <div class="filter-group">
              <div class="dropdown-container">
                <button
                  class="dropdown-button"
                  @click="toggleDropdown('year')"
                >
                  <span>Year</span>
                  <i
                    :class="[
                      'fa-solid',
                      openDropdownKey === 'year'
                        ? 'fa-chevron-up'
                        : 'fa-chevron-down',
                    ]"
                  ></i>
                </button>
                <div v-if="openDropdownKey === 'year'" class="dropdown-menu">
                  <div class="checkbox-group">
                    <label
                      v-for="year in years"
                      :key="year"
                      class="checkbox-option"
                    >
                      <input
                        type="checkbox"
                        :value="String(year)"
                        v-model="selectedYear"
                      />
                      {{ year }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <!-- Month -->
            <div class="filter-group">
              <div class="dropdown-container">
                <button
                  class="dropdown-button"
                  @click="toggleDropdown('month')"
                >
                  <span>Month</span>
                  <i
                    :class="[
                      'fa-solid',
                      openDropdownKey === 'month'
                        ? 'fa-chevron-up'
                        : 'fa-chevron-down',
                    ]"
                  ></i>
                </button>
                <div v-if="openDropdownKey === 'month'" class="dropdown-menu">
                  <div class="checkbox-group">
                    <label
                      v-for="m in months"
                      :key="m.value"
                      class="checkbox-option"
                    >
                      <input
                        type="checkbox"
                        :value="m.value"
                        v-model="selectedMonth"
                      />
                      {{ m.label }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <!-- Consent -->
            <div class="filter-group">
              <div class="dropdown-container">
                <button
                  class="dropdown-button"
                  @click="toggleDropdown('consent')"
                >
                  <span>Consent</span>
                  <i
                    :class="[
                      'fa-solid',
                      openDropdownKey === 'consent'
                        ? 'fa-chevron-up'
                        : 'fa-chevron-down',
                    ]"
                  ></i>
                </button>
                <div v-if="openDropdownKey === 'consent'" class="dropdown-menu">
                  <div class="checkbox-group">
                    <label class="checkbox-option">
                      <input
                        type="checkbox"
                        value="true"
                        v-model="selectedConsent"
                      />
                      Has Consent
                    </label>
                    <label class="checkbox-option">
                      <input
                        type="checkbox"
                        value="false"
                        v-model="selectedConsent"
                      />
                      No Consent
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Attr. Group -->
        <div class="filter-section">
          <h3>Customer Attr.</h3>
          <div class="filter-groups-wrapper">
            <!-- Industry -->
            <div class="filter-group">
              <div class="dropdown-container">
                <button
                  class="dropdown-button"
                  @click="toggleDropdown('industry')"
                >
                  <span>Industry</span>
                  <i
                    :class="[
                      'fa-solid',
                      openDropdownKey === 'industry'
                        ? 'fa-chevron-up'
                        : 'fa-chevron-down',
                    ]"
                  ></i>
                </button>
                <div
                  v-if="openDropdownKey === 'industry'"
                  class="dropdown-menu"
                >
                  <div class="checkbox-group">
                    <label
                      v-for="industry in industries"
                      :key="industry"
                      class="checkbox-option"
                    >
                      <input
                        type="checkbox"
                        :value="industry"
                        v-model="selectedIndustry"
                      />
                      {{ getIndustryLabel(industry) }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <!-- Country -->
            <div class="filter-group">
              <div class="dropdown-container">
                <button
                  class="dropdown-button"
                  @click="toggleDropdown('country')"
                >
                  <span>Country</span>
                  <i
                    :class="[
                      'fa-solid',
                      openDropdownKey === 'country'
                        ? 'fa-chevron-up'
                        : 'fa-chevron-down',
                    ]"
                  ></i>
                </button>
                <div v-if="openDropdownKey === 'country'" class="dropdown-menu">
                  <div class="checkbox-group">
                    <label
                      v-for="country in countries"
                      :key="country"
                      class="checkbox-option"
                    >
                      <input
                        type="checkbox"
                        :value="country"
                        v-model="selectedCountry"
                      />
                      {{ country }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <!-- Customer -->
            <div class="filter-group">
              <div class="dropdown-container">
                <button
                  class="dropdown-button"
                  @click="toggleDropdown('customer')"
                >
                  <span>Customer</span>
                  <i
                    :class="[
                      'fa-solid',
                      openDropdownKey === 'customer'
                        ? 'fa-chevron-up'
                        : 'fa-chevron-down',
                    ]"
                  ></i>
                </button>
                <div
                  v-if="openDropdownKey === 'customer'"
                  class="dropdown-menu"
                >
                  <div class="checkbox-group">
                    <label
                      v-for="customer in customers"
                      :key="customer"
                      class="checkbox-option"
                    >
                      <input
                        type="checkbox"
                        :value="customer"
                        v-model="selectedCustomer"
                      />
                      {{ customer }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Specification Group -->
        <div class="filter-section">
          <h3>Specification</h3>
          <div class="filter-groups-wrapper">
            <!-- Filter -->
            <div class="filter-group">
              <div class="dropdown-container">
                <button
                  class="dropdown-button"
                  @click="toggleDropdown('filter')"
                >
                  <span>Filter</span>
                  <i
                    :class="[
                      'fa-solid',
                      openDropdownKey === 'filter'
                        ? 'fa-chevron-up'
                        : 'fa-chevron-down',
                    ]"
                  ></i>
                </button>
                <div v-if="openDropdownKey === 'filter'" class="dropdown-menu">
                  <div class="checkbox-group">
                    <label
                      v-for="filter in filters"
                      :key="filter"
                      class="checkbox-option"
                    >
                      <input
                        type="checkbox"
                        :value="filter"
                        v-model="selectedFilter"
                      />
                      {{ filter }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <!-- Ventilation -->
            <div class="filter-group">
              <div class="dropdown-container">
                <button
                  class="dropdown-button"
                  @click="toggleDropdown('ventilation')"
                >
                  <span>Ventilation</span>
                  <i
                    :class="[
                      'fa-solid',
                      openDropdownKey === 'ventilation'
                        ? 'fa-chevron-up'
                        : 'fa-chevron-down',
                    ]"
                  ></i>
                </button>
                <div
                  v-if="openDropdownKey === 'ventilation'"
                  class="dropdown-menu"
                >
                  <div class="checkbox-group">
                    <label
                      v-for="ventilation in ventilations"
                      :key="ventilation"
                      class="checkbox-option"
                    >
                      <input
                        type="checkbox"
                        :value="ventilation"
                        v-model="selectedVentilation"
                      />
                      {{ ventilation }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <!-- Extraction Volume -->
            <div class="filter-group">
              <div class="dropdown-container">
                <button
                  class="dropdown-button"
                  @click="toggleDropdown('extractionVolume')"
                >
                  <span>Tot. Extr. Vol.</span>
                  <i
                    :class="[
                      'fa-solid',
                      openDropdownKey === 'extractionVolume'
                        ? 'fa-chevron-up'
                        : 'fa-chevron-down',
                    ]"
                  ></i>
                </button>
                <div
                  v-if="openDropdownKey === 'extractionVolume'"
                  class="dropdown-menu"
                >
                  <div class="range-inputs">
                    From:
                    <input
                      v-model="extractionVolumeFrom"
                      type="number"
                      placeholder="Min: 0"
                      class="filter-input"
                    />
                    To:
                    <input
                      v-model="extractionVolumeTo"
                      type="number"
                      placeholder="Max: 400.000"
                      class="filter-input"
                    />
                  </div>
                </div>
              </div>
            </div>
            <!-- Volume Flow -->
            <div class="filter-group">
              <div class="dropdown-container">
                <button
                  class="dropdown-button"
                  @click="toggleDropdown('volumeFlow')"
                >
                  <span>Volume flow</span>
                  <i
                    :class="[
                      'fa-solid',
                      openDropdownKey === 'volumeFlow'
                        ? 'fa-chevron-up'
                        : 'fa-chevron-down',
                    ]"
                  ></i>
                </button>
                <div
                  v-if="openDropdownKey === 'volumeFlow'"
                  class="dropdown-menu"
                >
                  <div class="range-inputs">
                    From:
                    <input
                      v-model="volumeFlowFrom"
                      type="number"
                      placeholder="Min: 0"
                      class="filter-input"
                    />
                    To:
                    <input
                      v-model="volumeFlowTo"
                      type="number"
                      placeholder="Max: 400.000"
                      class="filter-input"
                    />
                  </div>
                </div>
              </div>
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
  width: 70%;
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

  .filter-groups-wrapper {
    display: flex;
    gap: 1.5rem;

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

      .dropdown-container {
        position: relative;
      }

      .dropdown-button {
        width: 100%;
        padding: 0.75rem;
        background-color: white;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.95rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: border-color 0.2s ease;
        width: 11rem;

        &:hover {
          border-color: #204485;
        }

        i {
          font-size: 0.75rem;
        }
      }

      .dropdown-menu {
        width: 11rem;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: white;
        border: 1px solid #e0e0e0;
        border-top: none;
        border-radius: 0 0 4px 4px;
        z-index: 10;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

        .checkbox-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          flex-direction: column;
          padding: 0.75rem;
        }

        .checkbox-option {
          display: flex;
          flex-direction: row-reverse;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          cursor: pointer;

          input {
            cursor: pointer;
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
          }
        }
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

  .checkbox-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .checkbox-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;

    input {
      cursor: pointer;
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
