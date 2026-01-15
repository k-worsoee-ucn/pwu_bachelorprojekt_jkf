<script setup>
  import { ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import SignIn from '../components/SignIn.vue'
  import SignUp from '../components/SignUp.vue'

  const route = useRoute()
  const isSignUp = ref(false)

  // Sign up component
  watch(
    () => route.query.signup,
    (signup) => {
      isSignUp.value = signup === 'true'
    },
    { immediate: true }
  )

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

<style scoped lang="scss">
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}
</style>