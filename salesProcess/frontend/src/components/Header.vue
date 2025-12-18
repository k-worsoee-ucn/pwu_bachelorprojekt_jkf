<script setup>
import { useAuth } from "@/composables/useAuth";

const { user, isAuthenticated, isSalesManager, isMarketingManager, logout } =
  useAuth();

defineProps({
  salesManagerCount: {
    type: Number,
    default: 0,
  },
  marketingManagerCount: {
    type: Number,
    default: 0,
  },
});

const roleLabels = {
  salesManager: "Sales Manager",
  marketingManager: "Marketing Manager",
  viewer: "Viewer",
};
</script>

<template>
  <header>
    <nav v-if="isAuthenticated" class="nav-bar">
      <!-- Left side: Navigation Links -->
      <div class="nav-links">
        <RouterLink
          v-if="isSalesManager"
          to="/processes/new"
          class="nav-btn btn-no-fill"
        >
          Opret sag
        </RouterLink>
        <RouterLink
          v-if="isSalesManager"
          to="/my-processes"
          class="nav-btn btn-no-fill nav-btn-badge"
        >
          Mine sager
          <span class="badge" v-if="salesManagerCount > 0">{{
            salesManagerCount
          }}</span>
        </RouterLink>
        <RouterLink
          to="/all-processes"
          class="nav-btn btn-no-fill nav-btn-badge"
        >
          Alle sager
          <span
            class="badge"
            v-if="isMarketingManager && marketingManagerCount > 0"
            >{{ marketingManagerCount }}</span
          >
        </RouterLink>
      </div>

      <!-- Right side: User actions -->
      <div class="user-actions">
        <div v-if="user" class="user-info">
          <span class="user-name">{{ user.name }}</span>
          <span class="user-role">{{ roleLabels[user.role] }}</span>
        </div>
        <RouterLink to="/profile" class="edit-user-btn btn-no-fill">
          Edit user
        </RouterLink>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <!-- Login view header -->
    <nav v-else class="nav-bar login-nav">
      <div></div>
      <div class="user-actions">
        <RouterLink 
          :to="$route.query.signup === 'true' ? '/login' : '/login?signup=true'" 
          class="btn"
        >
          {{ $route.query.signup === 'true' ? 'Login' : 'Sign Up' }}
        </RouterLink>
      </div>
    </nav>
  </header>
</template>

<style scoped lang="scss">
@import "@/scss/variables";

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

    .nav-btn-badge {
      position: relative;

      .badge {
        position: absolute;
        bottom: -18px;
        right: -18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 24px;
        padding: 0.2rem;
        background-color: $warning-500-main;
        color: black;
        border-radius: 50%;
        font-size: 0.8rem;
        font-weight: 600;
        border: 3px solid white;
      }
    }

    .user-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-left: auto;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.2rem;
      padding-right: 1rem;
      border-right: 1px solid #ddd;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.95rem;
    }

    .user-role {
      font-size: 0.8rem;
      color: #666;
      text-transform: capitalize;
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
