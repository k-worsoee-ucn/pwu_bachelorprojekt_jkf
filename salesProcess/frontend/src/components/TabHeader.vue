<script setup>
import { useAuth } from '@/composables/useAuth'

const {
  isAuthenticated, 
  isSalesManager,
} = useAuth()
</script>

<template>
    <div v-if="isAuthenticated">
        <RouterLink v-if="isSalesManager" to="/create-new-process">
            Create New Process
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