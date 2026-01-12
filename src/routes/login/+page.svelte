<script lang="ts">
    import { goto } from "$app/navigation";
    import { t, language } from "$lib/stores/language";
    import { Eye, EyeOff, LockKeyhole } from "lucide-svelte";
    import { login } from "$lib/Auth";
    import { jwt } from "$lib/stores/jwt";
    import { browser } from "$app/environment";

    $: pageTitle = `${t("login", $language)}`;

    let identifier = "";
    let password = "";
    let errorMessage = "";
    let showPassword = false;

    async function handleLogin() {
        errorMessage = "";

        if (!identifier || !password) {
            errorMessage = t("pleaseEnterCredentials", $language);
            return;
        }

        // Validate email format only if it's not "admin"
        if (identifier !== "admin") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(identifier)) {
                errorMessage = t("pleaseEnterValidEmail", $language);
                return;
            }
        }

        try {
            await login(identifier, password);
            if ($jwt) {
                goto("/");
            }
        } catch (e) {
            if (e?.message === "Invalid credentials")
                errorMessage = t("invalidCredentials", $language);
            else errorMessage = t("loginError", $language);
        }
    }
    $: if ($jwt && browser) {
        goto("/");
    }
</script>

<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

<div
    class="min-h-screen flex items-center justify-center bg-background px-4 py-6 overflow-hidden"
>
    <div class="w-full max-w-md relative">
        <div
            class="bg-card border border-border rounded-2xl shadow-xl p-8 backdrop-blur-sm"
        >
            <!-- Header -->
            <div class="text-center mb-8 space-y-3">
                <div
                    class="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center"
                >
                    <LockKeyhole class="h-6 w-6" />
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-card-foreground">
                        {t("welcomeBack", $language)}
                    </h1>
                    <p class="text-muted-foreground">
                        {t("loginToAccount", $language)}
                    </p>
                </div>
            </div>

            <!-- Login Form -->
            <form on:submit|preventDefault={handleLogin} class="space-y-5">
                <div class="space-y-2">
                    <label
                        for="identifier"
                        class="block text-sm font-medium text-card-foreground"
                    >
                        {t("email", $language)}
                    </label>
                    <input
                        id="identifier"
                        type="text"
                        bind:value={identifier}
                        class="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t("enterEmail", $language)}
                        autocomplete="email"
                    />
                </div>

                <div class="space-y-2">
                    <label
                        for="password"
                        class="block text-sm font-medium text-card-foreground"
                    >
                        {t("password", $language)}
                    </label>
                    <div class="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            bind:value={password}
                            class="w-full px-4 py-2.5 pr-12 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder={t("enterPassword", $language)}
                            autocomplete="current-password"
                        />
                        <button
                            type="button"
                            on:click={() => (showPassword = !showPassword)}
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label={showPassword
                                ? t("hideDetails", $language)
                                : t("showDetails", $language)}
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
                        class="px-4 py-3 rounded-lg border"
                        style={`background-color: color-mix(in oklch, var(--status-critical) 12%, transparent); border-color: color-mix(in oklch, var(--status-critical) 32%, transparent); color: var(--status-critical);`}
                    >
                        {errorMessage}
                    </div>
                {/if}

                <button
                    type="submit"
                    class="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                >
                    {t("login", $language)}
                </button>
            </form>

            <div class="mt-6 text-center text-sm text-muted-foreground">
                <span>{t("or", $language)} </span>
                <a
                    href="/register"
                    class="font-medium text-primary hover:text-primary/90"
                >
                    {t("registerLong", $language)}
                </a>
            </div>
        </div>
    </div>
</div>
