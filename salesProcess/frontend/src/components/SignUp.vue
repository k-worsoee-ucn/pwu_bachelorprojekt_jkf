<script setup>
import { ref } from 'vue'

// Form data
const formData = ref({
  accessCode: '',
  email: '',
  password: '',
  name: '',
  role: 'viewer'
})

// Form state
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Handle form submission
const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  // Basic validation
  if (!formData.value.accessCode || !formData.value.email || !formData.value.password || !formData.value.name) {
    errorMessage.value = 'All fields are required'
    return
  }

  isLoading.value = true

  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value)
    })

    const data = await response.json()

    if (response.ok) {
      successMessage.value = 'Registration successful!'
      // Reset form
      formData.value = {
        accessCode: '',
        email: '',
        password: '',
        name: '',
        role: 'viewer'
      }
      // TODO: Redirect to login or auto-login
    } else {
      errorMessage.value = data.error || 'Registration failed'
    }
  } catch (error) {
    errorMessage.value = 'Network error. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="form-container">
    <h1>Sign Up</h1>
    <form @submit.prevent="handleSubmit">
      <!-- Access Code Field -->
      <div class="form-group">
        <label for="accessCode">Access Code:</label>
        <input 
          type="text" 
          id="accessCode" 
          v-model="formData.accessCode"
          placeholder="Enter access code" 
          required 
        />
      </div>
      
      <!-- Name Field -->
      <div class="form-group">
        <label for="name">Full Name:</label>
        <input 
          type="text" 
          id="name" 
          v-model="formData.name"
          placeholder="Enter your full name" 
          required 
        />
      </div>

      <!-- Email Field -->
      <div class="form-group">
        <label for="email">Email:</label>
        <input 
          type="email" 
          id="email" 
          v-model="formData.email"
          placeholder="Enter your email" 
          required 
        />
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label for="password">Password:</label>
        <input 
          type="password" 
          id="password" 
          v-model="formData.password"
          placeholder="Enter your password (min 6 characters)" 
          minlength="6"
          required 
        />
      </div>

      <!-- Role Selection -->
      <div class="form-group">
        <label for="role">Role:</label>
        <select id="role" v-model="formData.role" required>
          <option value="viewer">Viewer</option>
          <option value="salesManager">Sales Manager</option>
          <option value="marketingManager">Marketing Manager</option>
        </select>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="isLoading" class="btn">
        {{ isLoading ? 'Registering...' : 'Sign Up' }}
      </button>
    </form>
  </div>
</template>
