<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
      <RouterLink to="/my-processes">My Processes</RouterLink>
      <RouterLink to="/all-processes">All Processes</RouterLink>
      <RouterLink to="/create-new-process">Create New Process</RouterLink>
    </nav>
  </header>
</template>

<style scoped lang="scss">
header {
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
}
</style>