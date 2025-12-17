<script setup>
import { onMounted, ref, provide } from "vue";
import { useAuth } from "@/composables/useAuth";
import Header from "./components/Header.vue";
import TabHeader from "./components/TabHeader.vue";

const { initAuth } = useAuth();
const salesManagerCount = ref(0);
const marketingManagerCount = ref(0);

provide("salesManagerCount", salesManagerCount);
provide("marketingManagerCount", marketingManagerCount);

onMounted(() => {
  initAuth();
});
</script>

<template>
  <Header
    :salesManagerCount="salesManagerCount"
    :marketingManagerCount="marketingManagerCount"
  />
  <TabHeader />

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
