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
    if (!isOpen) {
      openDropdownKey.value = null;
    }
  }
);

// Reset internal state when modal opens (to sync with parent's state)
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      resetFilters();
    }
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
                  class="dropdown-button btn-no-fill"
                  @click="toggleDropdown('step')"
                >
                  Step
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
                  class="dropdown-button btn-no-fill"
                  @click="toggleDropdown('salesManager')"
                >
                  Sales Mng.
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
                  class="dropdown-button btn-no-fill"
                  @click="toggleDropdown('year')"
                >
                  Year
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
                  class="dropdown-button btn-no-fill"
                  @click="toggleDropdown('month')"
                >
                  Month
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
                  class="dropdown-button btn-no-fill"
                  @click="toggleDropdown('consent')"
                >
                  Consent
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
                  class="dropdown-button btn-no-fill"
                  @click="toggleDropdown('industry')"
                >
                  Industry
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
                  class="dropdown-button btn-no-fill"
                  @click="toggleDropdown('country')"
                >
                  Country
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
                  class="dropdown-button btn-no-fill"
                  @click="toggleDropdown('customer')"
                >
                  Customer
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
                  class="dropdown-button btn-no-fill"
                  @click="toggleDropdown('filter')"
                >
                  Filter
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
                  class="dropdown-button btn-no-fill"
                  @click="toggleDropdown('ventilation')"
                >
                  Ventilation
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
                  class="dropdown-button btn-no-fill"
                  @click="toggleDropdown('extractionVolume')"
                >
                  Tot. Extr. Vol.
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
                  class="dropdown-button btn-no-fill"
                  @click="toggleDropdown('volumeFlow')"
                >
                  Volume flow
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
        <button class="btn-no-fill" @click="resetFilters">Reset</button>
        <div class="action-buttons">
          <button class="btn-no-fill" @click="closeModal">Cancel</button>
          <button class="btn" @click="applyFilter">Apply</button>
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
  background: $plain-white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  width: fit-content;
  max-height: 90vh;
  overflow-y: auto;
  margin: 1rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid $neutral-500-light;

  h2 {
    color: $neutral-800;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: $neutral-500;
    padding: 0;
  }
}

.modal-body {
  margin-inline: 1.5rem;
  margin-block: 5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h3 {
    color: $neutral-800;
  }

  .filter-groups-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 500;
        font-size: 0.9rem;
        color: $neutral-700;
      }

      .dropdown-container {
        position: relative;
      }

      .dropdown-button {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 11rem;
      }

      .dropdown-menu {
        width: 11rem;
        max-height: 10.4rem;
        overflow: scroll;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: $plain-white;
        border: 1px solid $neutral-200-light;
        border-top: none;
        border-radius: 0 0 4px 4px;
        z-index: 10;
        box-shadow: $box-shadow;

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
          cursor: pointer;

          input {
            cursor: pointer;
          }
        }

        .range-inputs {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0.75rem;

          .filter-input {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid $neutral-500-light;
            border-radius: 4px;
            transition: border-color 0.2s ease;

            &:focus {
              outline: none;
              border-color: $primary-jkf-blue;
              box-shadow: $box-shadow;
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

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid $neutral-500-light;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  .action-buttons {
    display: flex;
    gap: 1rem;
  }
}
</style>
