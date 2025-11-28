<script setup>
</script>

<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/login">Login</RouterLink>
    <RouterLink to="/my-processes">My Processes</RouterLink>
    <RouterLink to="/all-processes">All Processes</RouterLink>
    <RouterLink to="/create-new-process">Create New Process</RouterLink>
  </nav>
  
  <RouterView />
</template>

<style scoped lang="scss">
nav {
  padding: 1rem;
  border-bottom: 1px solid #ccc;

  a {
    margin-right: 1rem;
    text-decoration: none;
    color: #333;

    &:hover {
      color: #666;
    }
  }
}
</style>

<style lang="scss">
* {
  font-family: Titillium Web;
}

body {
  max-width: 1920px;
  margin: 0 auto;
}
</style>
