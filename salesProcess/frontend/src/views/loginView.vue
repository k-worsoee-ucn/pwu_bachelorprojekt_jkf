<script setup>
  import { ref } from 'vue'
  import SignIn from '../components/SignIn.vue'
  import SignUp from '../components/SignUp.vue'

  const isSignUp = ref(false)

  const toggleMode = () => {
    isSignUp.value = !isSignUp.value
  }
</script>
<template>
  <div class="auth-container">
    
    <SignIn v-if="!isSignUp" />
    
    <SignUp v-if="isSignUp" />

    <button @click="toggleMode" class="btn">
      {{ isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up' }}
    </button>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}
</style>