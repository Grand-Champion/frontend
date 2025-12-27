<script lang="ts">
    import { goto } from "$app/navigation";
    import { t, language } from "$lib/stores/language";
    import { Eye, EyeOff } from "lucide-svelte";
    import { createUser, login } from "$lib/Auth";
    import { jwt } from "$lib/stores/jwt";
    import { browser } from "$app/environment";

    $: pageTitle = `${t("register", $language)}`;

    let email = "";
    let displayName = "";
    let password = "";
    let confirmPassword = "";
    let errorMessage = "";
    let showPassword = false;
    let showConfirmPassword = false;

    async function register() {
        errorMessage = "";

        if (!email || !password || !displayName) {
            errorMessage = t("pleaseEnterCredentials", $language);
            return;
        }

        if (password !== confirmPassword){
            errorMessage = t("passwordsDoNotMatch", $language);
            return;
        }
        if (password.length < 6) {
            errorMessage = t("passwordTooShort", $language);
            return;
        }

        try {
            await createUser($jwt as string, {
                email, password, displayName
            });
        }
        catch(e) {
            errorMessage = t("registrationError", $language);
            return;
        }

        try {
            await login(email, password);
            if ($jwt) {
                goto("/");
            }
        }
        catch(e) {
            if(e?.message === "Invalid credentials") errorMessage = t("invalidCredentials", $language);
            else errorMessage = t("loginError", $language);
        }
    }

    $: if($jwt && browser){
        goto("/");
    }
</script>

<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md">
        <div class="bg-card border border-border rounded-lg shadow-lg p-8">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-2xl font-bold text-foreground mb-2">
                    {t("welcomeBack", $language)}
                </h1>
                <p class="text-muted-foreground">
                    {t("registerLong", $language)}
                </p>
            </div>

            <!-- Registration Form -->
            <form on:submit|preventDefault={register} class="space-y-4">
                <div>
                    <label for="email" class="block text-sm font-medium text-foreground mb-2" >
                        {t("email", $language)}
                    </label>
                    <input
                        id="email" type="email"
                        bind:value={email}
                        class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t("email", $language)} />
                </div>
                
                <div>
                    <label for="displayName" class="block text-sm font-medium text-foreground mb-2" >
                        {t("displayName", $language)}
                    </label>
                    <input
                        id="displayName" type="text"
                        bind:value={displayName}
                        class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t("displayName", $language)} />
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-foreground mb-2" >
                        {t("password", $language)}
                    </label>
                    <div class="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            bind:value={password}
                            class="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder={t("enterPassword", $language)}
                        />
                        <button type="button"
                            on:click={() => (showPassword = !showPassword)}
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" 
                        >
                        {#if showPassword}
                            <EyeOff class="w-4 h-4" />
                        {:else}
                            <Eye class="w-4 h-4" />
                        {/if}
                        </button>
                    </div>
                </div>

                <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-foreground mb-2" >
                        {t("confirmPassword", $language)}
                    </label>
                    <div class="relative">
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            bind:value={confirmPassword}
                            class="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder={t("confirmPassword", $language)}
                        />
                        <button type="button"
                            on:click={() => (showConfirmPassword = !showConfirmPassword)}
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" 
                        >
                        {#if showConfirmPassword}
                            <EyeOff class="w-4 h-4" />
                        {:else}
                            <Eye class="w-4 h-4" />
                        {/if}
                        </button>
                    </div>
                </div>

                {#if errorMessage}
                    <div
                        class="px-4 py-3 rounded-lg"
                        style="background-color: color-mix(in oklch, var(--status-critical) 12%, transparent); border: 1px solid color-mix(in oklch, var(--status-critical) 32%, transparent); color: var(--status-critical);"
                    >
                        {errorMessage}
                    </div>
                {/if}

                <button
                    type="submit"
                    class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                >
                    {t("register", $language)}
                </button>
            </form>
        </div>
    </div>
</div>
