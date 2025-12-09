<script setup>
import { useAuth } from '@/composables/useAuth'

const { 
  user, 
  isAuthenticated, 
  isSalesManager, 
  isMarketingManager,
  logout 
} = useAuth()
</script>

<template>
  <header>
    <nav>
      <div v-if="isAuthenticated">
        <span class="user-info">
          Welcome, {{ user?.name }} ({{ user?.role }})
          <button @click="logout" class="logout-btn">
            Logout
          </button>
        </span>        
      </div>
      
      <div v-else>
        <RouterLink class="btn" to="/login">Login</RouterLink>
      </div>
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

    // a {
    //   text-decoration: none;
    //   color: #333;
    //   padding: 0.5rem 1rem;
    //   border-radius: 4px;
    //   transition: background-color 0.3s;

    //   &:hover {
    //     background-color: #f5f5f5;
    //     color: #666;
    //   }

    //   &.router-link-active {
    //     background-color: $primary-jkf-blue;
    //     color: white;
    //   }
    // }
  }
}
</style>