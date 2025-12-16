<script setup>
import { useAuth } from '@/composables/useAuth'

const { 
  user, 
  isAuthenticated, 
  isSalesManager, 
  logout 
} = useAuth()
</script>

<template>
  <header>
    <nav v-if="isAuthenticated" class="nav-bar">
      <!-- Left side: Navigation Links -->
      <div class="nav-links">
        <RouterLink v-if="isSalesManager" to="/processes/new" class="nav-btn btn-no-fill">
          Opret sag
        </RouterLink>
        <RouterLink to="/my-processes" class="nav-btn btn-no-fill">
          Mine sager
        </RouterLink>
        <RouterLink to="/all-processes" class="nav-btn btn-no-fill">
          Alle sager
        </RouterLink>
      </div>

      <!-- Right side: User actions -->
      <div class="user-actions">
        <RouterLink to="/profile" class="edit-user-btn  btn-no-fill">
          Edit user
        </RouterLink>
        <button @click="logout" class="logout-btn">
          Logout
        </button>
      </div>
    </nav>
    
    <!-- Login view header -->
    <nav v-else class="nav-bar login-nav">
      <div></div>
      <div class="user-actions">
        <RouterLink to="/login" class="btn">Login</RouterLink>
      </div>
    </nav>
  </header>
</template>

<style scoped lang="scss">
@import '@/scss/variables';

header {


  .nav-bar {
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;

    &.login-nav {
      justify-content: flex-end;
    }

    .nav-links {
      display: flex;
      gap: 1rem;
      align-items: center;
    }



    .user-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-left: auto;
    }

    .logout-btn {
      padding: 0.6rem 1.2rem;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.95rem;
      transition: background-color 0.3s ease;
      font-weight: 500;

      &:hover {
        background-color: #c82333;
      }
    }

    
  }
}
</style>