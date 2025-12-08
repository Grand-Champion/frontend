<script>
  import { Map, Grid3X3, Home, Sun, Moon, Languages } from "lucide-svelte";
  import { page } from "$app/stores";
  import { theme } from "$lib/stores/theme";
  import { language, t } from "$lib/stores/language";

  function toggleTheme() {
    theme.update((current) => (current === "light" ? "dark" : "light"));
  }

  function toggleLanguage() {
    language.update((current) => (current === "en" ? "nl" : "en"));
  }
</script>

<nav class="bg-background border-b border-border">
  <div class="flex items-center justify-between h-16 px-6">
    <div class="flex items-center gap-8">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
        >
          <span class="text-primary-foreground font-semibold text-sm">FF</span>
        </div>
        <span class="font-semibold text-lg">Food Forest</span>
      </div>

      <div class="flex gap-1">
        <a
          href="/"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page
            .url.pathname === '/'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
        >
          <Home class="w-4 h-4" />
          <span class="font-medium">{t("home", $language)}</span>
        </a>

        <a
          href="/map"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page
            .url.pathname === '/map'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
        >
          <Map class="w-4 h-4" />
          <span class="font-medium">{t("mapView", $language)}</span>
        </a>

        <a
          href="/species"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page
            .url.pathname === '/species'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
        >
          <Grid3X3 class="w-4 h-4" />
          <span class="font-medium">{t("speciesList", $language)}</span>
        </a>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- Theme Toggle -->
      <button
        on:click={toggleTheme}
        class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
        aria-label="Toggle theme"
      >
        {#if $theme === "light"}
          <Sun class="w-4 h-4" />
        {:else}
          <Moon class="w-4 h-4" />
        {/if}
      </button>

      <!-- Language Toggle -->
      <button
        on:click={toggleLanguage}
        class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
        aria-label="Toggle language"
      >
        <Languages class="w-4 h-4" />
        <span class="font-medium text-sm"
          >{$language === "en" ? "NL" : "EN"}</span
        >
      </button>
    </div>
  </div>
</nav>
