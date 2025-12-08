<script>
    import { selectedCategories, selectedStatus } from "$lib/stores/filters";
    import { Leaf, Trees, Flower2, Sprout, ChevronDown } from "lucide-svelte";
    import { language, t } from "$lib/stores/language";

    $: categoryConfig = {
        tree: {
            label: t("trees", $language),
            icon: Trees,
            color: "bg-emerald-600",
        },
        shrub: {
            label: t("shrubs", $language),
            icon: Sprout,
            color: "bg-teal-600",
        },
        herb: {
            label: t("herbs", $language),
            icon: Leaf,
            color: "bg-lime-600",
        },
        vegetable: {
            label: t("vegetables", $language),
            icon: Flower2,
            color: "bg-amber-600",
        },
    };

    $: statusConfig = {
        good: { label: t("good", $language) },
        attention: { label: t("needsAttention", $language) },
        critical: { label: t("critical", $language) },
    };

    let speciesOpen = true;
    let statusOpen = true;

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

    function toggleStatus(status, checked) {
        if (typeof checked === "boolean") {
            selectedStatus.update((statuses) =>
                checked
                    ? [...new Set([...statuses, status])]
                    : statuses.filter((s) => s !== status),
            );
            return;
        }

        selectedStatus.update((statuses) => {
            if (statuses.includes(status)) {
                const next = statuses.filter((s) => s !== status);
                return next;
            } else {
                const next = [...statuses, status];
                return next;
            }
        });
    }

    function statusDotClass(status) {
        switch (status) {
            case "good":
                return "bg-green-500";
            case "attention":
                return "bg-orange-500";
            case "critical":
                return "bg-red-500";
            default:
                return "bg-gray-300";
        }
    }
</script>

<div class="p-6">
    <div class="mb-6">
        <button
            on:click={() => (speciesOpen = !speciesOpen)}
            class="flex w-full items-center justify-between text-xl font-semibold text-card-foreground"
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
                    <label class="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={$selectedCategories.includes(category)}
                            on:change={(e) =>
                                toggleCategory(category, e.target.checked)}
                            class="rounded"
                        />
                        <svelte:component this={config.icon} class="h-4 w-4" />
                        {config.label}
                    </label>
                {/each}
            </div>
        {/if}
    </div>

    <div>
        <button
            on:click={() => (statusOpen = !statusOpen)}
            class="flex w-full items-center justify-between text-xl font-semibold text-card-foreground"
        >
            {t("filterByStatus", $language)}
            <span
                class={"transition-transform " +
                    (statusOpen ? "rotate-180" : "")}
            >
                <ChevronDown class="h-5 w-5" />
            </span>
        </button>

        {#if statusOpen}
            <div class="mt-4 space-y-4">
                {#each Object.entries(statusConfig) as [status, config]}
                    <label class="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={$selectedStatus.includes(status)}
                            on:change={(e) =>
                                toggleStatus(status, e.target.checked)}
                            class="rounded"
                        />
                        <div
                            class={"inline-block h-3 w-3 rounded-full " +
                                statusDotClass(status)}
                            aria-hidden="true"
                        ></div>
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
