<template>
  <div class="sale-form">
    <h2>Sale Information</h2>

    <form
      @submit.prevent="submitForm"
      @click="closeCountryDropdown"
      class="form-grid"
    >
      <div class="form-section">
        <h3>Basic Information</h3>
        <div class="form-group">
          <label for="title">Process Title *</label>
          <div class="input-with-checkbox">
            <input
              id="title"
              v-model="formData.title"
              type="text"
              placeholder="Enter a descriptive title for this process"
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
            <select
              id="customerId"
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
            <select id="industry" v-model="formData.industry" required>
              <option value="">Select Industry</option>
              <option value="woodworking">Woodworking</option>
              <option value="agroAndMilling">Agro- and Milling</option>
              <option value="recycling">Recycling</option>
              <option value="metalworking">Metalworking</option>
              <option value="paper">Paper</option>
              <option value="other">Other</option>
            </select>
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
              required
            />
            <label class="privacy-checkbox">
              <input type="checkbox" v-model="privacyFlags.customIndustry" />
              <span>Private</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Product Selection -->
      <div class="form-section">
        <h3>Product Selection</h3>

        <div class="form-group">
          <label for="filtersAndSeparators">Filters & Separators</label>
          <div class="input-with-checkbox">
            <div style="flex: 1">
              <select
                id="filtersAndSeparators"
                v-model="formData.selectedFilters"
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

      <!-- Technical Specifications -->
      <div class="form-section">
        <h3>Technical Specifications</h3>

        <div class="form-group">
          <label for="plantType">Plant Type *</label>
          <div class="input-with-checkbox">
            <input
              id="plantType"
              v-model="formData.plantType"
              type="text"
              placeholder="e.g., Production, Assembly, Packaging..."
              required
            />
            <label class="privacy-checkbox">
              <input type="checkbox" v-model="privacyFlags.plantType" />
              <span>Private</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="filterType">Filter Type *</label>
          <div class="input-with-checkbox">
            <input
              id="filterType"
              v-model="formData.filterType"
              type="text"
              placeholder="e.g., Baghouse, Cartridge, Cyclone..."
              required
            />
            <label class="privacy-checkbox">
              <input type="checkbox" v-model="privacyFlags.filterType" />
              <span>Private</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="fanType">Fan Type *</label>
          <div class="input-with-checkbox">
            <input
              id="fanType"
              v-model="formData.fanType"
              type="text"
              placeholder="e.g., Centrifugal, Axial, Mixed Flow..."
              required
            />
            <label class="privacy-checkbox">
              <input type="checkbox" v-model="privacyFlags.fanType" />
              <span>Private</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="dustType">Dust Type *</label>
          <div class="input-with-checkbox">
            <input
              id="dustType"
              v-model="formData.dustType"
              type="text"
              placeholder="e.g., Wood dust, Metal particles..."
              required
            />
            <label class="privacy-checkbox">
              <input type="checkbox" v-model="privacyFlags.dustType" />
              <span>Private</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="ductSystem">Duct System *</label>
          <div class="input-with-checkbox">
            <input
              id="ductSystem"
              v-model="formData.ductSystem"
              type="text"
              placeholder="e.g., Round, Rectangular, Flexible..."
              required
            />
            <label class="privacy-checkbox">
              <input type="checkbox" v-model="privacyFlags.ductSystem" />
              <span>Private</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="totalExtractionVolume"
            >Total Extraction Volume (m³) *</label
          >
          <div class="input-with-checkbox">
            <input
              id="totalExtractionVolume"
              v-model.number="formData.totalExtractionVolume"
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
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
              type="number"
              min="0"
              step="1"
              placeholder="0"
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
              placeholder="0"
              required
            />
            <label class="privacy-checkbox">
              <input type="checkbox" v-model="privacyFlags.volumeFlow" />
              <span>Private</span>
            </label>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn-secondary">
          Reset
        </button>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          {{
            isSubmitting ? "Saving..." : isEdit ? "Update Sale" : "Create Sale"
          }}
        </button>
      </div>
    </form>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
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

const customers = ref([]);
const products = ref([]);
const isSubmitting = ref(false);
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
  isSubmitting.value = true;
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
  } finally {
    isSubmitting.value = false;
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
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0 0 1.5rem 0;
    color: #374151;
  }

  .form-grid {
    display: grid;
    gap: 2rem;
  }

  .form-section {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1.5rem;
    background: #f9fafb;

    h3 {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1.1rem;
      font-weight: 600;
    }
  }

  .form-group {
    margin-bottom: 1rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #374151;
      font-weight: 500;
    }

    input,
    select,
    textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    .disabled-field {
      background-color: #f9fafb !important;
      color: #6b7280 !important;
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
  }

  .privacy-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    font-size: 0.875rem;
    color: #6b7280;

    input[type="checkbox"] {
      cursor: pointer;
      width: auto;
      margin: 0;
    }

    span {
      font-weight: 500;
    }
  }

  .multi-select {
    min-height: 80px !important;
    padding: 0.5rem !important;
  }

  .help-text {
    color: #6b7280;
    font-size: 0.875rem;
    margin-top: 0.25rem;
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
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    .no-results {
      padding: 0.75rem;
      color: #6b7280;
      text-align: center;
    }
  }

  .country-option {
    padding: 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #e0e7ff;
      color: #3b82f6;
    }
  }

  .selected-country {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #059669;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
      background: #2563eb;
    }

    &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  }

  .btn-secondary {
    background: transparent;
    color: #6b7280;
    border: 1px solid #d1d5db;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }
  }

  .error-message {
    background: #fef2f2;
    color: #dc2626;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #fecaca;
    margin-top: 1rem;
  }

  .success-message {
    background: #f0fdf4;
    color: #16a34a;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #bbf7d0;
    margin-top: 1rem;
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
