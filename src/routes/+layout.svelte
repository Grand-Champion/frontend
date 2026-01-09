<script>
  import "../app.css";
  import Navigation from "$lib/components/navigation.svelte";
  import { page } from "$app/stores";
  import { getContext, onMount, setContext } from "svelte";
  import { theme } from "$lib/stores/theme";

  // Make plant detail pages, species pages, home page, and management page scrollable
  $: isPlantPage = $page.url.pathname.startsWith("/plants/");
  $: isSpeciesPage = $page.url.pathname.startsWith("/species");
  $: isHomePage = $page.url.pathname === "/";
  $: isManagementPage = $page.url.pathname === "/management";
  $: isLoginPage = $page.url.pathname === "/login";
  $: isScrollable =
    isPlantPage || isSpeciesPage || isHomePage || isManagementPage || isLoginPage;

  export let data;

  $: forests = data.forestsData?.data;
  let forestId = data.forestId;
  
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

<div class="h-screen w-full flex flex-col">
  <Navigation {forests} {forestId} />
  <main
    class="flex-1"
    class:overflow-auto={isScrollable}
    class:overflow-hidden={!isScrollable}
  >
    <slot />
  </main>
</div>
