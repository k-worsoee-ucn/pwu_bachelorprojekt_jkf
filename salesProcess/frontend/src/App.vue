<script setup>
import { onMounted } from 'vue'
import Header from './components/Header.vue'
import { useAuth } from '@/composables/useAuth'

const { initAuth } = useAuth()

onMounted(() => {
  initAuth()
})
</script>

<template>
  <Header />
  <RouterView />
</template>

<style lang="scss">
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

* {
  font-family: Titillium Web;
}

body {
  max-width: 1920px;
  margin: 0 auto;
}
</style>
