<script setup>
import { onMounted, ref, provide, watch } from "vue";
import { useAuth } from "@/utils/useAuth";
import { useRoute } from "vue-router";
import Header from "./components/Header.vue";
import TabHeader from "./components/TabHeader.vue";

const { initAuth, user, isSalesManager, isMarketingManager } =
  useAuth();
const route = useRoute();
const salesManagerCount = ref(0);
const marketingManagerCount = ref(0);

provide("salesManagerCount", salesManagerCount);
provide("marketingManagerCount", marketingManagerCount);

const updateBadgeCounts = async () => {
  try {
    const response = await fetch("/api/processes", {
      credentials: 'include',
    });
    const data = await response.json();

    // Calculate sales manager required actions
    if (isSalesManager.value && user.value?.id) {
      const userProcesses = data.filter(
        (process) => process.sale?.salesManager?.id === user.value.id
      );
      const salesManagerSteps = [1, 4];
      const actionsRequired = userProcesses.filter(
        (process) =>
          salesManagerSteps.includes(process.currentStep) &&
          process.status !== "completed"
      ).length;
      salesManagerCount.value = actionsRequired;
    }

    // Calculate marketing manager required actions
    if (isMarketingManager.value) {
      const marketingManagerSteps = [3, 5, 6];
      const actionsRequired = data.filter(
        (process) =>
          marketingManagerSteps.includes(process.currentStep) &&
          process.status !== "completed"
      ).length;
      marketingManagerCount.value = actionsRequired;
    }
  } catch (error) {
    console.error("Error fetching processes for badge counts:", error);
  }
};

onMounted(() => {
  initAuth();
  updateBadgeCounts();
});


watch(
  () => route.path,
  (newPath) => {
    if (
      newPath.includes("/processes") ||
      newPath === "/my-processes" ||
      newPath === "/all-processes"
    ) {
      updateBadgeCounts();
    }
  }
);

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
  <TabHeader
    v-if="$route.path === '/my-processes' || $route.path === '/all-processes'"
  />

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
