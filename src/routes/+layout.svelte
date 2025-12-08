<script>
  import "../app.css";
  import Navigation from "$lib/components/navigation.svelte";
  import { page } from "$app/stores";

  // Make plant detail pages and home page scrollable
  $: isPlantPage = $page.url.pathname.startsWith("/plant/");
  $: isHomePage = $page.url.pathname === "/";
  $: isScrollable = isPlantPage || isHomePage;
</script>

<div class="h-screen w-full flex flex-col">
  <Navigation />
  <main
    class="flex-1"
    class:overflow-auto={isScrollable}
    class:overflow-hidden={!isScrollable}
  >
    <slot />
  </main>
</div>
