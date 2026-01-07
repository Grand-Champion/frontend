<script>
  import { language, t } from "$lib/stores/language";
  import ImageInput from "./ImageInput.svelte";
  const { message, user, forest } = $props();
</script>

<label for="user">user</label>
<input type="number" name="userId" id="user" value={user.id} class="border rounded-1" />

<label for="forest">forest</label>
<input type="number" name="foodForestId" id="forest" value={forest.id} class="border rounded-1" />

<div class="flex justify-between py-2">
    <label for="message">{t("message", $language)}</label>
    <input type="text" name="message" id="message" value={message?.message} class="border rounded-l" />
</div>

<div class="space-y-3">
    <ImageInput image={message?.image} />
</div>

<div class="space-y-3">
    <input type="submit" value="{t("save", $language)}" class="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer">
</div>