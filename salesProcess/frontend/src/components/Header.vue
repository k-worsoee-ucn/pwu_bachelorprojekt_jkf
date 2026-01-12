<script setup>
import { useAuth } from "@/utils/useAuth";

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
          class=" btn-no-fill"
        >
          Create new process
        </RouterLink>
        <RouterLink
          v-if="isSalesManager"
          to="/my-processes"
          class="btn-no-fill nav-btn-badge"
        >
          My processes
          <span class="badge" v-if="salesManagerCount > 0">{{
            salesManagerCount
          }}</span>
        </RouterLink>
        <RouterLink
          to="/all-processes"
          class="btn-no-fill nav-btn-badge"
        >
          All processes
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
        <button @click="logout" class="error-btn">Logout</button>
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
    padding: 2rem 2rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;

  @media (max-width: 1024px) {
    justify-content: center;
  }

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
        border-radius: 50%;
        border: 3px solid white;
      }
    }

    .user-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      padding-right: 1rem;
      border-right: 1px solid $neutral-500-light;
    }

    .user-role {
      color: $neutral-500;
      font-weight: 400;
    }
  }
}
</style>
