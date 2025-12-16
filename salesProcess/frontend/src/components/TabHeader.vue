<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from "@/composables/useAuth";

const { isAuthenticated, isSalesManager, isViewer } = useAuth();
const route = useRoute();
const router = useRouter();
const activeTab = ref('ongoing');

defineProps({
  ongoingCount: {
    type: Number,
    default: 0
  }
});

// Watch route changes to update active tab
watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    activeTab.value = newTab;
  }
}, { immediate: true });

const switchTab = (tab) => {
  activeTab.value = tab;
  router.push({
    path: route.path,
    query: { tab }
  });
};
</script>

<template>
  <div v-if="isAuthenticated && !isViewer" class="tab-header">
    <div class="tab-buttons">
      <button 
        :class="['tab-btn', { active: activeTab === 'ongoing' }]"
        @click="switchTab('ongoing')"
      >
        <span class="material-symbols-outlined">clock_loader_10</span> Ongoing
        <span class="badge" v-if="ongoingCount > 0 && route.path.includes('my-processes')">{{ ongoingCount }}</span>
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'completed' }]"
        @click="switchTab('completed')"
      >
        <span class="material-symbols-outlined">folder_check</span> Completed
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/scss/variables';

.tab-header {
  padding: 0 2rem;

  .tab-buttons {
    display: flex;
    justify-content: space-evenly;
  }

  .tab-btn {
    padding: 0.6rem 1.2rem;
    border: none;
    background-color: transparent;
    color: #666;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    border-bottom: 1px solid $primary-jkf-blue;
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;

    &:hover {
      color: $primary-jkf-blue;
      border-bottom: 3px solid $primary-jkf-blue;
    }

    &.active {
      color: $primary-jkf-blue;
      border-bottom: 3px solid $primary-jkf-blue;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: .3rem;
      background-color: $warning-500-main;
      color: black;
      border-radius: 50%;
      font-size: 0.8rem;
      font-weight: 600;
      margin-left: 0.5rem;
    }

    .material-symbols-outlined {
      margin: 0;
  }
}}
</style>
