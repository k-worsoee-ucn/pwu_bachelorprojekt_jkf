<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { user, getAuthHeader } = useAuth()
const form = ref({ email: '', password: '', name: '', role: '' })
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
      ...(form.value.password ? { password: form.value.password } : {}),
    }
    const res = await fetch(`/api/users/${user.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      message.value = 'Profile updated!'
    } else {
      message.value = 'Update failed.'
    }
  } catch (err) {
    message.value = 'Error updating profile.'
  }
}
</script>

<template>
  <div class="profile-container">
    <h2>Update Profile</h2>
    <form @submit.prevent="updateProfile">
      <label>Email:</label>
      <input v-model="form.email" type="email" required />

      <!-- <label>Password:</label>
      <input v-model="form.password" type="password" placeholder="New password" /> -->

      <label>Name:</label>
      <input v-model="form.name" type="text" required />

      <!-- If you want users to change their role (usually admin only) -->
      <!--
      <label>Role:</label>
      <select v-model="form.role">
        <option value="salesManager">Sales Manager</option>
        <option value="marketingManager">Marketing Manager</option>
        <option value="viewer">Viewer</option>
      </select>
      -->

      <button type="submit">Save Changes</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>