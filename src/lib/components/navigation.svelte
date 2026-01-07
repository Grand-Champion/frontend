<script>
  import {
    Map,
    Grid3X3,
    Home,
    Sun,
    Moon,
    Languages,
    LogIn,
    LogOut,
    UserCog,
    ChevronDown,
    Key,
    Eye,
    EyeOff,
  } from "lucide-svelte";
  import { page } from "$app/stores";
  import { theme } from "$lib/stores/theme";
  import { language, t } from "$lib/stores/language";
  import { auth, ADMIN_KEY } from "$lib/stores/auth";
  import { goto } from "$app/navigation";

  let showUserMenu = false;
  let showChangePasswordModal = false;
  let currentPassword = "";
  let newPassword = "";
  let confirmPassword = "";
  let adminKey = "";
  let passwordError = "";
  let showCurrentPassword = false;
  let showNewPassword = false;
  let showConfirmPassword = false;
  let showAdminKey = false;
  let userMenuElement;

  function toggleTheme() {
    theme.update((current) => (current === "light" ? "dark" : "light"));
  }

  function toggleLanguage() {
    language.update((current) => (current === "en" ? "nl" : "en"));
  }

  function handleLogin() {
    goto("/login");
  }

  function handleLogout() {
    auth.logout();
    showUserMenu = false;
    goto("/");
  }

  function toggleUserMenu() {
    showUserMenu = !showUserMenu;
  }

  function goToAdmin() {
    goto("/management");
    showUserMenu = false;
  }

  function openChangePasswordModal() {
    showChangePasswordModal = true;
    showUserMenu = false;
  }

  function closeChangePasswordModal() {
    showChangePasswordModal = false;
    resetPasswordForm();
  }

  function resetPasswordForm() {
    currentPassword = "";
    newPassword = "";
    confirmPassword = "";
    adminKey = "";
    passwordError = "";
    showCurrentPassword = false;
    showNewPassword = false;
    showConfirmPassword = false;
    showAdminKey = false;
  }

  function handleChangePassword() {
    passwordError = "";

    const isAdmin = $auth.currentUser?.role === "admin";

    if (isAdmin) {
      // Admin password change requires admin key and current password
      if (!adminKey || !currentPassword || !newPassword || !confirmPassword) {
        passwordError = t("pleaseEnterAllFields", $language);
        return;
      }
    } else {
      // Regular user password change
      if (!currentPassword || !newPassword || !confirmPassword) {
        passwordError = t("pleaseEnterAllFields", $language);
        return;
      }
    }

    if (newPassword !== confirmPassword) {
      passwordError = t("passwordsDoNotMatch", $language);
      return;
    }

    if (newPassword.length < 3) {
      passwordError = t("passwordTooShort", $language);
      return;
    }

    if ($auth.currentUser) {
      let success = false;

      if (isAdmin) {
        // Use admin password change method
        success = auth.changeAdminPassword(
          adminKey,
          currentPassword,
          newPassword,
        );
        if (!success) {
          passwordError =
            t("invalidAdminKeyOrPassword", $language) ||
            "Invalid admin key or current password";
        }
      } else {
        // Use regular password change method
        success = auth.changePassword(
          $auth.currentUser.id,
          currentPassword,
          newPassword,
        );
        if (!success) {
          passwordError = t("incorrectCurrentPassword", $language);
        }
      }

      if (success) {
        closeChangePasswordModal();
        alert(t("passwordChanged", $language));
      }
    }
  }

  function handleClickOutside(event) {
    if (
      showUserMenu &&
      userMenuElement &&
      !userMenuElement.contains(event.target)
    ) {
      showUserMenu = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<nav class="bg-background border-b border-border">
  <div class="flex items-center justify-between h-16 px-6">
    <div class="flex items-center gap-8">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
        >
          <span class="text-primary-foreground font-semibold text-sm">FF</span>
        </div>
        <span class="font-semibold text-lg">Food Forest</span>
      </div>

      <div class="flex gap-1">
        <a
          href="/"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page
            .url.pathname === '/'
            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
            : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted'}"
        >
          <Home class="w-4 h-4" />
          <span class="font-medium">{t("home", $language)}</span>
        </a>

        <a
          href="/map"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page
            .url.pathname === '/map'
            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
            : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted'}"
        >
          <Map class="w-4 h-4" />
          <span class="font-medium">{t("mapView", $language)}</span>
        </a>

        <a
          href="/species"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page
            .url.pathname === '/species'
            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
            : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted'}"
        >
          <Grid3X3 class="w-4 h-4" />
          <span class="font-medium">{t("speciesList", $language)}</span>
        </a>

        <a
          href="/messages"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page
            .url.pathname === '/messages'
            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
            : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted'}"
        >
          <Grid3X3 class="w-4 h-4" />
          <span class="font-medium">{t("messages", $language)}</span>
        </a>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- Language Toggle -->
      <button
        on:click={toggleLanguage}
        class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
        aria-label="Toggle language"
      >
        <Languages class="w-4 h-4" />
        <span class="font-medium text-sm"
          >{$language === "en" ? "NL" : "EN"}</span
        >
      </button>

      <!-- Theme Toggle -->
      <button
        on:click={toggleTheme}
        class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
        aria-label="Toggle theme"
      >
        {#if $theme === "light"}
          <Sun class="w-4 h-4" />
        {:else}
          <Moon class="w-4 h-4" />
        {/if}
      </button>

      {#if $auth.currentUser}
        <!-- User Menu -->
        <div
          class="relative ml-4 pl-[1.625rem] border-l border-border"
          bind:this={userMenuElement}
        >
          <button
            on:click={toggleUserMenu}
            class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            aria-label="User menu"
          >
            <span class="text-sm font-bold text-foreground"
              >{$auth.currentUser.fullName}</span
            >
            <ChevronDown class="w-4 h-4" />
          </button>

          {#if showUserMenu}
            <div
              class="absolute right-0 mt-3.5 w-64 bg-card border border-border rounded-b-lg shadow-lg border-t-0"
              style="z-index: 100;"
            >
              <div class="p-4 border-b border-border">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-muted-foreground mb-1">
                      {t("username", $language)}
                    </p>
                    <p class="text-sm font-medium text-foreground">
                      {$auth.currentUser.username}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground mb-1">
                      {t("role", $language)}
                    </p>
                    <p class="text-sm font-medium text-foreground capitalize">
                      {t($auth.currentUser.role, $language)}
                    </p>
                  </div>
                </div>
              </div>

              {#if $auth.currentUser.role === "admin" || $auth.currentUser.role === "manager"}
                <button
                  on:click={goToAdmin}
                  class="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2 border-b border-border cursor-pointer"
                >
                  <UserCog class="w-4 h-4" />
                  {t("accountManagement", $language)}
                </button>
              {/if}

              <button
                on:click={openChangePasswordModal}
                class="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2 border-b border-border cursor-pointer"
              >
                <Key class="w-4 h-4" />
                {t("changePassword", $language)}
              </button>

              <button
                on:click={handleLogout}
                class="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 cursor-pointer"
                style="color: var(--status-critical);"
              >
                <LogOut class="w-4 h-4" />
                {t("logout", $language)}
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <!-- Login Button -->
        <button
          on:click={handleLogin}
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          aria-label="Login"
        >
          <LogIn class="w-4 h-4" />
          <span class="font-medium">{t("login", $language)}</span>
        </button>
      {/if}
    </div>
  </div>
</nav>

<!-- Change Password Modal -->
{#if showChangePasswordModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center"
    style="z-index: 200;"
    on:click={closeChangePasswordModal}
    role="presentation"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6"
      on:click|stopPropagation
    >
      <h2 class="text-lg font-semibold text-foreground mb-4">
        {t("changePassword", $language)}
      </h2>

      <form on:submit|preventDefault={handleChangePassword} class="space-y-4">
        {#if $auth.currentUser?.role === "admin"}
          <div>
            <label
              for="modal-admin-key"
              class="block text-sm font-medium text-foreground mb-2"
            >
              {t("adminKey", $language) || "Admin Key"}
            </label>
            <div class="relative">
              <input
                id="modal-admin-key"
                type={showAdminKey ? "text" : "password"}
                bind:value={adminKey}
                class="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("enterAdminKey", $language) || "Enter admin key"}
              />
              <button
                type="button"
                on:click={() => (showAdminKey = !showAdminKey)}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Toggle admin key visibility"
              >
                {#if showAdminKey}
                  <EyeOff class="w-4 h-4" />
                {:else}
                  <Eye class="w-4 h-4" />
                {/if}
              </button>
            </div>
          </div>
        {/if}

        <div>
          <label
            for="modal-current-password"
            class="block text-sm font-medium text-foreground mb-2"
          >
            {t("currentPassword", $language)}
          </label>
          <div class="relative">
            <input
              id="modal-current-password"
              type={showCurrentPassword ? "text" : "password"}
              bind:value={currentPassword}
              class="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t("enterCurrentPassword", $language)}
            />
            <button
              type="button"
              on:click={() => (showCurrentPassword = !showCurrentPassword)}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {#if showCurrentPassword}
                <EyeOff class="w-4 h-4" />
              {:else}
                <Eye class="w-4 h-4" />
              {/if}
            </button>
          </div>
        </div>

        <div>
          <label
            for="modal-new-password"
            class="block text-sm font-medium text-foreground mb-2"
          >
            {t("newPassword", $language)}
          </label>
          <div class="relative">
            <input
              id="modal-new-password"
              type={showNewPassword ? "text" : "password"}
              bind:value={newPassword}
              class="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t("enterNewPassword", $language)}
            />
            <button
              type="button"
              on:click={() => (showNewPassword = !showNewPassword)}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {#if showNewPassword}
                <EyeOff class="w-4 h-4" />
              {:else}
                <Eye class="w-4 h-4" />
              {/if}
            </button>
          </div>
        </div>

        <div>
          <label
            for="modal-confirm-password"
            class="block text-sm font-medium text-foreground mb-2"
          >
            {t("confirmPassword", $language)}
          </label>
          <div class="relative">
            <input
              id="modal-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              bind:value={confirmPassword}
              class="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t("confirmNewPassword", $language)}
            />
            <button
              type="button"
              on:click={() => (showConfirmPassword = !showConfirmPassword)}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {#if showConfirmPassword}
                <EyeOff class="w-4 h-4" />
              {:else}
                <Eye class="w-4 h-4" />
              {/if}
            </button>
          </div>
        </div>

        {#if passwordError}
          <div
            class="px-4 py-3 rounded-lg text-sm"
            style={`background-color: color-mix(in oklch, var(--status-critical) 12%, transparent); border: 1px solid color-mix(in oklch, var(--status-critical) 32%, transparent); color: var(--status-critical);`}
          >
            {passwordError}
          </div>
        {/if}

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            on:click={closeChangePasswordModal}
            class="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted/80 transition-colors cursor-pointer"
          >
            {t("cancel", $language)}
          </button>
          <button
            type="submit"
            class="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          >
            {t("change", $language)}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
