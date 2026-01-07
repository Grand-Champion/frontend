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
    Menu,
    X as XIcon,
  } from "lucide-svelte";
  import { page } from "$app/stores";
  import { theme } from "$lib/stores/theme";
  import { language, t } from "$lib/stores/language";
  import { goto } from "$app/navigation";
  import { getPayload, updatePassword } from "$lib/Auth";
  import { jwt } from "$lib/stores/jwt";

  let showUserMenu = false;
  let currentPassword = "";
  let newPassword = "";
  let confirmPassword = "";
  let passwordError = "";
  let showCurrentPassword = false;
  let showNewPassword = false;
  let showConfirmPassword = false;
  let userMenuElement;
  let showMobileMenu = false;
  let showChangePasswordModal = false;

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
    $jwt = undefined;
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

  function goToSettings(){
    goto("/settings");
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
    passwordError = "";
    showCurrentPassword = false;
    showNewPassword = false;
    showConfirmPassword = false;
  }

  async function handleChangePassword() {
    passwordError = "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      passwordError = t("pleaseEnterAllFields", $language);
      return;
    }

    if (newPassword !== confirmPassword) {
      passwordError = t("passwordsDoNotMatch", $language);
      return;
    }

    if (newPassword.length < 6) {
      passwordError = t("passwordTooShort", $language);
      return;
    }

    if ($jwt) {
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
      } catch(e){
        if(e?.message === "Invalid credentials") passwordError = t("incorrectCurrentPassword", $language);
        else passwordError = t("loginError", $language);
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

<svelte:body
  class:overflow-hidden={showMobileMenu || showChangePasswordModal}
/>
<svelte:window
  on:click={handleClickOutside}
  on:keydown={(e) => {
    if (e.key === "Escape" && showMobileMenu) showMobileMenu = false;
    if (e.key === "Escape" && showChangePasswordModal)
      closeChangePasswordModal();
  }}
/>

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
      <div class="hidden lg:flex gap-1">
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
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- Mobile menu toggle (visible only on mobile) -->
      <div class="lg:hidden flex items-center gap-2">
        <button
          on:click={() => (showMobileMenu = !showMobileMenu)}
          class="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {#if showMobileMenu}
            <XIcon class="w-5 h-5" />
          {:else}
            <Menu class="w-5 h-5" />
          {/if}
        </button>
      </div>

      <!-- Desktop controls (hidden on mobile) -->
      <div class="hidden lg:flex items-center gap-2">
        <button
          on:click={toggleLanguage}
          class="flex items-center gap-1 px-2 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          aria-label="Toggle language"
        >
          <Languages class="w-4 h-4" />
          <span class="font-medium text-xs"
            >{$language === "en" ? "NL" : "EN"}</span
          >
        </button>

        <button
          on:click={toggleTheme}
          class="flex items-center gap-1 px-2 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          aria-label="Toggle theme"
        >
          {#if $theme === "light"}
            <Moon class="w-4 h-4" />
            <span class="font-medium text-xs"
              >{t("darkMode", $language) || "Dark"}</span
            >
          {:else}
            <Sun class="w-4 h-4" />
            <span class="font-medium text-xs"
              >{t("lightMode", $language) || "Light"}</span
            >
          {/if}
        </button>

        {#if $auth.currentUser}
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
                        {t("fullName", $language)}
                      </p>
                      <p class="text-sm font-medium text-foreground">
                        {$auth.currentUser.fullName}
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
  </div>
</nav>

{#if showMobileMenu}
  <!-- Mobile overlay menu -->
  <div class="lg:hidden fixed inset-0 z-60 bg-background/95 backdrop-blur-sm">
    <div
      class="px-6 pb-[env(safe-area-inset-bottom)] h-full flex flex-col space-y-6"
      style="padding-top: calc(env(safe-area-inset-top) + 0.875rem);"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
          >
            <span class="text-primary-foreground font-semibold text-sm">FF</span
            >
          </div>
          <span class="font-semibold text-lg">Food Forest</span>
        </div>
        <button
          on:click={() => (showMobileMenu = false)}
          class="p-2 rounded-lg hover:bg-muted cursor-pointer"
          aria-label="Close menu"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>

      <div class="grid gap-2">
        <a
          href="/"
          on:click={() => (showMobileMenu = false)}
          aria-current={$page.url.pathname === "/" ? "page" : undefined}
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors {$page
            .url.pathname === '/'
            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
            : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted'}"
        >
          <Home class="w-4 h-4" />
          <span class="font-medium">{t("home", $language)}</span>
        </a>
        <a
          href="/map"
          on:click={() => (showMobileMenu = false)}
          aria-current={$page.url.pathname === "/map" ? "page" : undefined}
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors {$page
            .url.pathname === '/map'
            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
            : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted'}"
        >
          <Map class="w-4 h-4" />
          <span class="font-medium">{t("mapView", $language)}</span>
        </a>
        <a
          href="/species"
          on:click={() => (showMobileMenu = false)}
          aria-current={$page.url.pathname === "/species" ? "page" : undefined}
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors {$page
            .url.pathname === '/species'
            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
            : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted'}"
        >
          <Grid3X3 class="w-4 h-4" />
          <span class="font-medium">{t("speciesList", $language)}</span>
        </a>
      </div>

      <!-- Divider between nav links and quick actions -->
      <div class="border-t border-border"></div>

      <div class="flex items-center gap-2">
        <button
          on:click={() => {
            toggleLanguage();
            showMobileMenu = false;
          }}
          class="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border text-foreground hover:bg-muted cursor-pointer font-medium"
        >
          <Languages class="w-4 h-4" />
          <span class="font-medium text-sm"
            >{$language === "en" ? "NL" : "EN"}</span
          >
        </button>
        <button
          on:click={() => {
            toggleTheme();
            showMobileMenu = false;
          }}
          class="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border text-foreground hover:bg-muted cursor-pointer font-medium"
        >
          {#if $theme === "light"}
            <Moon class="w-4 h-4" />
            <span class="font-medium text-sm"
              >{t("darkMode", $language) || "Dark"}</span
            >
          {:else}
            <Sun class="w-4 h-4" />
            <span class="font-medium text-sm"
              >{t("lightMode", $language) || "Light"}</span
            >
          {/if}
        </button>
      </div>

      <!-- Push account section to bottom -->
      <div class="mt-auto"></div>

      {#if $auth.currentUser}
        <div class="grid gap-2 pb-6">
          <div
            class="px-2 py-3 text-xl font-semibold text-foreground border-b border-border"
          >
            {$auth.currentUser.fullName}
          </div>
          {#if $auth.currentUser.role === "admin" || $auth.currentUser.role === "manager"}
            <button
              on:click={() => {
                showMobileMenu = false;
                goToAdmin();
              }}
              class="w-full px-4 py-3 rounded-lg bg-card border border-border text-left"
            >
              {t("accountManagement", $language)}
            </button>
          {/if}
          <button
            on:click={() => {
              showMobileMenu = false;
              openChangePasswordModal();
            }}
            class="w-full px-4 py-3 rounded-lg bg-card border border-border text-left"
          >
            {t("changePassword", $language)}
          </button>
          <button
            on:click={() => {
              showMobileMenu = false;
              handleLogout();
            }}
            class="w-full px-4 py-3 rounded-lg bg-card border border-border text-left"
            style="color: var(--status-critical);"
          >
            {t("logout", $language)}
          </button>
        </div>
      {:else}
        <button
          on:click={() => {
            showMobileMenu = false;
            handleLogin();
          }}
          class="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground mb-6"
        >
          {t("login", $language)}
        </button>
      {/if}
    </div>
  </div>
{/if}

<!-- Change Password Modal -->
{#if showChangePasswordModal}
  <div class="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm">
    <div class="w-full h-full flex items-center justify-center p-4">
      <div
        class="w-full max-w-md bg-card border border-border rounded-xl shadow-md p-6"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-foreground">
            {t("changePassword", $language)}
          </h2>
          <button
            on:click={closeChangePasswordModal}
            class="p-2 rounded-lg hover:bg-muted cursor-pointer"
            aria-label="Close"
          >
            <XIcon class="w-5 h-5" />
          </button>
        </div>

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
                  placeholder={t("enterAdminKey", $language) ||
                    "Enter admin key"}
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
  </div>
{/if}
