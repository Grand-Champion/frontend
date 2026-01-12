<script>
  import {
    Map,
    List,
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
    Settings,
    Leaf,
    MessageCircle,
    Menu,
    X,
  } from "lucide-svelte";
  import { page } from "$app/stores";
  import { theme } from "$lib/stores/theme";
  import { language, t } from "$lib/stores/language";
  import { selectedForestId } from "$lib/stores/selectedForest";
  import { goto } from "$app/navigation";
  import { getPayload, updatePassword } from "$lib/Auth";
  import { jwt } from "$lib/stores/jwt";
  import SelectOption from "./SelectOption.svelte";
  import { page as statePage } from "$app/state";
  import { browser } from "$app/environment";

  export let forests = [],
    forestId;
  $: selectedForest = forestId;
  $: if (selectedForest) {
    selectedForestId.set(String(selectedForest));
  }

  let showUserMenu = false;
  let showMobileMenu = false;
  let showChangePasswordModal = false;
  let currentPassword = "";
  let newPassword = "";
  let confirmPassword = "";
  let passwordError = "";
  let showCurrentPassword = false;
  let showNewPassword = false;
  let showConfirmPassword = false;
  let userMenuElement;
  let forestSelector;
  let mobileMenuElement;
  let mobileMenuButton;

  // Compute forest initials - directly in reactive statement for reliability
  $: {
    if (!forests || forests.length === 0 || !selectedForest) {
      forestInitials = "";
    } else {
      // Try to find forest by ID (handle both string and number comparison)
      let forest = forests.find((f) => String(f.id) === String(selectedForest));

      // If not found, use the first forest as fallback
      if (!forest && forests.length > 0) {
        forest = forests[0];
      }

      if (forest && forest.name) {
        forestInitials = forest.name
          .split(" ")
          .map((str) => str[0])
          .join("")
          .toUpperCase();
      } else {
        forestInitials = "";
      }
    }
  }

  let forestInitials = "";

  // Reset menu state when forest changes
  $: if (forestId) {
    showMobileMenu = false;
    showUserMenu = false;
    showChangePasswordModal = false;
  }

  // Also reset menu state when page changes
  $: if ($page.url.pathname) {
    showMobileMenu = false;
  }

  function toggleTheme() {
    theme.update((current) => (current === "light" ? "dark" : "light"));
  }

  function toggleLanguage() {
    language.update((current) => (current === "en" ? "nl" : "en"));
  }

  // Reactive translations - update whenever language changes
  $: translations = {
    home: t("home", $language),
    mapView: t("mapView", $language),
    plantsList: t("plantsList", $language),
    species: t("species", $language),
    messages: t("messages", $language),
    forest: t("forest", $language),
    forestManagement: t("forestManagement", $language),
    name: t("name", $language),
    role: t("role", $language),
    accountManagement: t("accountManagement", $language),
    changePassword: t("changePassword", $language),
    userSettings: t("userSettings", $language),
    logout: t("logout", $language),
    login: t("login", $language),
    pleaseEnterAllFields: t("pleaseEnterAllFields", $language),
    passwordsDoNotMatch: t("passwordsDoNotMatch", $language),
    passwordTooShort: t("passwordTooShort", $language),
    incorrectCurrentPassword: t("incorrectCurrentPassword", $language),
    passwordChanged: t("passwordChanged", $language),
    loginError: t("loginError", $language),
    currentPassword: t("currentPassword", $language),
    newPassword: t("newPassword", $language),
    confirmPassword: t("confirmPassword", $language),
    enterCurrentPassword: t("enterCurrentPassword", $language),
    enterNewPassword: t("enterNewPassword", $language),
    confirmNewPassword: t("confirmNewPassword", $language),
    cancel: t("cancel", $language),
    change: t("change", $language),
  };

  function toggleMobileMenu() {
    showMobileMenu = !showMobileMenu;
  }

  function closeMobileMenu() {
    showMobileMenu = false;
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

  function goToSettings() {
    goto("/settings");
    showUserMenu = false;
  }

  function goToForests() {
    goto("/forests");
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
      passwordError = translations.pleaseEnterAllFields;
      return;
    }

    if (newPassword !== confirmPassword) {
      passwordError = translations.passwordsDoNotMatch;
      return;
    }

    if (newPassword.length < 6) {
      passwordError = translations.passwordTooShort;
      return;
    }

    if ($jwt) {
      let success = false;

      try {
        await updatePassword($jwt, currentPassword, newPassword);
        closeChangePasswordModal();
        alert(translations.passwordChanged);
      } catch (e) {
        if (e?.message === "Invalid credentials")
          passwordError = translations.incorrectCurrentPassword;
        else passwordError = translations.loginError;
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
    if (
      showMobileMenu &&
      mobileMenuElement &&
      mobileMenuButton &&
      !mobileMenuElement.contains(event.target) &&
      !mobileMenuButton.contains(event.target)
    ) {
      showMobileMenu = false;
    }
  }

  async function handleChangeForest(e) {
    const newForestId = e.target.value;
    selectedForest = newForestId;
    selectedForestId.set(String(newForestId));
    const oldUrl = statePage.url.pathname;
    const newUrl = oldUrl.replace(/\/forests\/\d+/, `/forests/${newForestId}`);
    const navigated = oldUrl !== newUrl;
    await goto(newUrl);
    if (browser && navigated) {
      // Force full refresh to ensure all forest-scoped data is reset
      setTimeout(() => window.location.reload(), 50);
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<nav class="bg-background border-b border-border sticky top-0 z-50">
  <div class="flex items-center justify-between h-16 px-4 md:px-6">
    <!-- Left: Forest Selector and Logo (Mobile hidden, Desktop visible) -->
    <div class="flex items-center gap-4 md:gap-8 flex-1 md:flex-none">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
        >
          <span class="text-primary-foreground font-semibold text-sm"
            >{forestInitials}</span
          >
        </div>
        <select
          class="font-semibold text-sm md:text-lg hidden md:block"
          on:change={handleChangeForest}
          bind:this={forestSelector}
        >
          {#each forests as forest}
            <SelectOption
              name={forest.name}
              value={forest.id}
              currentValue={selectedForest}
            />
          {/each}
        </select>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex gap-1">
        <a
          href="/forests/{selectedForest}"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page
            .url.pathname === `/forests/${selectedForest}`
            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
            : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted'}"
        >
          <Home class="w-4 h-4" />
          <span class="font-medium">{translations.home}</span>
        </a>

        <a
          href="/forests/{selectedForest}/map"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page.url.pathname.endsWith(
            '/map',
          )
            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
            : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted'}"
        >
          <Map class="w-4 h-4" />
          <span class="font-medium">{translations.mapView}</span>
        </a>

        <a
          href="/forests/{selectedForest}/plants"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page.url.pathname.endsWith(
            '/plants',
          )
            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
            : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted'}"
        >
          <List class="w-4 h-4" />
          <span class="font-medium">{translations.plantsList}</span>
        </a>

        <a
          href="/species"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page
            .url.pathname === '/species'
            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
            : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted'}"
        >
          <Leaf class="w-4 h-4" />
          <span class="font-medium">{translations.species}</span>
        </a>

        <a
          href="/forests/{selectedForest}/messages"
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {$page.url.pathname.endsWith(
            '/messages',
          )
            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
            : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted'}"
        >
          <MessageCircle class="w-4 h-4" />
          <span class="font-medium">{translations.messages}</span>
        </a>
      </div>
    </div>

    <!-- Right: Controls and Mobile Menu Button -->
    <div class="flex items-center gap-1 md:gap-2">
      <!-- Language Toggle -->
      <button
        on:click={toggleLanguage}
        class="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer text-sm md:text-base"
        aria-label="Toggle language"
      >
        <Languages class="w-4 h-4" />
        <span class="font-medium text-xs md:text-sm"
          >{$language === "en" ? "NL" : "EN"}</span
        >
      </button>

      <!-- Theme Toggle -->
      <button
        on:click={toggleTheme}
        class="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
        aria-label="Toggle theme"
      >
        {#if $theme === "light"}
          <Moon class="w-4 h-4" />
        {:else}
          <Sun class="w-4 h-4" />
        {/if}
      </button>

      {#if $jwt}
        <!-- Desktop User Menu -->
        <div
          class="relative hidden md:block ml-2 md:ml-4 md:pl-[1.625rem] border-l border-border"
          bind:this={userMenuElement}
        >
          <button
            on:click={() => (showUserMenu = !showUserMenu)}
            class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            aria-label="User menu"
          >
            <span class="text-sm font-bold text-foreground"
              >{getPayload($jwt).displayName}</span
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
                      {translations.name}
                    </p>
                    <p class="text-sm font-medium text-foreground">
                      {getPayload($jwt).displayName}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground mb-1">
                      {translations.role}
                    </p>
                    <p class="text-sm font-medium text-foreground capitalize">
                      {t(getPayload($jwt).role, $language)}
                    </p>
                  </div>
                </div>
              </div>

              {#if getPayload($jwt).role === "admin"}
                <button
                  on:click={goToAdmin}
                  class="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2 border-b border-border cursor-pointer"
                >
                  <UserCog class="w-4 h-4" />
                  {translations.accountManagement}
                </button>
                <button
                  on:click={goToForests}
                  class="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2 border-b border-border cursor-pointer"
                >
                  <Settings class="w-4 h-4" />
                  {translations.forestManagement}
                </button>
              {/if}

              <button
                on:click={openChangePasswordModal}
                class="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2 border-b border-border cursor-pointer"
              >
                <Key class="w-4 h-4" />
                {translations.changePassword}
              </button>

              <button
                on:click={goToSettings}
                class="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2 border-b border-border cursor-pointer"
              >
                <Settings class="w-4 h-4" />
                {translations.userSettings}
              </button>

              <button
                on:click={handleLogout}
                class="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 cursor-pointer"
                style="color: var(--status-critical);"
              >
                <LogOut class="w-4 h-4" />
                {translations.logout}
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <!-- Login Button (Desktop) -->
        <button
          on:click={handleLogin}
          class="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          aria-label="Login"
        >
          <LogIn class="w-4 h-4" />
          <span class="font-medium">{translations.login}</span>
        </button>
      {/if}

      <!-- Mobile Menu Button -->
      <button
        on:click|stopPropagation={toggleMobileMenu}
        class="md:hidden flex items-center justify-center p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
        aria-label="Toggle mobile menu"
        bind:this={mobileMenuButton}
      >
        {#if showMobileMenu}
          <X class="w-6 h-6" />
        {:else}
          <Menu class="w-6 h-6" />
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if showMobileMenu}
    <div
      class="md:hidden fixed top-16 left-0 right-0 bottom-0 bg-black/20 backdrop-blur-sm"
      bind:this={mobileMenuElement}
      style="z-index: 40;"
    >
      <div
        class="bg-card/80 backdrop-blur-md border-b border-border shadow-xl h-[calc(100vh-4rem)] flex flex-col"
        style="z-index: 41;"
      >
        <!-- Forest Selector for Mobile -->
        <div class="px-4 py-3 border-b border-border">
          <label
            for="mobile-forest-selector"
            class="block text-xs font-medium text-muted-foreground mb-2"
          >
            {translations.forest}
          </label>
          <select
            id="mobile-forest-selector"
            class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            on:change={(e) => {
              handleChangeForest(e);
              closeMobileMenu();
            }}
            bind:this={forestSelector}
          >
            {#each forests as forest}
              <SelectOption
                name={forest.name}
                value={forest.id}
                currentValue={selectedForest}
              />
            {/each}
          </select>
        </div>

        <!-- Mobile Navigation Links -->
        <div class="px-4 py-2 space-y-2 flex-1 overflow-y-auto">
          <a
            href="/forests/{selectedForest}"
            on:click={closeMobileMenu}
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted {$page
              .url.pathname === `/forests/${selectedForest}`
              ? 'bg-primary text-primary-foreground hover:bg-primary/80'
              : ''}"
          >
            <Home class="w-5 h-5" />
            <span class="font-medium">{translations.home}</span>
          </a>

          <a
            href="/forests/{selectedForest}/map"
            on:click={closeMobileMenu}
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted {$page.url.pathname.endsWith(
              '/map',
            )
              ? 'bg-primary text-primary-foreground hover:bg-primary/80'
              : ''}"
          >
            <Map class="w-5 h-5" />
            <span class="font-medium">{translations.mapView}</span>
          </a>

          <a
            href="/forests/{selectedForest}/plants"
            on:click={closeMobileMenu}
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted {$page.url.pathname.endsWith(
              '/plants',
            )
              ? 'bg-primary text-primary-foreground hover:bg-primary/80'
              : ''}"
          >
            <List class="w-5 h-5" />
            <span class="font-medium">{translations.plantsList}</span>
          </a>

          <a
            href="/species"
            on:click={closeMobileMenu}
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted {$page
              .url.pathname === '/species'
              ? 'bg-primary text-primary-foreground hover:bg-primary/80'
              : ''}"
          >
            <Leaf class="w-5 h-5" />
            <span class="font-medium">{translations.species}</span>
          </a>

          <a
            href="/forests/{selectedForest}/messages"
            on:click={closeMobileMenu}
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted {$page.url.pathname.endsWith(
              '/messages',
            )
              ? 'bg-primary text-primary-foreground hover:bg-primary/80'
              : ''}"
          >
            <MessageCircle class="w-5 h-5" />
            <span class="font-medium">{translations.messages}</span>
          </a>
        </div>

        <!-- Mobile User Menu / Login (at bottom) -->
        {#if $jwt}
          <div class="border-t border-border px-4 py-3 space-y-2">
            <div class="pb-2 mb-2 border-b border-border">
              <p class="text-xs text-muted-foreground">
                {translations.name}
              </p>
              <p class="text-sm font-medium text-foreground">
                {getPayload($jwt).displayName}
              </p>
            </div>

            {#if getPayload($jwt).role === "admin"}
              <button
                on:click={() => {
                  goToAdmin();
                  closeMobileMenu();
                }}
                class="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer text-left"
              >
                <UserCog class="w-5 h-5" />
                {translations.accountManagement}
              </button>

              <button
                on:click={() => {
                  goto("/forests");
                  closeMobileMenu();
                }}
                class="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer text-left"
              >
                <Map class="w-5 h-5" />
                {translations.forestManagement}
              </button>
            {/if}

            <button
              on:click={() => {
                openChangePasswordModal();
                closeMobileMenu();
              }}
              class="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer text-left"
            >
              <Key class="w-5 h-5" />
              {translations.changePassword}
            </button>

            <button
              on:click={() => {
                goToSettings();
                closeMobileMenu();
              }}
              class="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer text-left"
            >
              <Settings class="w-5 h-5" />
              {translations.userSettings}
            </button>

            <button
              on:click={() => {
                handleLogout();
                closeMobileMenu();
              }}
              class="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:bg-muted cursor-pointer text-left"
              style="color: var(--status-critical);"
            >
              <LogOut class="w-5 h-5" />
              {translations.logout}
            </button>
          </div>
        {:else}
          <div class="border-t border-border px-4 py-3">
            <button
              on:click={() => {
                handleLogin();
                closeMobileMenu();
              }}
              class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              <LogIn class="w-5 h-5" />
              <span class="font-medium">{translations.login}</span>
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
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
