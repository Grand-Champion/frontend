<script>
    import { selectedCategories } from "$lib/stores/filters";
    import { Leaf, Trees, Flower2, Sprout, ChevronDown } from "lucide-svelte";
    import { language, t } from "$lib/stores/language";

    // Category config for species types
    $: categoryConfig = {
        tree: {
            label: t("trees", $language),
            icon: Trees,
            color: "var(--category-tree)",
        },
        shrub: {
            label: t("shrubs", $language),
            icon: Sprout,
            color: "var(--category-shrub)",
        },
        herb: {
            label: t("herbs", $language),
            icon: Leaf,
            color: "var(--category-herb)",
        },
        vegetable: {
            label: t("vegetables", $language),
            icon: Flower2,
            color: "var(--category-vegetable)",
        },
    };

    let speciesOpen = true;

    // Support both direct toggle calls and explicit checked values from inputs
    function toggleCategory(category, checked) {
        // If called from an input change, the event handler will pass a boolean
        if (typeof checked === "boolean") {
            selectedCategories.update((categories) =>
                checked
                    ? [...new Set([...categories, category])]
                    : categories.filter((c) => c !== category),
            );
            return;
        }

        // Fallback toggle behavior
        selectedCategories.update((categories) => {
            if (categories.includes(category)) {
                const next = categories.filter((c) => c !== category);
                return next;
            } else {
                const next = [...categories, category];
                return next;
            }
        });
    }
</script>

<div class="p-6">
    <div class="mb-6">
        <button
            on:click={() => (speciesOpen = !speciesOpen)}
            class="flex w-full items-center justify-between text-xl font-semibold text-card-foreground cursor-pointer"
        >
            {t("filterBySpecies", $language)}
            <span
                class={"transition-transform " +
                    (speciesOpen ? "rotate-180" : "")}
            >
                <ChevronDown class="h-5 w-5" />
            </span>
        </button>

        {#if speciesOpen}
            <div class="mt-4 space-y-4">
                {#each Object.entries(categoryConfig) as [category, config]}
                    <label
                        class="flex items-center gap-2 text-sm cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            checked={$selectedCategories.includes(category)}
                            on:change={(e) =>
                                toggleCategory(category, e.target.checked)}
                            class="rounded cursor-pointer"
                        />
                        <svelte:component
                            this={config.icon}
                            class="h-4 w-4"
                            style="color: {config.color}"
                        />
                        {config.label}
                    </label>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    /* keep the file light — layout classes live in parent containers */
</style>