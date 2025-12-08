<script setup>
import { useAuth } from '@/composables/useAuth'

const {
  isAuthenticated, 
  isSalesManager,
  isViewer
} = useAuth()
</script>

<template>
    <div v-if="isAuthenticated && !isViewer">
        <RouterLink v-if="isSalesManager" to="/new">
            Create New Sale
        </RouterLink>
        
        <RouterLink  to="/my-processes">
            My Processes
        </RouterLink>
        
        <RouterLink  to="/all-processes">
            All Processes
        </RouterLink>
    </div>
</template>

<style scoped lang="scss">

</style>