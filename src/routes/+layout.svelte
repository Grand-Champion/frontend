<script>
  import '../app.css'
  import Navigation from '$lib/components/navigation.svelte'
  
  let { children } = $props()
</script>

<div class="h-screen w-full flex flex-col overflow-hidden">
  <Navigation />
  <main class="flex-1 overflow-hidden">
    {@render children()}
  </main>
</div>
