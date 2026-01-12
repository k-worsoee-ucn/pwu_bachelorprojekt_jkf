<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/utils/useAuth'

const { user, setUser } = useAuth()
const form = ref({ email: '', password: '', name: '', role: '', accessCode: '' })
const message = ref('')

onMounted(() => {
  if (user.value) {
    form.value.email = user.value.email
    form.value.name = user.value.name
    form.value.role = user.value.role
  }
})

const updateProfile = async () => {
  try {
    const payload = {
      email: form.value.email,
      name: form.value.name,
      ...(form.value.password ? { password: form.value.password, accessCode: form.value.accessCode } : {}),
    }
    const res = await fetch(`/api/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    const data = await res.json();
    if (res.ok) {
      message.value = 'Profile updated!';
      if (data && typeof data === 'object') {
        setUser({ ...user.value, ...data });
      }
    } else {
      message.value = data.error || 'Update failed.';
    }
  } catch (err) {
    message.value = 'Error updating profile.'
  }
}
</script>

<template>
  <div class="form-container">
    <h1>Update Profile</h1>
    <form @submit.prevent="updateProfile">
        <div class="form-group">
            <label>Name:</label>
            <input v-model="form.name" type="text" required />
        </div>
        <div class="form-group">
            <label>Email:</label>
            <input v-model="form.email" type="email" required />
        </div>
        <div class="form-group">
          <label>Password:</label>
          <input v-model="form.password" type="password" placeholder="New password" />
        </div>
        <div class="form-group" v-if="form.password">
          <label for="accessCode">Access Code:</label>
          <input 
            type="text" 
            id="accessCode" 
            v-model="form.accessCode"
            placeholder="Enter access code" 
            required
          />
        </div>
      <button type="submit" class="btn">Save Changes</button>
    </form>
    <p v-if="message" class="success-message">{{ message }}</p>
  </div>
</template>