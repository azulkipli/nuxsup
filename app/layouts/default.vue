<template>
  <header>
    <nav>
      <ul>
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/about">About</NuxtLink></li>
      </ul>
    </nav>
  </header>

  <main class="flex-grow">
    <slot />
  </main>

  <footer>
    <p>© 2026 Nuxsup. All rights reserved.</p>
  </footer>
</template>
