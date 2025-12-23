<script lang="ts">
    import { goto } from "$app/navigation";
    import { t, language } from "$lib/stores/language";
    import { Eye, EyeOff, ArrowLeft } from "lucide-svelte";
    import { jwt } from "$lib/stores/jwt";
    import { browser } from "$app/environment";
    import { deleteUser, getUser, updateUser } from "$lib/Auth";
    import SelectOption from "$lib/components/SelectOption.svelte";

    $: pageTitle = `${t("userSettings", $language)}`;

    $: user = {};

    $: if(!$jwt && browser){
        goto("/");
    }

    $: if(browser){
        (async() => user = await getUser($jwt as string, "me"))();
    }

    $: errorMessage = "";

    function goBack() {
        if (browser && window.history.length > 1) {
            window.history.back();
        } else {
            goto("/");
        }
    }

    let formulier: HTMLFormElement;
    let password: string;

    async function stuurUpdate(){
        errorMessage = "";
        const data = new FormData(formulier);

        if(!data.get("email") || !data.get("displayName")){
            errorMessage = t("pleaseEnterCredentials", $language);
            return;
        }
        try {
            await updateUser($jwt as string, "me", data);
        } catch(e){
            errorMessage = e.message ?? t("error", $language);
        }
    }

    async function deleteAccount(){
        errorMessage = "";
        
        try {
            await deleteUser($jwt as string, "me", password);
        } catch(e){
            errorMessage = e.message ?? t("error", $language);
        }
        closeConfirmDeleteModal();
    }

    $: showConfirmDeleteModal = false;
    $: showPassword = false;

    function openConfirmDeleteModal(){
        showConfirmDeleteModal = true;
    }
    
    function closeConfirmDeleteModal(){
        showConfirmDeleteModal = false;
        password = "";
    }
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

  <div class="bg-background">
    <div class="max-w-xl mx-auto px-6 py-8">
      <!-- Back button -->
      <button
        onclick={goBack}
        class="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft class="h-4 w-4" />
        {t("back", $language)}
      </button>

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-foreground mb-2">
          { t("userSettings", $language) }
        </h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div class="space-y-6">
          <!-- Basic Info -->
          <div class="bg-card border border-border rounded-xl p-6">
            <form action="javascript://" bind:this={formulier} onsubmit={stuurUpdate} >
              
                <div class="flex justify-between py-2">
                    <label for="displayName">{t("displayName", $language)}</label>
                    <input type="text" name="displayName" id="displayName" value={user.displayName} class="border rounded-l" required />
                </div>
                <div class="flex justify-between py-2">
                    <label for="email">{t("email", $language)}</label>
                    <input type="{user.role === "admin" ? "text" : "email"}" name="email" id="email" value={user.email} class="border rounded-l" required />
                </div>

                {#if errorMessage}
                    <div
                        class="px-4 py-3 rounded-lg"
                        style={`background-color: color-mix(in oklch, var(--status-critical) 12%, transparent); border: 1px solid color-mix(in oklch, var(--status-critical) 32%, transparent); color: var(--status-critical);`}
                    >
                        {errorMessage}
                    </div>
                {/if}

                <div class="space-y-3">
                    <input type="submit" value="{t("save", $language)}" class="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                    
                    <button onclick={openConfirmDeleteModal}
                        class="bg-(--status-critical) text-primary-foreground px-4 py-2 rounded-lg hover:bg-(--status-critical)/90 transition-colors cursor-pointer" >
                        {t("delete", $language)}
                    </button>
                </div>
            </form>
            
          </div>
        </div>
      </div>
    </div>
  </div>
{#if showConfirmDeleteModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center"
    style="z-index: 200;"
    onclick={closeConfirmDeleteModal}
    role="presentation"
  >
  </div>
  
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6 absolute mx-auto left-[50%] top-[50%] -translate-1/2" style="z-index: 250;"
    >
      <h2 class="text-lg font-semibold text-foreground mb-4">
        {t("confirmDeleteSelf", $language)}
      </h2>

      <form onsubmit={deleteAccount} target="javascript://" class="space-y-4">
        <div>
          <label
            for="modal-password"
            class="block text-sm font-medium text-foreground mb-2"
          >
            {t("password", $language)}
          </label>
          <div class="relative">
            <input
              id="modal-password"
              type={showPassword ? "text" : "password"}
              bind:value={password}
              class="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t("enterPassword", $language)}
            />
            <button
              type="button"
              onclick={() => (showPassword = !showPassword)}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {#if showPassword}
                <EyeOff class="w-4 h-4" />
              {:else}
                <Eye class="w-4 h-4" />
              {/if}
            </button>
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            onclick={closeConfirmDeleteModal}
            class="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted/80 transition-colors cursor-pointer"
          >
            {t("cancel", $language)}
          </button>
          <button
            type="submit"
            class="flex-1 bg-(--status-critical) text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-(--status-critical)/90 transition-colors cursor-pointer"
          >
            {t("delete", $language)}
          </button>
        </div>
      </form>
    </div>
{/if}