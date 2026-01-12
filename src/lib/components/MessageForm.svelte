<script>
  import { language, t } from "$lib/stores/language";
  import ImageInput from "./ImageInput.svelte";

  const { message, user, forest } = $props();
</script>

<h2 class="text-xl font-semibold text-card-foreground mb-4">
  {t("generalInformation", $language)}
</h2>
<div class="space-y-3">
  <div class="flex justify-between items-center py-2">
    <label for="username">{t("username", $language)}</label>
    <strong id="username" class="text-foreground"
      >{user?.displayName || "Loading..."}</strong
    >
  </div>

  <div class="flex justify-between items-center py-2">
    <label for="forest">{t("foodGarden", $language)}</label>
    <strong id="forest" class="text-foreground"
      >{forest?.name || "Loading..."}</strong
    >
  </div>
</div>

<div class="border-t border-border my-6"></div>

<h2 class="text-xl font-semibold text-card-foreground mb-4">
  {t("message", $language)}
</h2>
<div class="space-y-3">
  <textarea
    name="message"
    id="message"
    rows="5"
    class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
    >{message?.message}</textarea
  >
</div>

<div class="border-t border-border my-6"></div>

<h2 class="text-xl font-semibold text-card-foreground mb-4">
  {t("image", $language)}
</h2>
<div class="space-y-3">
  <ImageInput name="image" image={message?.image} />
</div>

<div class="border-t border-border my-6"></div>

<div class="space-y-3">
  <input
    type="submit"
    value={t("save", $language)}
    class="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer"
  />
</div>
