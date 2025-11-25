<script>
  import "../app.css";
  import Navigation from "$lib/components/navigation.svelte";
  import { page } from "$app/stores";

  // Make plant detail pages scrollable by enabling overflow-auto on <main>
  $: isPlantPage = $page.url.pathname.startsWith("/plant/");
</script>

<div class="h-screen w-full flex flex-col">
  <Navigation />
  <main
    class="flex-1"
    class:overflow-auto={isPlantPage}
    class:overflow-hidden={!isPlantPage}
  >
    <slot />
  </main>
</div>
