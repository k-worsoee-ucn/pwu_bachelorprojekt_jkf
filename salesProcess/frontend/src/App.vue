<script setup>
import { onMounted, ref, provide, watch } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useRoute } from "vue-router";
import Header from "./components/Header.vue";
import TabHeader from "./components/TabHeader.vue";

const { initAuth, getAuthHeader, user, isSalesManager, isMarketingManager } = useAuth();
const route = useRoute();
const salesManagerCount = ref(0);
const marketingManagerCount = ref(0);

provide("salesManagerCount", salesManagerCount);
provide("marketingManagerCount", marketingManagerCount);

const updateBadgeCounts = async () => {
  try {
    const response = await fetch("/api/processes", {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await response.json();
    
    // Calculate sales manager count (my processes)
    if (isSalesManager.value && user.value?.id) {
      const userProcesses = data.filter(
        (process) => process.sale?.salesManager?.id === user.value.id
      );
      const ongoingCount = userProcesses.filter((process) => process.currentStep < 6).length;
      salesManagerCount.value = ongoingCount;
    }
    
    // Calculate marketing manager count (all processes)
    if (isMarketingManager.value) {
      const ongoingCount = data.filter(
        (process) => process.status !== "completed" && process.status !== "done"
      ).length;
      marketingManagerCount.value = ongoingCount;
    }
  } catch (error) {
    console.error("Error fetching processes for badge counts:", error);
  }
};

onMounted(() => {
  initAuth();
  updateBadgeCounts();
});

// Watch route changes and update badge counts when needed
watch(
  () => route.path,
  (newPath) => {
    if (newPath.includes("/processes") || newPath === "/my-processes" || newPath === "/all-processes") {
      updateBadgeCounts();
    }
  }
);

// Also update counts when user changes
watch(
  () => user.value,
  () => {
    updateBadgeCounts();
  }
);
</script>

<template>
  <Header
    :salesManagerCount="salesManagerCount"
    :marketingManagerCount="marketingManagerCount"
  />
  <TabHeader v-if="$route.path === '/my-processes' || $route.path === '/all-processes'" />

  <RouterView />
</template>

<style lang="scss">
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css");
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined");

* {
  font-family: Titillium Web;
}

body {
  max-width: 1920px;
  margin: 0 auto;
}

.material-symbols-outlined {
  font-family: "Material Symbols Outlined";
  font-weight: normal;
  font-style: normal;
  font-size: 1.25em;
  display: inline-flex;
  align-items: center;
  margin-right: 0.5rem;
  line-height: 1;
  letter-spacing: normal;
}
</style>
