<script setup>
import { useAuth } from '@/composables/useAuth'

const { 
  user, 
  isAuthenticated, 
  isSalesManager, 
  isMarketingManager,
  canCreateSales,
  logout 
} = useAuth()
</script>

<template>
  <header>
    <nav>
      <!-- Show different navigation based on auth status -->
      <template v-if="isAuthenticated">
        <!-- Welcome message -->
        <span class="user-info">
          Welcome, {{ user?.name }} ({{ user?.role }})
        </span>
        
        <!-- Navigation links -->
        <RouterLink to="/my-processes">My Processes</RouterLink>
        
        <!-- Marketing managers can see all processes -->
        <RouterLink v-if="isMarketingManager" to="/all-processes">
          All Processes
        </RouterLink>
        
        <!-- Sales managers can create new processes/sales -->
        <RouterLink v-if="canCreateSales" to="/create-new-process">
          Create New Process
        </RouterLink>
        
        <!-- Logout button -->
        <button @click="logout" class="logout-btn">
          Logout
        </button>
      </template>
      
      <!-- Show login link if not authenticated -->
      <template v-else>
        <RouterLink to="/login">Login</RouterLink>
      </template>
    </nav>
  </header>
</template>

<style scoped lang="scss">
header {
  nav {
    padding: 1rem;
    border-bottom: 1px solid #ccc;
    display: flex;
    align-items: center;
    gap: 1rem;

    .user-info {
      font-weight: 500;
      color: #333;
      margin-right: auto; // Push to left, other items to right
    }

    a {
      text-decoration: none;
      color: #333;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.3s;

      &:hover {
        background-color: #f5f5f5;
        color: #666;
      }

      &.router-link-active {
        background-color: $primary-jkf-blue;
        color: white;
      }
    }

    .logout-btn {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.3s;

      &:hover {
        background-color: #c82333;
      }
    }
  }
}
</style>