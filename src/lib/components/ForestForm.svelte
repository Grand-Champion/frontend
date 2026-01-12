<script>
    import { language, t } from "$lib/stores/language";
    import PlantLocationSelector from "$lib/components/PlantLocationSelector.svelte";
    import SelectOption from "$lib/components/SelectOption.svelte";
    import ImageInput from "./ImageInput.svelte";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { getPayload, getUsers } from "$lib/Auth";
    const { jwt, forest } = $props();
    const users = $state([]);
    onMount(async ()=>{ 
        if (browser && (!jwt || getPayload(jwt)?.role !== "admin")) {
            goto("/");
        }
        if(browser && jwt){
            await users.push(...(await getUsers(jwt)));
        }
    });
</script>

<div class="space-y-3">
    <div class="flex justify-between py-2">
        <label for="name">{t("name", $language)}</label>
        <input type="text" name="name" id="name" value={forest?.name} class="border rounded-l" />
    </div>

    <div class="flex justify-between py-2">
        <label for="location">{t("location", $language)}</label>
        <input type="text" name="location" id="location" value={forest?.location} class="border rounded-l" />
    </div>

    {#if (getPayload(jwt).role == "admin")}
        <div class="flex justify-between py-2">
            <label for="ownerId">{t("owner", $language)}</label>
            <select name="ownerId" id="ownerId" class="border rounded-l">
                {#if users}
                    {#each users as s}
                        <SelectOption value={s.id} name="{s.displayName} ({s.email})" currentValue={forest?.ownerId} />
                    {/each}
                {/if}
            </select>
        </div>
    {/if}
</div>

<div class="space-y-3">
    <ImageInput image={forest?.image} />
</div>

<div class="space-y-3">
    <input type="submit" value="{t("save", $language)}" class="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer">
</div>