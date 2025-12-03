<template>
  <div class="sale-form">
    <h2>Sale Information</h2>
    
    <form @submit.prevent="submitForm" class="form-grid">
      <!-- Basic Information -->
      <div class="form-section">
        <h3>Basic Information</h3>
        
        <div class="form-group">
          <label for="customerId">Plant Manufacturer *</label>
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
        </div>

        <div class="form-group">
          <label for="manufacturerWebsite">Manufacturer Website</label>
          <input
            id="manufacturerWebsite"
            :value="selectedCustomerWebsite"
            type="url"
            placeholder="Auto-filled from selected manufacturer"
            disabled
            class="disabled-field"
          />
        </div>

        <div class="form-group">
          <label for="endUser">End User *</label>
          <input
            id="endUser"
            v-model="formData.endUser"
            type="text"
            placeholder="Name of the end user company"
            required
          />
        </div>

        <div class="form-group">
          <label for="country">Country *</label>
          <input
            id="country"
            v-model="formData.country"
            type="text"
            placeholder="e.g., Germany, USA, France..."
            required
          />
        </div>

        <div class="form-group">
          <label for="industry">Industry *</label>
          <select
            id="industry"
            v-model="formData.industry"
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
        </div>

        <div v-if="formData.industry === 'other'" class="form-group">
          <label for="customIndustry">Specify Industry *</label>
          <input
            id="customIndustry"
            v-model="formData.customIndustry"
            type="text"
            placeholder="Enter custom industry"
            required
          />
        </div>
      </div>

      <!-- Technical Specifications -->
      <div class="form-section">
        <h3>Technical Specifications</h3>
        
        <div class="form-group">
          <label for="plantType">Plant Type *</label>
          <input
            id="plantType"
            v-model="formData.plantType"
            type="text"
            placeholder="e.g., Production, Assembly, Packaging..."
            required
          />
        </div>

        <div class="form-group">
          <label for="filterType">Filter Type *</label>
          <input
            id="filterType"
            v-model="formData.filterType"
            type="text"
            placeholder="e.g., Baghouse, Cartridge, Cyclone..."
            required
          />
        </div>

        <div class="form-group">
          <label for="fanType">Fan Type *</label>
          <input
            id="fanType"
            v-model="formData.fanType"
            type="text"
            placeholder="e.g., Centrifugal, Axial, Mixed Flow..."
            required
          />
        </div>

        <div class="form-group">
          <label for="dustType">Dust Type *</label>
          <input
            id="dustType"
            v-model="formData.dustType"
            type="text"
            placeholder="e.g., Wood dust, Metal particles..."
            required
          />
        </div>

        <div class="form-group">
          <label for="ductSystem">Duct System *</label>
          <input
            id="ductSystem"
            v-model="formData.ductSystem"
            type="text"
            placeholder="e.g., Round, Rectangular, Flexible..."
            required
          />
        </div>

        <div class="form-group">
          <label for="totalExtractionVolume">Total Extraction Volume (m³) *</label>
          <input
            id="totalExtractionVolume"
            v-model.number="formData.totalExtractionVolume"
            type="number"
            min="0"
            step="0.1"
            placeholder="0"
            required
          />
        </div>

        <div class="form-group">
          <label for="volumeFlow">Volume Flow (m³/h) *</label>
          <input
            id="volumeFlow"
            v-model.number="formData.volumeFlow"
            type="number"
            min="0"
            step="0.1"
            placeholder="0"
            required
          />
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn-secondary">
          Reset
        </button>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Saving...' : (isEdit ? 'Update Sale' : 'Create Sale') }}
        </button>
      </div>
    </form>

    <!-- Error Display -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- Success Display -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'

const props = defineProps({
  sale: {
    type: Object,
    default: null
  },
  processId: {
    type: Number,
    required: true
  },
  currentUserId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['sale-created', 'sale-updated', 'cancel'])

// Reactive data
const formData = reactive({
  endUser: '',
  country: '',
  industry: '',
  customIndustry: '',
  plantType: '',
  filterType: '',
  fanType: '',
  dustType: '',
  ductSystem: '',
  totalExtractionVolume: 0,
  volumeFlow: 0,
  customerId: ''
})

const customers = ref([])
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Computed properties
const isEdit = computed(() => props.sale !== null)

const selectedCustomerWebsite = computed(() => {
  const selectedCustomer = customers.value.find(c => c.id === formData.customerId)
  return selectedCustomer?.website || 'No website available'
})

// Methods
const resetForm = () => {
  Object.assign(formData, {
    endUser: '',
    country: '',
    industry: '',
    customIndustry: '',
    plantType: '',
    filterType: '',
    fanType: '',
    dustType: '',
    ductSystem: '',
    totalExtractionVolume: 0,
    volumeFlow: 0,
    customerId: ''
  })
  errorMessage.value = ''
  successMessage.value = ''
}

const loadFormData = () => {
  if (props.sale) {
    Object.assign(formData, {
      endUser: props.sale.endUser || '',
      country: props.sale.country || '',
      industry: props.sale.industry || '',
      customIndustry: props.sale.customIndustry || '',
      plantType: props.sale.plantType || '',
      filterType: props.sale.filterType || '',
      fanType: props.sale.fanType || '',
      dustType: props.sale.dustType || '',
      ductSystem: props.sale.ductSystem || '',
      totalExtractionVolume: props.sale.totalExtractionVolume || 0,
      volumeFlow: props.sale.volumeFlow || 0,
      customerId: props.sale.customerId || ''
    })
  }
}

const loadCustomers = async () => {
  try {
    const response = await fetch('/api/customers')
    if (response.ok) {
      customers.value = await response.json()
    }
  } catch (error) {
    console.error('Error loading customers:', error)
  }
}

const onCustomerChange = () => {
  // Reset custom industry when customer changes
  if (formData.industry !== 'other') {
    formData.customIndustry = ''
  }
}

const submitForm = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const saleData = {
      ...formData,
      processId: props.processId,
      salesManagerId: props.currentUserId // Sales manager is the current user
    }

    // Remove customIndustry if industry is not 'other'
    if (saleData.industry !== 'other') {
      saleData.customIndustry = null
    }

    const url = isEdit.value ? `/api/sales/${props.sale.id}` : '/api/sales'
    const method = isEdit.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(saleData)
    })

    if (response.ok) {
      const savedSale = await response.json()
      successMessage.value = isEdit.value 
        ? 'Sale updated successfully!' 
        : 'Sale created successfully!'
      
      emit(isEdit.value ? 'sale-updated' : 'sale-created', savedSale)
      
      if (!isEdit.value) {
        resetForm()
      }
    } else {
      const errorData = await response.json()
      errorMessage.value = errorData.message || 'An error occurred while saving the sale.'
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    errorMessage.value = 'Network error. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadCustomers()
  loadFormData()
})
</script>

<style scoped>
.sale-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
}

.form-section h3 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1.1rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.disabled-field {
  background-color: #f9fafb !important;
  color: #6b7280 !important;
  cursor: not-allowed !important;
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
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
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
}

.btn-secondary:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
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
  .sale-form {
    margin: 1rem;
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
  }
}
</style>