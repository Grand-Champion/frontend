<script>
  import "../app.css";
  import Navigation from "$lib/components/navigation.svelte";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { theme } from "$lib/stores/theme";

  // Make plant detail pages and home page scrollable
  $: isPlantPage = $page.url.pathname.startsWith("/plant/");
  $: isHomePage = $page.url.pathname === "/";
  $: isManagementPage = $page.url.pathname === "/management";
  $: isLoginPage = $page.url.pathname === "/login";
  $: isScrollable = isPlantPage || isHomePage || isManagementPage;

  // Initialize theme on mount
  onMount(() => {
    if ($theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  });
</script>

<svelte:head>
  <script>
    // Prevent flash of wrong theme by applying theme class immediately
    (function () {
      const theme = localStorage.getItem("theme");
      if (
        theme === "dark" ||
        (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
      }
    })();
  </script>
</svelte:head>

<div class="h-[100dvh] w-full flex flex-col">
  <Navigation />
  <main
    class="flex-1"
    class:overflow-auto={isScrollable}
    class:overflow-hidden={!isScrollable}
  >
    <slot />
  </main>
</div>
