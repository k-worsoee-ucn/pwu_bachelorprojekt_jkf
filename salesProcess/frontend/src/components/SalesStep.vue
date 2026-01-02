<template>
  <div class="sale-form">
    <h2>Sale Information</h2>

    <form
      @submit.prevent="submitForm"
      @click="closeCountryDropdown"
      class="form-grid"
    >
      <!-- Basic Information -->
      <div
        class="form-section"
        @click="accordionState.basicInfo = !accordionState.basicInfo"
        style="cursor: pointer"
      >
        <h3>
          Basic Information
          <i
            class="fa-solid fa-chevron-down accordion-arrow"
            :class="{ open: accordionState.basicInfo }"
          ></i>
        </h3>
        <div v-show="accordionState.basicInfo">
          <div class="form-group">
            <label for="title">Process Title *</label>
            <div class="input-with-checkbox">
              <input
                id="title"
                v-model="formData.title"
                type="text"
                placeholder="Enter a descriptive title for this process"
                :disabled="props.disabled"
                required
              />
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.title" />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <div class="input-with-checkbox">
              <textarea
                id="description"
                v-model="formData.description"
                placeholder="Enter a detailed description of the project"
                :disabled="props.disabled"
                rows="3"
              ></textarea>
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.description" />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="customerId">Plant Manufacturer *</label>
            <div class="input-with-checkbox">
              <div class="checkboxRel">
                <select
                  id="customerId"
                  :disabled="props.disabled"
                  v-model="formData.customerId"
                  required
                  @change="onCustomerChange"
                >
                  <option value="">Select Plant Manufacturer</option>
                  <option
                    v-for="customer in customers"
                    :key="customer.id"
                    :value="customer.id"
                  >
                    {{ customer.name }}
                  </option>
                </select>
                <i class="fa-solid fa-chevron-down"></i>
              </div>
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.customerId" />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="manufacturerWebsite">Manufacturer Website</label>
            <div class="input-with-checkbox">
              <input
                id="manufacturerWebsite"
                :value="selectedCustomerWebsite"
                type="url"
                placeholder="Auto-filled from selected manufacturer"
                disabled
                class="disabled-field"
              />
              <label class="privacy-checkbox">
                <input
                  type="checkbox"
                  v-model="privacyFlags.manufacturerWebsite"
                />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="endUser">End User *</label>
            <div class="input-with-checkbox">
              <input
                id="endUser"
                v-model="formData.endUser"
                type="text"
                :disabled="props.disabled"
                placeholder="Name of the end user company"
                required
              />
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.endUser" />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="phoneNumber">Phone Number</label>
            <div class="input-with-checkbox">
              <input
                id="phoneNumber"
                v-model="formData.phoneNumber"
                type="tel"
                placeholder="e.g., +45 12 34 56 78"
                :disabled="props.disabled"
              />
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.phoneNumber" />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="country">Country *</label>
            <div class="input-with-checkbox">
              <div class="country-dropdown-container" @click.stop>
                <input
                  id="country"
                  v-model="formData.country"
                  type="text"
                  placeholder="Search and select a country..."
                  @focus="handleCountryInputFocus"
                  @input="
                    countryQuery = formData.country;
                    showCountryDropdown = true;
                  "
                  :disabled="props.disabled"
                  required
                />
                <div
                  v-if="showCountryDropdown && filteredCountries.length > 0"
                  class="country-dropdown"
                >
                  <div
                    v-for="country in filteredCountries"
                    :key="country.code"
                    class="country-option"
                    @mousedown.prevent="selectCountry(country.name)"
                  >
                    {{ country.name }}
                  </div>
                </div>
                <div
                  v-if="showCountryDropdown && filteredCountries.length === 0"
                  class="country-dropdown"
                >
                  <div class="no-results">No countries found</div>
                </div>
              </div>
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.country" />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="industry">Industry *</label>
            <div class="input-with-checkbox">
              <div class="checkboxRel">
                <select
                  id="industry"
                  v-model="formData.industry"
                  :disabled="props.disabled"
                  required
                >
                  <option value="">Select Industry</option>
                  <option value="woodworking">Woodworking</option>
                  <option value="agroAndMilling">Agro- and Milling</option>
                  <option value="recycling">Recycling</option>
                  <option value="metalworking">Metalworking</option>
                  <option value="paper">Paper</option>
                  <option value="other">Other</option>
                </select>
                <i class="fa-solid fa-chevron-down"></i>
              </div>
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.industry" />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div v-if="formData.industry === 'other'" class="form-group">
            <label for="customIndustry">Specify Industry *</label>
            <div class="input-with-checkbox">
              <input
                id="customIndustry"
                v-model="formData.customIndustry"
                type="text"
                placeholder="Enter custom industry"
                :disabled="props.disabled"
                required
              />
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.customIndustry" />
                <span>Private</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Selection -->
      <div
        class="form-section product-selection"
        @click="
          accordionState.productSelection = !accordionState.productSelection
        "
        style="cursor: pointer"
      >
        <h3>
          Product Selection
          <i
            class="fa-solid fa-chevron-down accordion-arrow"
            :class="{ open: accordionState.productSelection }"
          ></i>
        </h3>
        <div v-show="accordionState.productSelection">
          <div class="form-group">
            <label for="filtersAndSeparators">Filters & Separators</label>
            <div class="input-with-checkbox">
              <div style="flex: 1">
                <select
                  id="filtersAndSeparators"
                  v-model="formData.selectedFilters"
                  :disabled="props.disabled"
                  multiple
                  class="multi-select"
                >
                  <option
                    v-for="product in filterProducts"
                    :key="product.id"
                    :value="product.id"
                  >
                    {{ product.title }}
                  </option>
                </select>
                <small class="help-text"
                  >Hold Ctrl/Cmd to select multiple items</small
                >
              </div>
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.selectedFilters" />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="fanSystems">Fan Systems</label>
            <div class="input-with-checkbox">
              <div style="flex: 1">
                <select
                  id="fanSystems"
                  :disabled="props.disabled"
                  v-model="formData.selectedFans"
                  multiple
                  class="multi-select"
                >
                  <option
                    v-for="product in fanProducts"
                    :key="product.id"
                    :value="product.id"
                  >
                    {{ product.title }}
                  </option>
                </select>
                <small class="help-text"
                  >Hold Ctrl/Cmd to select multiple items</small
                >
              </div>
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.selectedFans" />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="ductSystems">Duct Systems</label>
            <div class="input-with-checkbox">
              <div style="flex: 1">
                <select
                  id="ductSystems"
                  :disabled="props.disabled"
                  v-model="formData.selectedDucts"
                  multiple
                  class="multi-select"
                >
                  <option
                    v-for="product in ductProducts"
                    :key="product.id"
                    :value="product.id"
                  >
                    {{ product.title }}
                  </option>
                </select>
                <small class="help-text"
                  >Hold Ctrl/Cmd to select multiple items</small
                >
              </div>
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.selectedDucts" />
                <span>Private</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Technical Specifications -->
      <div
        class="form-section"
        @click="accordionState.technicalSpecs = !accordionState.technicalSpecs"
        style="cursor: pointer"
      >
        <h3>
          Technical Specifications
          <i
            class="fa-solid fa-chevron-down accordion-arrow"
            :class="{ open: accordionState.technicalSpecs }"
          ></i>
        </h3>
        <div v-show="accordionState.technicalSpecs">
          <div class="form-group">
            <label for="plantType">Plant Type *</label>
            <div class="input-with-checkbox">
              <input
                id="plantType"
                :disabled="props.disabled"
                v-model="formData.plantType"
                type="text"
                placeholder="e.g., Wooden furniture manufacturer..."
                required
              />
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.plantType" />
                <span>Private</span>
              </label>
            </div>
          </div>

          <!-- <div class="form-group">
          <label for="filterType">Filter Type *</label>
          <div class="input-with-checkbox">
            <input
              id="filterType"
              v-model="formData.filterType"
              type="text"
              placeholder="e.g., SBF220S 4,0 Super Blower Filter..."
              required
            />
            <label class="privacy-checkbox">
              <input type="checkbox" v-model="privacyFlags.filterType" />
              <span>Private</span>
            </label>
          </div>
        </div> -->

          <!-- <div class="form-group">
          <label for="fanType">Fan Type *</label>
          <div class="input-with-checkbox">
            <input
              id="fanType"
              v-model="formData.fanType"
              type="text"
              placeholder="e.g., JK-100MT clean air fan x 1 unit - JK-30D transport fan x 1 unit..."
              required
            />
            <label class="privacy-checkbox">
              <input type="checkbox" v-model="privacyFlags.fanType" />
              <span>Private</span>
            </label>
          </div>
        </div> -->

          <div class="form-group">
            <label for="dustType">Dust Type *</label>
            <div class="input-with-checkbox">
              <input
                id="dustType"
                :disabled="props.disabled"
                v-model="formData.dustType"
                type="text"
                placeholder="e.g., Mixed wood..."
                required
              />
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.dustType" />
                <span>Private</span>
              </label>
            </div>
          </div>

          <!-- <div class="form-group">
          <label for="ductSystem">Duct System *</label>
          <div class="input-with-checkbox">
            <input
              id="ductSystem"
              v-model="formData.ductSystem"
              type="text"
              placeholder="e.g., JKF standard - 40m Optiflow and galvanised duct system..."
              required
            />
            <label class="privacy-checkbox">
              <input type="checkbox" v-model="privacyFlags.ductSystem" />
              <span>Private</span>
            </label>
          </div>
        </div> -->

          <div class="form-group">
            <label for="totalExtractionVolume"
              >Total Extraction Volume (m³) *</label
            >
            <div class="input-with-checkbox">
              <input
                id="totalExtractionVolume"
                v-model.number="formData.totalExtractionVolume"
                type="number"
                :disabled="props.disabled"
                min="0"
                step="0.1"
                placeholder="e.g., 75.000 m3/hr"
                required
              />
              <label class="privacy-checkbox">
                <input
                  type="checkbox"
                  v-model="privacyFlags.totalExtractionVolume"
                />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="pressure">Pressure (Pa) *</label>
            <div class="input-with-checkbox">
              <input
                id="pressure"
                v-model.number="formData.pressure"
                :disabled="props.disabled"
                type="number"
                min="0"
                step="1"
                placeholder="e.g., +/- 5000 Pa"
                required
              />
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.pressure" />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="volumeFlow">Volume Flow (m³/h) *</label>
            <div class="input-with-checkbox">
              <input
                id="volumeFlow"
                v-model.number="formData.volumeFlow"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g., 75.000 m3/hr"
                :disabled="props.disabled"
                required
              />
              <label class="privacy-checkbox">
                <input type="checkbox" v-model="privacyFlags.volumeFlow" />
                <span>Private</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div class="form-actions">
        <button
          type="button"
          @click="resetForm"
          class="btn-no-fill"
          :disabled="props.disabled"
        >
          Reset
        </button>
        <button
          type="submit"
          class="btn"
          :disabled="isSubmitting || props.disabled"
        >
          {{ isEdit ? "Update Sale" : "Create Sale" }}
        </button>
      </div>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { countries } from "countries-list";
import { useAuth } from "@/composables/useAuth";

const props = defineProps({
  sale: {
    type: Object,
    default: null,
  },
  processId: {
    type: Number,
    required: true,
  },
  currentUserId: {
    type: Number,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["sale-created", "sale-updated", "cancel"]);

const { getAuthHeader } = useAuth();

const formData = reactive({
  title: "",
  description: "",
  endUser: "",
  phoneNumber: "",
  country: "",
  industry: "",
  customIndustry: "",
  selectedFilters: [],
  selectedFans: [],
  selectedDucts: [],
  plantType: "",
  filterType: "",
  fanType: "",
  dustType: "",
  ductSystem: "",
  totalExtractionVolume: 0,
  pressure: 0,
  volumeFlow: 0,
  customerId: "",
});

const privacyFlags = reactive({
  title: false,
  description: false,
  endUser: false,
  phoneNumber: false,
  country: false,
  industry: false,
  customIndustry: false,
  selectedFilters: false,
  selectedFans: false,
  selectedDucts: false,
  plantType: false,
  filterType: false,
  fanType: false,
  dustType: false,
  ductSystem: false,
  totalExtractionVolume: false,
  pressure: false,
  volumeFlow: false,
  customerId: false,
  manufacturerWebsite: false,
});

const accordionState = reactive({
  basicInfo: true,
  productSelection: false,
  technicalSpecs: false,
});

const customers = ref([]);
const products = ref([]);
const errorMessage = ref("");
const successMessage = ref("");
const countryQuery = ref("");
const showCountryDropdown = ref(false);

const isEdit = computed(() => props.sale !== null);

const allCountries = computed(() => {
  const countryList = Object.entries(countries).map(([code, data]) => {
    // Handle both string values and object values
    const name = typeof data === "string" ? data : data.name || data;
    return { code, name: String(name).trim() };
  });
  return countryList.sort((a, b) => a.name.localeCompare(b.name));
});

const filteredCountries = computed(() => {
  if (!countryQuery.value.trim()) {
    return allCountries.value;
  }

  const query = countryQuery.value.toLowerCase();
  return allCountries.value.filter((country) =>
    country.name.toLowerCase().includes(query)
  );
});

const selectedCustomerWebsite = computed(() => {
  const selectedCustomer = customers.value.find(
    (c) => c.id === formData.customerId
  );
  return selectedCustomer?.website || "No website available";
});

const filterProducts = computed(() => {
  return products.value.filter((p) => p.category === "filtersAndSeparators");
});

const fanProducts = computed(() => {
  return products.value.filter((p) => p.category === "fanSystems");
});

const ductProducts = computed(() => {
  return products.value.filter((p) => p.category === "ductSystems");
});

// Methods
const resetForm = () => {
  Object.assign(formData, {
    title: "",
    description: "",
    endUser: "",
    phoneNumber: "",
    country: "",
    industry: "",
    customIndustry: "",
    selectedFilters: [],
    selectedFans: [],
    selectedDucts: [],
    plantType: "",
    filterType: "",
    fanType: "",
    dustType: "",
    ductSystem: "",
    totalExtractionVolume: 0,
    pressure: 0,
    volumeFlow: 0,
    customerId: "",
  });
  errorMessage.value = "";
  successMessage.value = "";
};

const loadFormData = () => {
  console.log("loadFormData called, props.sale:", props.sale);
  if (props.sale) {
    console.log("props.sale.saleProducts:", props.sale.saleProducts);
    Object.assign(formData, {
      title: props.sale.title || "",
      description: props.sale.description || "",
      endUser: props.sale.endUser || "",
      phoneNumber: props.sale.phoneNumber || "",
      country: props.sale.country || "",
      industry: props.sale.industry || "",
      customIndustry: props.sale.customIndustry || "",
      plantType: props.sale.plantType || "",
      filterType: props.sale.filterType || "",
      fanType: props.sale.fanType || "",
      dustType: props.sale.dustType || "",
      ductSystem: props.sale.ductSystem || "",
      totalExtractionVolume: props.sale.totalExtractionVolume || 0,
      pressure: props.sale.pressure || 0,
      volumeFlow: props.sale.volumeFlow || 0,
      customerId: props.sale.customerId || "",
      selectedFilters:
        props.sale.saleProducts
          ?.filter((sp) => sp.product.category === "filtersAndSeparators")
          .map((sp) => sp.productId) || [],
      selectedFans:
        props.sale.saleProducts
          ?.filter((sp) => sp.product.category === "fanSystems")
          .map((sp) => sp.productId) || [],
      selectedDucts:
        props.sale.saleProducts
          ?.filter((sp) => sp.product.category === "ductSystems")
          .map((sp) => sp.productId) || [],
    });

    // Load privacy settings
    if (props.sale.privacySettings) {
      Object.assign(privacyFlags, props.sale.privacySettings);
    }

    console.log("formData after loading:", formData);
  }
};

const loadCustomers = async () => {
  try {
    const response = await fetch("/api/customers", {
      headers: {
        ...getAuthHeader(),
      },
    });
    if (response.ok) {
      customers.value = await response.json();
    }
  } catch (error) {
    console.error("Error loading customers:", error);
  }
};

const loadProducts = async () => {
  try {
    const response = await fetch("/api/products", {
      headers: {
        ...getAuthHeader(),
      },
    });
    if (response.ok) {
      products.value = await response.json();
    }
  } catch (error) {
    console.error("Error loading products:", error);
  }
};

const onCustomerChange = () => {
  if (formData.industry !== "other") {
    formData.customIndustry = "";
  }
};

const selectCountry = (countryName) => {
  formData.country = countryName;
  showCountryDropdown.value = false;
};

const handleCountryInputFocus = () => {
  showCountryDropdown.value = true;
};

const closeCountryDropdown = (event) => {
  // Only close if clicking outside the country container
  const countryContainer = event.target.closest(".country-dropdown-container");
  if (!countryContainer) {
    showCountryDropdown.value = false;
  }
};

const submitForm = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const saleData = {
      ...formData,
      processId: props.processId,
      salesManagerId: props.currentUserId,
      privacySettings: privacyFlags,
    };

    if (saleData.industry !== "other") {
      saleData.customIndustry = null;
    }

    const url = isEdit.value ? `/api/sales/${props.sale.id}` : "/api/sales";
    const method = isEdit.value ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(saleData),
    });

    if (response.ok) {
      const savedSale = await response.json();
      successMessage.value = isEdit.value
        ? "Sale updated successfully!"
        : "Sale created successfully!";

      emit(isEdit.value ? "sale-updated" : "sale-created", savedSale);

      if (!isEdit.value) {
        resetForm();
      }
    } else {
      const errorData = await response.json();
      errorMessage.value =
        errorData.message || "An error occurred while saving the sale.";
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    errorMessage.value = "Network error. Please try again.";
  }
};

// Lifecycle
onMounted(() => {
  loadCustomers();
  loadProducts();
  loadFormData();
});

// Watch for sale prop changes to reload privacy flags
watch(
  () => props.sale,
  (newSale) => {
    if (newSale?.privacySettings) {
      // Reset all to false first
      Object.keys(privacyFlags).forEach((key) => {
        privacyFlags[key] = false;
      });
      // Then apply saved settings
      Object.keys(newSale.privacySettings).forEach((key) => {
        if (key in privacyFlags) {
          privacyFlags[key] = newSale.privacySettings[key];
        }
      });
    }
  },
  { immediate: true, deep: true }
);
</script>

<style scoped lang="scss">
.sale-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 4px;
  box-shadow: $box-shadow;

  .form-grid {
    display: grid;
    gap: 2rem;
  }

  .form-section {
    @include default-border;
    padding: 2rem;
    background: $neutral-100-light;
    width: 611px;

    display: flex;
    flex-direction: column;
    gap: 2rem;

    h3 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0;
    }

    .accordion-arrow {
      transition: transform 0.3s ease;
      font-size: 1.2rem;

      &.open {
        transform: rotate(-180deg);
      }
    }

    select {
      appearance: none;
    }
  }

  .product-selection {
    option:hover {
      background-color: $secondary-hover-blue;
      color: $jkf-hover-blue;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    input,
    select,
    textarea {
      width: 100%;
      padding: 0.75rem;

      @include default-border;

      transition: border-color 0.2s;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: $neutral-600-light;
        box-shadow: $box-shadow;
      }

      &:disabled {
        background-color: $neutral-200-light;
        cursor: not-allowed;
        opacity: 0.9;
      }
    }

    .disabled-field {
      background-color: $neutral-100-light !important;
      cursor: not-allowed !important;
    }
  }

  .input-with-checkbox {
    display: flex;
    align-items: center;
    gap: 1rem;

    input,
    select,
    textarea,
    .country-dropdown-container {
      flex: 1;
    }

    .checkboxRel {
      position: relative;
      flex: 1;

      .fa-chevron-down {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1rem;
      }
    }
  }

  .privacy-checkbox {
    display: flex;
    align-items: center;
    gap: 1rem;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;

    input[type="checkbox"] {
      cursor: pointer;
      width: auto;
      margin: 0;
    }

    span {
      font-weight: 400;
    }
  }

  .multi-select {
    min-height: 80px !important;
    padding: 1rem !important;
  }

  .help-text {
    color: $neutral-700;
    font-size: 1rem;
    display: block;
  }

  .country-dropdown-container {
    position: relative;
    width: 100%;

    input {
      width: 100%;
    }
  }

  .country-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #d1d5db;
    border-top: none;
    border-radius: 0 0 4px 4px;
    max-height: 250px;
    overflow-y: auto;
    z-index: 10;
    box-shadow: $box-shadow;

    .no-results {
      padding: 1rem;
      color: $neutral-700;
      text-align: center;
    }
  }

  .country-option {
    padding: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: $secondary-hover-blue;
      color: $jkf-hover-blue;
    }
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1rem;

    .form-actions {
      flex-direction: column;

      button {
        width: 100%;
      }
    }
  }
}
</style>
