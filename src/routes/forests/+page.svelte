<script>
    import { jwt } from "$lib/stores/jwt";
    import { getPayload, getUser, getUsers, headers } from "$lib/Auth";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { language, t } from "$lib/stores/language";
    import { Pencil, Plus, Trash2 } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import { PUBLIC_API_URL } from '$env/static/public';
    let { data } = $props();
    let forestsData = data.forestsData.data;
    const users = $state({});
    
    onMount(async ()=>{ 
        if (browser && (!$jwt || getPayload($jwt)?.role !== "admin")) {
            goto("/");
        }
        if(browser && $jwt){
            for(const user of await getUsers($jwt)){
                users[user.id] = user;
            }
        }
    });

    async function openDeleteConfirm(forestId){
        if(confirm(t("confirmDeleteForest", $language))){
            const request = await fetch(PUBLIC_API_URL + "/forests/api/v1/forests/" + forestId, {
                method: "DELETE",
                headers: headers($jwt)
            });
            if(request.ok){
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
        </div>
        <div>
            <button onclick={()=>{goto("/forests/create")}} class="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer w-full md:w-auto">
                <Plus />
                {t("createForest", $language)}
            </button>
        </div>
        <table class="w-full bg-card border border-border rounded-lg overflow-hidden">
            <thead class="bg-muted">
                <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors">id</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors">{t("name", $language)}</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors">{t("location", $language)}</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors">{t("owner", $language)}</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors">{t("createdAt", $language)}</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors">{t("updatedAt", $language)}</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors">{t("actions", $language)}</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border">
                {#each forestsData as forest}
                    <tr>
                        <td class="px-6 py-4 text-sm text-foreground">{forest.id}</td>
                        <td class="px-6 py-4 text-sm text-foreground">{forest.name}</td>
                        <td class="px-6 py-4 text-sm text-foreground">{forest.location}</td>
                        <td class="px-6 py-4 text-sm text-foreground">{users[forest.ownerId]?.displayName}</td>
                        <td class="px-6 py-4 text-sm text-foreground">{forest.createdAt}</td>
                        <td class="px-6 py-4 text-sm text-foreground">{forest.updatedAt}</td>
                        <td class="px-6 py-4 text-sm text-foreground">
                            <button
                                onclick={() => openDeleteConfirm(forest.id)}
                                class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
                                style="color: white; background-color: var(--status-critical);"
                                aria-label="Delete forest"
                            >
                                <Trash2 class="w-4 h-4" />
                                {t("delete", $language)}
                            </button>
                            <button
                                onclick={() => goto(`/forests/${forest.id}/edit`)}
                                class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
                                style="color: white; background-color: var(--action-icon);"
                                aria-label="Edit forest"
                            >
                                <Pencil class="w-4 h-4" />
                                {t("edit", $language)}
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

