<script lang="ts">
    import { auth } from "$lib/stores/auth";
    import { goto } from "$app/navigation";
    import { t, language } from "$lib/stores/language";
    import { Eye, EyeOff } from "lucide-svelte";

    let username = "";
    let password = "";
    let errorMessage = "";
    let showPassword = false;

    function handleLogin() {
        errorMessage = "";

        if (!username || !password) {
            errorMessage = t("pleaseEnterCredentials", $language);
            return;
        }

        const beforeLogin = $auth.currentUser;
        auth.login(username, password);

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

<div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md">
        <div class="bg-card border border-border rounded-lg shadow-lg p-8">
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
                        for="username"
                        class="block text-sm font-medium text-foreground mb-2"
                    >
                        {t("username", $language)}
                    </label>
                    <input
                        id="username"
                        type="text"
                        bind:value={username}
                        class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t("enterUsername", $language)}
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
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                        class="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg"
                    >
                        {errorMessage}
                    </div>
                {/if}

                <button
                    type="submit"
                    class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    {t("login", $language)}
                </button>
            </form>
        </div>
    </div>
</div>
