<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Form data
const formData = ref({
  accessCode: '',
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  role: 'viewer'
})

// Form state
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Password regex pattern: at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

// Validate password strength
const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must include at least 1 uppercase letter'
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must include at least 1 lowercase letter'
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must include at least 1 number'
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return 'Password must include at least 1 special character (@$!%*?&)'
  }
  return null
}

// Handle form submission
const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  // Basic validation
  if (!formData.value.accessCode || !formData.value.email || !formData.value.password || !formData.value.passwordConfirm || !formData.value.name) {
    errorMessage.value = 'All fields are required'
    return
  }

  // Validate password strength
  const passwordError = validatePassword(formData.value.password)
  if (passwordError) {
    errorMessage.value = passwordError
    return
  }

  // Check if passwords match
  if (formData.value.password !== formData.value.passwordConfirm) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  isLoading.value = true

  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        accessCode: formData.value.accessCode,
        email: formData.value.email,
        password: formData.value.password,
        name: formData.value.name,
        role: formData.value.role
      })
    })

    const data = await response.json()

    if (response.ok) {
      successMessage.value = 'Registration successful!'
      // Reset form
      formData.value = {
        accessCode: '',
        email: '',
        password: '',
        passwordConfirm: '',
        name: '',
        role: 'viewer'
      }
      // Redirect to login after successful registration
      setTimeout(() => {
        router.push('/login')
      }, 1500)
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
          placeholder="Enter your password" 
          required 
        />
        <small class="password-hint">Password must contain at least 8 characters, including uppercase, lowercase, number and special character</small>
      </div>

      <!-- Confirm Password Field -->
      <div class="form-group">
        <label for="passwordConfirm">Confirm Password:</label>
        <input 
          type="password" 
          id="passwordConfirm" 
          v-model="formData.passwordConfirm"
          placeholder="Confirm your password" 
          required 
        />
      </div>

      <!-- Role Selection -->
      <div class="form-group">
        <label for="role">Role:</label>
        <div>
          <select id="role" v-model="formData.role" required>
            <option value="viewer">Viewer</option>
            <option value="salesManager">Sales Manager</option>
            <option value="marketingManager">Marketing Manager</option>
          </select>
          <i class="fa-solid fa-chevron-down"></i>
        </div>
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
