<script lang="ts">
    import { auth } from "$lib/stores/auth";
    import { goto } from "$app/navigation";
    import { t, language } from "$lib/stores/language";
    import { Eye, EyeOff } from "lucide-svelte";

    $: pageTitle = `${t("login", $language)} - Food Forest`;

    let identifier = "";
    let password = "";
    let errorMessage = "";
    let showPassword = false;

    function handleLogin() {
        errorMessage = "";

        if (!identifier || !password) {
            errorMessage = t("pleaseEnterCredentials", $language);
            return;
        }

        auth.login(identifier, password);

        // Check if login was successful
        setTimeout(() => {
            if ($auth.currentUser) {
                goto("/");
            } else {
                errorMessage = t("invalidCredentials", $language);
            }
        }, 100);
    }
</script>

<svelte:head>
    <title>{pageTitle}</title>
    <style>
        body,
        html {
            overflow: hidden;
            height: 100%;
            margin: 0;
            padding: 0;
        }
    </style>
</svelte:head>

<div class="h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md -mt-20">
        <div class="bg-card rounded-lg shadow-lg p-8">
            <!-- Header -->
            <div class="text-center mb-8">
                <div
                    class="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4"
                >
                    <span class="text-primary-foreground font-semibold text-2xl"
                        >FF</span
                    >
                </div>
                <h1 class="text-2xl font-bold text-foreground mb-2">
                    {t("welcomeBack", $language)}
                </h1>
                <p class="text-muted-foreground">
                    {t("loginToAccount", $language)}
                </p>
            </div>

            <!-- Login Form -->
            <form on:submit|preventDefault={handleLogin} class="space-y-4">
                <div>
                    <label
                        for="identifier"
                        class="block text-sm font-medium text-foreground mb-2"
                    >
                        {t("username", $language)} / Email
                    </label>
                    <input
                        id="identifier"
                        type="text"
                        bind:value={identifier}
                        class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t("enterUsername", $language) + " / Email"}
                    />
                </div>

                <div>
                    <label
                        for="password"
                        class="block text-sm font-medium text-foreground mb-2"
                    >
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
                        <button
                            type="button"
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

                {#if errorMessage}
                    <div
                        class="px-4 py-3 rounded-lg"
                        style={`background-color: color-mix(in oklch, var(--status-critical) 12%, transparent); border: 1px solid color-mix(in oklch, var(--status-critical) 32%, transparent); color: var(--status-critical);`}
                    >
                        {errorMessage}
                    </div>
                {/if}

                <button
                    type="submit"
                    class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                >
                    {t("login", $language)}
                </button>
            </form>
        </div>
    </div>
</div>
