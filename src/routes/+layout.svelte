<script>
  import "../app.css";
  import Navigation from "$lib/components/navigation.svelte";
  import { page } from "$app/stores";
  import { getContext, onMount, setContext } from "svelte";
  import { theme } from "$lib/stores/theme";

  // Make plant detail pages, species pages, home page, and management page scrollable
  $: isScrollable = !$page.url.pathname.endsWith("/map");

  export let data;

  $: forests = data.forestsData?.data;
  $: forestId = data.forestId;

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

<div class="h-screen w-full flex flex-col overflow-hidden">
  <Navigation {forests} {forestId} />
  <main class="flex-1 overflow-hidden" class:overflow-y-auto={isScrollable}>
    <slot />
  </main>
</div>

<style global>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  :global(html) {
    overflow: hidden;
  }
</style>
