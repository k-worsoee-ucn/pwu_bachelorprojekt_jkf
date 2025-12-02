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
  <div class="signUp-container">
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
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Registering...' : 'Sign Up' }}
      </button>
    </form>
  </div>
</template>

<style scoped lang="scss">
.signUp-container {
  max-width: 30%;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .form-group {
    margin-bottom: 1rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: $primary-jkf-blue;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.25);
      }
    }

    select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
      background-color: white;

      &:focus {
        outline: none;
        border-color: $primary-jkf-blue;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.25);
      }
    }
  }

  .error-message {
    background-color: #fee;
    color: #c33;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    border: 1px solid #fcc;
  }

  .success-message {
    background-color: #efe;
    color: #363;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    border: 1px solid #cfc;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background-color: $primary-jkf-blue;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover:not(:disabled) {
      background-color: $jkf-hover-blue;
    }

    &:active:not(:disabled) {
      background-color: $jkf-hover-blue;
    }

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
}
</style>
