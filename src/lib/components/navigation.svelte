<script>
  import { Map, Grid3X3 } from 'lucide-svelte'
  import { page } from '$app/stores'
</script>

<nav class="bg-background border-b border-border">
  <div class="flex items-center h-16 px-6">
    <div class="flex items-center gap-2 mr-8">
      <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <span class="text-primary-foreground font-semibold text-sm">FF</span>
      </div>
      <span class="font-semibold text-lg">Food Forest</span>
    </div>

    <div class="flex gap-1">
      <a
        href="/"
        class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page.url.pathname === '/'
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-emerald-200'}"
      >
        <Map class="w-4 h-4" />
        <span class="font-medium">Map View</span>
      </a>

      <a
        href="/species"
        class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page.url.pathname === '/species'
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-emerald-200'}"
      >
        <Grid3X3 class="w-4 h-4" />
        <span class="font-medium">Species List</span>
      </a>
    </div>
  </div>
</nav>
