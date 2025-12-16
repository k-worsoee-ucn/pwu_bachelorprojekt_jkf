<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from "@/composables/useAuth";

const { isAuthenticated, isSalesManager, isViewer } = useAuth();
const route = useRoute();
const router = useRouter();
const activeTab = ref('ongoing');

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
        ⏳ Ongoing
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'completed' }]"
        @click="switchTab('completed')"
      >
        ✓ Completed
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/scss/variables';

.tab-header {
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;

  .tab-buttons {
    display: flex;
    justify-content: space-evenly;
    gap: 1rem;
  }

  .tab-btn {
    padding: 0.6rem 1.2rem;
    border: none;
    background-color: transparent;
    color: #666;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    font-weight: 500;
    border-bottom: 3px solid transparent;
    position: relative;
    width: 100%;

    &:hover {
      color: $primary-jkf-blue;
    }

    &.active {
      color: $primary-jkf-blue;
      border-bottom-color: $primary-jkf-blue;
    }
  }
}
</style>
