<script setup>
import Header from './components/Header.vue'
import SalesStep from './components/SalesStep.vue'
</script>

<template>
  <Header />
  <RouterView />
  <SalesStep />
</template>

<style lang="scss">
* {
  font-family: Titillium Web;
}

body {
  max-width: 1920px;
  margin: 0 auto;
}
</style>
