<script>
    import { jwt } from "$lib/stores/jwt";
    import { getPayload, getUser, getUsers, headers } from "$lib/Auth";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { language, t } from "$lib/stores/language";
    import {
        Pencil,
        Plus,
        Trash2,
        ChevronUp,
        ChevronDown,
        Search,
    } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import { PUBLIC_API_URL } from "$env/static/public";
    let { data } = $props();
    let forestsData = data.forestsData.data;
    const users = $state({});
    let sortColumn = $state("id");
    let sortDirection = $state("asc");
    let searchFilter = $state("");

    function setSortColumn(column) {
        if (sortColumn === column) {
            sortDirection = sortDirection === "asc" ? "desc" : "asc";
        } else {
            sortColumn = column;
            sortDirection = "asc";
        }
    }

    function getSortedData() {
        const filtered = forestsData.filter((forest) => {
            if (!searchFilter.trim()) return true;
            const search = searchFilter.toLowerCase();
            return (
                forest.id.toString().toLowerCase().includes(search) ||
                forest.name.toLowerCase().includes(search) ||
                forest.location.toLowerCase().includes(search) ||
                (users[forest.ownerId]?.displayName || "")
                    .toLowerCase()
                    .includes(search)
            );
        });
        const sorted = [...filtered].sort((a, b) => {
            let aValue = a[sortColumn];
            let bValue = b[sortColumn];

            if (aValue === null || aValue === undefined) aValue = "";
            if (bValue === null || bValue === undefined) bValue = "";

            if (typeof aValue === "string") {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
                return sortDirection === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (typeof aValue === "number") {
                return sortDirection === "asc"
                    ? aValue - bValue
                    : bValue - aValue;
            }

            if (aValue instanceof Date && bValue instanceof Date) {
                return sortDirection === "asc"
                    ? aValue.getTime() - bValue.getTime()
                    : bValue.getTime() - aValue.getTime();
            }

            return 0;
        });
        return sorted;
    }

    function formatDate(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleString("nl-NL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    }

    onMount(async () => {
        if (browser && (!$jwt || getPayload($jwt)?.role !== "admin")) {
            goto("/");
        }
        if (browser && $jwt) {
            for (const user of await getUsers($jwt)) {
                users[user.id] = user;
            }
        }
    });

    async function openDeleteConfirm(forestId) {
        if (confirm(t("confirmDeleteForest", $language))) {
            const request = await fetch(
                PUBLIC_API_URL + "/forests/api/v1/forests/" + forestId,
                {
                    method: "DELETE",
                    headers: headers($jwt),
                },
            );
            if (request.ok) {
                window?.navigation.reload();
            } else {
                throw new Error(response.message);
            }
        }
    }
</script>

<svelte:head>
    <title>{t("forestsManagement", $language)}</title>
</svelte:head>

<div class="min-h-screen bg-background p-4 md:p-6">
    <div class="max-w-6xl mx-auto">
        <div class="mb-6 md:mb-8">
            <h1 class="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {t("forestsManagement", $language)}
            </h1>
            <p class="text-sm md:text-base text-muted-foreground">
                {t("forestManagement", $language)}
            </p>
        </div>

        <div
            class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
            <button
                onclick={() => {
                    goto("/forests/create");
                }}
                class="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer w-full md:w-auto"
            >
                <Plus class="w-4 h-4" />
                {t("createForest", $language)}
            </button>
            <div
                class="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground w-full md:w-80"
            >
                <Search class="h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    bind:value={searchFilter}
                    placeholder={t("search", $language)}
                    class="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
                />
            </div>
        </div>

        <div class="bg-card border border-border rounded-lg overflow-hidden">
            <div class="hidden md:block overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-muted">
                        <tr>
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                                onclick={() => setSortColumn("id")}
                            >
                                <div class="flex items-center gap-2">
                                    ID
                                    {#if sortColumn === "id"}
                                        {#if sortDirection === "asc"}
                                            <ChevronUp class="w-4 h-4" />
                                        {:else}
                                            <ChevronDown class="w-4 h-4" />
                                        {/if}
                                    {/if}
                                </div>
                            </th>
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                                onclick={() => setSortColumn("name")}
                            >
                                <div class="flex items-center gap-2">
                                    {t("name", $language)}
                                    {#if sortColumn === "name"}
                                        {#if sortDirection === "asc"}
                                            <ChevronUp class="w-4 h-4" />
                                        {:else}
                                            <ChevronDown class="w-4 h-4" />
                                        {/if}
                                    {/if}
                                </div>
                            </th>
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                                onclick={() => setSortColumn("location")}
                            >
                                <div class="flex items-center gap-2">
                                    {t("location", $language)}
                                    {#if sortColumn === "location"}
                                        {#if sortDirection === "asc"}
                                            <ChevronUp class="w-4 h-4" />
                                        {:else}
                                            <ChevronDown class="w-4 h-4" />
                                        {/if}
                                    {/if}
                                </div>
                            </th>
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                                onclick={() => setSortColumn("ownerId")}
                            >
                                <div class="flex items-center gap-2">
                                    {t("owner", $language)}
                                    {#if sortColumn === "ownerId"}
                                        {#if sortDirection === "asc"}
                                            <ChevronUp class="w-4 h-4" />
                                        {:else}
                                            <ChevronDown class="w-4 h-4" />
                                        {/if}
                                    {/if}
                                </div>
                            </th>
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                                onclick={() => setSortColumn("createdAt")}
                            >
                                <div class="flex items-center gap-2">
                                    {t("createdAt", $language)}
                                    {#if sortColumn === "createdAt"}
                                        {#if sortDirection === "asc"}
                                            <ChevronUp class="w-4 h-4" />
                                        {:else}
                                            <ChevronDown class="w-4 h-4" />
                                        {/if}
                                    {/if}
                                </div>
                            </th>
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                                onclick={() => setSortColumn("updatedAt")}
                            >
                                <div class="flex items-center gap-2">
                                    {t("updatedAt", $language)}
                                    {#if sortColumn === "updatedAt"}
                                        {#if sortDirection === "asc"}
                                            <ChevronUp class="w-4 h-4" />
                                        {:else}
                                            <ChevronDown class="w-4 h-4" />
                                        {/if}
                                    {/if}
                                </div>
                            </th>
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors"
                            >
                                {t("actions", $language)}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        {#each getSortedData() as forest}
                            <tr class="hover:bg-muted/50">
                                <td class="px-6 py-4 text-sm text-foreground"
                                    >{forest.id}</td
                                >
                                <td class="px-6 py-4 text-sm text-foreground"
                                    >{forest.name}</td
                                >
                                <td class="px-6 py-4 text-sm text-foreground"
                                    >{forest.location}</td
                                >
                                <td class="px-6 py-4 text-sm text-foreground"
                                    >{users[forest.ownerId]?.displayName}</td
                                >
                                <td
                                    class="px-6 py-4 text-sm text-muted-foreground"
                                    >{formatDate(forest.createdAt)}</td
                                >
                                <td
                                    class="px-6 py-4 text-sm text-muted-foreground"
                                    >{formatDate(forest.updatedAt)}</td
                                >
                                <td
                                    class="px-6 py-4 text-sm text-foreground flex gap-2"
                                >
                                    <button
                                        onclick={() =>
                                            goto(`/forests/${forest.id}/edit`)}
                                        class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
                                        style="background-color: color-mix(in oklch, var(--action-icon) 12%, transparent); color: var(--foreground);"
                                        aria-label="Edit forest"
                                    >
                                        <Pencil class="w-4 h-4" />
                                        {t("edit", $language)}
                                    </button>
                                    <button
                                        onclick={() =>
                                            openDeleteConfirm(forest.id)}
                                        class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
                                        style="background-color: color-mix(in oklch, var(--status-critical) 18%, transparent); color: var(--status-critical);"
                                        aria-label="Delete forest"
                                    >
                                        <Trash2 class="w-4 h-4" />
                                        {t("delete", $language)}
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- Mobile Card View -->
            <div class="md:hidden p-3 space-y-3">
                {#each getSortedData() as forest}
                    <div
                        class="bg-muted/50 border border-border rounded-lg p-4 space-y-3"
                    >
                        <!-- Forest Info Cards -->
                        <div class="space-y-2">
                            <div>
                                <p class="text-xs text-muted-foreground">
                                    {t("name", $language)}
                                </p>
                                <p
                                    class="text-sm font-semibold text-foreground"
                                >
                                    {forest.name}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-muted-foreground">
                                    {t("location", $language)}
                                </p>
                                <p class="text-sm text-foreground">
                                    {forest.location}
                                </p>
                            </div>
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-xs text-muted-foreground">
                                        {t("owner", $language)}
                                    </p>
                                    <p class="text-sm text-foreground">
                                        {users[forest.ownerId]?.displayName}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p class="text-xs text-muted-foreground">
                                        {t("createdAt", $language)}
                                    </p>
                                    <p class="text-xs text-foreground">
                                        {formatDate(forest.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-muted-foreground">
                                    {t("updatedAt", $language)}
                                </p>
                                <p class="text-xs text-foreground">
                                    {formatDate(forest.updatedAt)}
                                </p>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-2 justify-end">
                            <button
                                onclick={() =>
                                    goto(`/forests/${forest.id}/edit`)}
                                class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
                                style="background-color: color-mix(in oklch, var(--action-icon) 12%, transparent); color: var(--foreground);"
                                aria-label="Edit forest"
                            >
                                <Pencil class="w-4 h-4" />
                                {t("edit", $language)}
                            </button>
                            <button
                                onclick={() => openDeleteConfirm(forest.id)}
                                class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
                                style="background-color: color-mix(in oklch, var(--status-critical) 18%, transparent); color: var(--status-critical);"
                                aria-label="Delete forest"
                            >
                                <Trash2 class="w-4 h-4" />
                                {t("delete", $language)}
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
