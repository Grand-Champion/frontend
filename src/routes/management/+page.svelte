<script lang="ts">
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { t, language } from "$lib/stores/language";
    import {
        Trash2,
        UserPlus,
        ChevronUp,
        ChevronDown,
        Eye,
        EyeOff,
        Pencil,
        CheckCircle2,
    } from "lucide-svelte";
    import { jwt } from "$lib/stores/jwt";
    import {
        deleteUser,
        getPayload,
        getUser,
        updatePassword,
        updateUser,
        getUsers,
        createUser,
    } from "$lib/Auth";
    import { derived } from "svelte/store";
    import { onMount } from "svelte";
    import SelectOption from "$lib/components/SelectOption.svelte";

    $: pageTitle = `${t("accountManagement", $language)}`;

    // Redirect if not admin or manager
    $: if (browser && (!$jwt || getPayload($jwt).role !== "admin")) {
        goto("/");
    }

    let showCreateForm = false;
    let newDisplayName = "";
    let newEmail = "";
    let newPassword = "";
    let newRole = "user";
    let createError = "";

    let sortBy: "email" | "displayName" | "username" | "role" | "createdAt" = "email";
    let sortAsc = true;
    let searchFilter = "";

    // Edit user state
    let editingUser: Record<string, boolean> = {};
    let editDisplayName: Record<string, string> = {};
    let editEmail: Record<string, string> = {};
    let editPassword: Record<string, string> = {};
    let editRole: Record<string, string> = {};
    let editError: Record<string, string> = {};
    let passwordVisibility: Record<string, boolean> = {};

    // Delete confirmation modal
    let showDeleteConfirm = false;
    let userToDelete: string | null = null;
    let userToDeleteName = "";
    let deleteConfirmPassword = "";
    let deleteError = "";
    let showDeletePassword = false;

    // Admin save modal
    let showAdminSaveModal = false;
    let pendingAdminSaveUserId = "";
    let pendingAdminSavePassword = "";
    let adminSaveKey = "";
    let adminSaveError = "";
    let adminSaveShowKey = false;

    // Admin password change
    let showAdminPasswordChange = false;
    let adminKey = "";
    let adminCurrentPassword = "";
    let adminNewPassword = "";
    let adminPasswordError = "";
    let adminPasswordVisibility: Record<string, boolean> = {};

    const auth = derived(jwt, ($jwt) => ({
        currentUser: $jwt ? getPayload($jwt) : null,
    }));

    let currentUser: any = $jwt ? getPayload($jwt) : null;
    $: currentUser = $jwt ? getPayload($jwt) : null;

    function openDeleteConfirm(userId: string) {
        const user = sortedUsers.find((u) => u.id === userId);
        if (
            user &&
            user.role !== "admin" &&
            !(user.role === "manager" && user.id === currentUser?.id)
        ) {
            userToDelete = userId;
            userToDeleteName = user.displayName;
            showDeleteConfirm = true;
            deleteConfirmPassword = "";
            deleteError = "";
            showDeletePassword = false;
        }
    }

    function closeDeleteConfirm() {
        showDeleteConfirm = false;
        userToDelete = null;
        userToDeleteName = "";
        deleteConfirmPassword = "";
        deleteError = "";
        showDeletePassword = false;
    }

    async function confirmDelete() {
        deleteError = "";

        if (userToDelete) {
            try {
                await deleteUser($jwt as string, userToDelete);
                closeDeleteConfirm();
                sortUsers();
            } catch (e) {
                if (e?.message == "Invalid credentials") {
                    deleteError = t("invalidCredentials", $language);
                } else {
                    deleteError = "An error occurred";
                }
            }
        }
    }

    async function toggleSort(column: 'displayName' | 'username' | 'email' | 'role' | 'createdAt') {
        if (sortBy === column) {
            sortAsc = !sortAsc;
        } else {
            sortBy = column;
            sortAsc = true;
        }
        await sortUsers();
    }

    $: sortedUsers = [];
    async function sortUsers() {
        sortedUsers = [...(await getUsers($jwt as string))]
            .filter((user) => {
                if (!searchFilter.trim()) return true;
                const search = searchFilter.toLowerCase();
                return (
                    user.email.toLowerCase().includes(search) ||
                    user.displayName.toLowerCase().includes(search)
                );
            })
            .sort((a, b) => {
                let aVal: string | number = "";
                let bVal: string | number = "";

                switch (sortBy) {
                    case "displayName":
                        const aDisplayName = a.displayName?.trim() || "";
                        const bDisplayName = b.displayName?.trim() || "";
                        // Handle empty displayName - place at top when sorting A-Z
                        if (!aDisplayName && bDisplayName)
                            return sortAsc ? -1 : 1;
                        if (aDisplayName && !bDisplayName)
                            return sortAsc ? 1 : -1;
                        if (!aDisplayName && !bDisplayName) return 0;
                        aVal = aDisplayName.toLowerCase();
                        bVal = bDisplayName.toLowerCase();
                        break;
                    case "username":
                        aVal = (a as any)?.username?.toLowerCase?.() || "";
                        bVal = (b as any)?.username?.toLowerCase?.() || "";
                        break;
                    case "role":
                        aVal = a.role;
                        bVal = b.role;
                        break;
                    case "createdAt":
                        aVal = new Date(a.createdAt).getTime();
                        bVal = new Date(b.createdAt).getTime();
                        break;
                    case "email":
                        aVal = a?.email?.toLowerCase();
                        bVal = b?.email?.toLowerCase();
                        break;
                }

                if (aVal < bVal) return sortAsc ? -1 : 1;
                if (aVal > bVal) return sortAsc ? 1 : -1;
                return 0;
            });
    }

    function getRoleBadgeStyle(role: string) {
        const roleColor =
            {
                admin: "var(--role-admin)",
                user: "var(--role-gardener)",
            }[role] || "var(--foreground)";
        return `background-color: color-mix(in oklch, ${roleColor} 12%, transparent); color: ${roleColor};`;
    }
    onMount(sortUsers);
</script>

<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

<div class="bg-background p-6">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-foreground mb-2">
                {t("accountManagement", $language)}
            </h1>
            <p class="text-muted-foreground">
                {t("manageUserAccounts", $language)}
            </p>
        </div>

        <!-- Create User Button and Search Filter -->
        <div
            class="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
        >
            <button
                on:click={() => (showCreateForm = !showCreateForm)}
                class="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
                <UserPlus class="w-4 h-4" />
                {t("createNewAccount", $language)}
            </button>
            <input
                type="text"
                bind:value={searchFilter}
                placeholder="{t('search', $language)}..."
                class="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-80"
            />
        </div>

        <!-- Create User Form -->
        {#if showCreateForm}
            <div class="bg-card border border-border rounded-lg p-6 mb-6">
                <h2 class="text-sm font-semibold text-foreground mb-4">
                    {t("createNewAccount", $language)}
                </h2>

                <form
                    on:submit|preventDefault={handleCreateUser}
                    class="space-y-4"
                >
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                for="new-displayname"
                                class="block text-sm font-medium text-foreground mb-2"
                            >
                                {t("displayName", $language)}
                            </label>
                            <input
                                id="new-displayname"
                                type="text"
                                bind:value={newDisplayName}
                                required
                                class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder={t("enterDisplayName", $language)}
                            />
                        </div>

                        <div>
                            <label
                                for="new-email"
                                class="block text-sm font-medium text-foreground mb-2"
                            >
                                {t("email", $language)}
                            </label>
                            <input
                                id="new-email"
                                type={newRole === "admin" ? "text" : "email"}
                                bind:value={newEmail}
                                required
                                title="Email should be in format: example@domain.com"
                                class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="example@domain.com"
                            />
                        </div>

                        <div>
                            <label
                                for="new-password"
                                class="block text-sm font-medium text-foreground mb-2"
                            >
                                {t("password", $language)}
                            </label>
                            <div class="relative">
                                <input
                                    id="new-password"
                                    type={passwordVisibility["new"]
                                        ? "text"
                                        : "password"}
                                    bind:value={newPassword}
                                    required
                                    class="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder={t("enterPassword", $language)}
                                />
                                <button
                                    type="button"
                                    on:click={() => {
                                        passwordVisibility["new"] =
                                            !passwordVisibility["new"];
                                        passwordVisibility = passwordVisibility;
                                    }}
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    {#if passwordVisibility["new"]}
                                        <EyeOff class="w-4 h-4" />
                                    {:else}
                                        <Eye class="w-4 h-4" />
                                    {/if}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                for="new-role"
                                class="block text-sm font-medium text-foreground mb-2"
                            >
                                {t("role", $language)}
                            </label>
                            <select
                                id="new-role"
                                bind:value={newRole}
                                class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                            >
                                <option value="user"
                                    >{t("user", $language)}</option
                                >
                                <option value="admin"
                                    >{t("admin", $language)}</option
                                >
                            </select>
                        </div>
                    </div>

                    {#if createError}
                        <div
                            class="px-4 py-3 rounded-lg"
                            style={`background-color: color-mix(in oklch, var(--status-critical) 12%, transparent); border: 1px solid color-mix(in oklch, var(--status-critical) 32%, transparent); color: var(--status-critical);`}
                        >
                            {createError}
                        </div>
                    {/if}

                    <div class="flex gap-2">
                        <button
                            type="submit"
                            class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                            {t("create", $language)}
                        </button>
                        <button
                            type="button"
                            on:click={() => {
                                showCreateForm = false;
                                createError = "";
                                newDisplayName = "";
                                newEmail = "";
                                newPassword = "";
                                passwordVisibility["new"] = false;
                            }}
                            class="bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                        >
                            {t("cancel", $language)}
                        </button>
                    </div>
                </form>
            </div>
        {/if}

        <!-- Users List - Desktop Table -->
        <div
            class="hidden lg:block bg-card border border-border rounded-lg overflow-hidden"
        >
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-muted">
                        <tr>
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                                on:click={() => toggleSort("displayName")}
                            >
                                <div class="flex items-center gap-2">
                                    {t("displayName", $language)}
                                    {#if sortBy === "displayName"}
                                        {#if sortAsc}
                                            <ChevronUp class="w-4 h-4" />
                                        {:else}
                                            <ChevronDown class="w-4 h-4" />
                                        {/if}
                                    {/if}
                                </div>
                            </th>
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                                on:click={() => toggleSort("username")}
                            >
                                <div class="flex items-center gap-2">
                                    {t("username", $language)}
                                    {#if sortBy === "username"}
                                        {#if sortAsc}
                                            <ChevronUp class="w-4 h-4" />
                                        {:else}
                                            <ChevronDown class="w-4 h-4" />
                                        {/if}
                                    {/if}
                                </div>
                            </th>
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                                on:click={() => toggleSort("email")}
                            >
                                <div class="flex items-center gap-2">
                                    {t("email", $language)}
                                    {#if sortBy === "email"}
                                        {#if sortAsc}
                                            <ChevronUp class="w-4 h-4" />
                                        {:else}
                                            <ChevronDown class="w-4 h-4" />
                                        {/if}
                                    {/if}
                                </div>
                            </th>
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                                on:click={() => toggleSort("role")}
                            >
                                <div class="flex items-center gap-2">
                                    {t("role", $language)}
                                    {#if sortBy === "role"}
                                        {#if sortAsc}
                                            <ChevronUp class="w-4 h-4" />
                                        {:else}
                                            <ChevronDown class="w-4 h-4" />
                                        {/if}
                                    {/if}
                                </div>
                            </th>
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                                on:click={() => toggleSort("createdAt")}
                            >
                                <div class="flex items-center gap-2">
                                    {t("createdAt", $language)}
                                    {#if sortBy === "createdAt"}
                                        {#if sortAsc}
                                            <ChevronUp class="w-4 h-4" />
                                        {:else}
                                            <ChevronDown class="w-4 h-4" />
                                        {/if}
                                    {/if}
                                </div>
                            </th>
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold text-foreground"
                            >
                                {t("actions", $language)}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        {#each sortedUsers as user}
                            <tr class="hover:bg-muted/50">
                                <td class="px-6 py-4 text-sm text-foreground">
                                    <div class="flex items-center gap-2">
                                        {user.displayName}
                                        {#if user.id === $auth.currentUser?.id}
                                            <div
                                                title={$language === "en"
                                                    ? "Currently Logged In"
                                                    : "Momenteel Ingelogd"}
                                                class="cursor-help"
                                            >
                                                <CheckCircle2
                                                    class="w-4 h-4"
                                                    style="color: var(--action-icon);"
                                                    aria-label="Currently logged in"
                                                />
                                            </div>
                                        {/if}
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm text-foreground">
                                    {user.username}
                                </td>
                                <td class="px-6 py-4 text-sm text-foreground">
                                    {user.email}
                                </td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="px-2 py-1 rounded-full text-xs font-medium"
                                        style={getRoleBadgeStyle(user.role)}
                                    >
                                        {t(user.role, $language)}
                                    </span>
                                </td>
                                <td
                                    class="px-6 py-4 text-sm text-muted-foreground"
                                >
                                    {new Date(user.createdAt).toLocaleString()}
                                </td>
                                <td class="px-6 py-4 text-sm">
                                    <div class="flex items-center gap-2">
                                        {#if true}
                                            <button
                                                on:click={() => {
                                                    // Close all other edit forms
                                                    Object.keys(
                                                        editingUser,
                                                    ).forEach((id) => {
                                                        if (id !== user.id) {
                                                            editUsername[
                                                                user.id
                                                            ] = user.username;
                                                            editFullName[
                                                                user.id
                                                            ] = user.displayName;
                                                            editEmail[user.id] =
                                                                user.email;
                                                            editPassword[
                                                                user.id
                                                            ] = user.password;
                                                            editRole[user.id] =
                                                                user.role;
                                                            editError[user.id] =
                                                                "";
                                                        }
                                                    });

                                                    editingUser[user.id] =
                                                        !editingUser[user.id];
                                                    if (editingUser[user.id]) {
                                                        editDisplayName[
                                                            user.id
                                                        ] = user.displayName;
                                                        editPassword[user.id] =
                                                            user.password;
                                                        editRole[user.id] =
                                                            user.role;
                                                        editEmail[user.id] =
                                                            user.email;
                                                        editError[user.id] = "";
                                                    }
                                                }}
                                                class="cursor-pointer hover:opacity-80 transition-opacity"
                                                style="color: var(--action-icon);"
                                                aria-label="Edit user"
                                            >
                                                <Pencil class="w-4 h-4" />
                                            </button>
                                        {:else}
                                            <span
                                                class="text-muted-foreground text-xs"
                                                >-</span
                                            >
                                        {/if}
                                        {#if user.id !== getPayload($jwt).id}
                                            <button
                                                on:click={() =>
                                                    handleDeleteUser(user.id)}
                                                class="cursor-pointer"
                                                style="color: var(--status-critical);"
                                                aria-label="Delete user"
                                            >
                                                <Trash2 class="w-4 h-4" />
                                            </button>
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                            {#if editingUser[user.id]}
                                <tr>
                                    <td
                                        colspan="6"
                                        class="px-6 py-4 bg-muted/30"
                                    >
                                        <form
                                            on:submit|preventDefault={() => {
                                                handleEditUser(user.id);
                                            }}
                                            class="space-y-4"
                                        >
                                            <h3
                                                class="text-sm font-semibold text-foreground"
                                            >
                                                {t("editUser", $language)}
                                            </h3>
                                            <div
                                                class="grid grid-cols-1 md:grid-cols-2 gap-4"
                                            >
                                                <div>
                                                    <label
                                                        for="edit-displayname-{user.id}"
                                                        class="block text-sm font-medium text-foreground mb-2"
                                                    >
                                                        {t(
                                                            "displayName",
                                                            $language,
                                                        )}
                                                    </label>
                                                    <input
                                                        id="edit-displayname-{user.id}"
                                                        type="text"
                                                        bind:value={
                                                            editDisplayName[
                                                                user.id
                                                            ]
                                                        }
                                                        required
                                                        class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        for="edit-email-{user.id}"
                                                        class="block text-sm font-medium text-foreground mb-2"
                                                    >
                                                        {t("email", $language)}
                                                    </label>
                                                    <input
                                                        id="edit-fullname-{user.id}"
                                                        type="text"
                                                        bind:value={
                                                            editFullName[
                                                                user.id
                                                            ]
                                                        }
                                                        required
                                                        disabled={user.role ===
                                                            "admin" ||
                                                            ($auth.currentUser
                                                                ?.role ===
                                                                "manager" &&
                                                                user.role ===
                                                                    "manager" &&
                                                                user.id !==
                                                                    $auth
                                                                        .currentUser
                                                                        ?.id)}
                                                        class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary {user.role ===
                                                            'admin' ||
                                                        ($auth.currentUser
                                                            ?.role ===
                                                            'manager' &&
                                                            user.role ===
                                                                'manager' &&
                                                            user.id !==
                                                                $auth
                                                                    .currentUser
                                                                    ?.id)
                                                            ? 'opacity-60 cursor-not-allowed'
                                                            : ''}"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        for="edit-email-{user.id}"
                                                        class="block text-sm font-medium text-foreground mb-2"
                                                    >
                                                        {t("email", $language)}
                                                    </label>
                                                    <input
                                                        id="edit-email-{user.id}"
                                                        type={user.role ===
                                                        "admin"
                                                            ? "text"
                                                            : "email"}
                                                        bind:value={
                                                            editEmail[user.id]
                                                        }
                                                        required
                                                        title="Email should be in format: example@domain.com"
                                                        class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        for="edit-password-{user.id}"
                                                        class="block text-sm font-medium text-foreground mb-2"
                                                    >
                                                        {t(
                                                            "password",
                                                            $language,
                                                        )}
                                                    </label>
                                                    <div class="relative">
                                                        <input
                                                            id="edit-password-{user.id}"
                                                            type={passwordVisibility[
                                                                user.id
                                                            ]
                                                                ? "text"
                                                                : "password"}
                                                            bind:value={
                                                                editPassword[
                                                                    user.id
                                                                ]
                                                            }
                                                            placeholder="••••••••••"
                                                            class="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary {user.id ===
                                                            getPayload($jwt).id
                                                                ? 'opacity-60 cursor-not-allowed'
                                                                : ''}"
                                                            disabled={user.id ===
                                                                getPayload($jwt)
                                                                    .id}
                                                        />
                                                        <button
                                                            type="button"
                                                            on:click={() => {
                                                                passwordVisibility[
                                                                    user.id
                                                                ] =
                                                                    !passwordVisibility[
                                                                        user.id
                                                                    ];
                                                                passwordVisibility =
                                                                    passwordVisibility;
                                                            }}
                                                            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                                        >
                                                            {#if passwordVisibility[user.id]}
                                                                <EyeOff
                                                                    class="w-4 h-4"
                                                                />
                                                            {:else}
                                                                <Eye
                                                                    class="w-4 h-4"
                                                                />
                                                            {/if}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label
                                                        for="edit-role-{user.id}"
                                                        class="block text-sm font-medium text-foreground mb-2"
                                                    >
                                                        {t("role", $language)}
                                                    </label>
                                                    <select
                                                        id="edit-role-{user.id}"
                                                        bind:value={
                                                            editRole[user.id]
                                                        }
                                                        class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer {user.id ===
                                                        getPayload($jwt).id
                                                            ? 'opacity-60 cursor-not-allowed'
                                                            : ''}"
                                                        disabled={user.id ===
                                                            getPayload($jwt).id}
                                                    >
                                                        <SelectOption
                                                            value="user"
                                                            name={t(
                                                                "user",
                                                                $language,
                                                            )}
                                                            currentValue={user.role}
                                                        />
                                                        <SelectOption
                                                            value="admin"
                                                            name={t(
                                                                "admin",
                                                                $language,
                                                            )}
                                                            currentValue={user.role}
                                                        />
                                                    </select>
                                                </div>
                                            </div>
                                            {#if editError[user.id]}
                                                <div
                                                    class="px-4 py-3 rounded-lg"
                                                    style={`background-color: color-mix(in oklch, var(--status-critical) 12%, transparent); border: 1px solid color-mix(in oklch, var(--status-critical) 32%, transparent); color: var(--status-critical);`}
                                                >
                                                    {editError[user.id]}
                                                </div>
                                            {/if}
                                            <div class="flex gap-2">
                                                <button
                                                    type="submit"
                                                    class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                                                >
                                                    {t("save", $language)}
                                                </button>
                                                <button
                                                    type="button"
                                                    on:click={() => {
                                                        editingUser[user.id] =
                                                            false;
                                                        editPassword[user.id] =
                                                            "";
                                                        editError[user.id] = "";
                                                        passwordVisibility[
                                                            user.id
                                                        ] = false;
                                                    }}
                                                    class="bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                                                >
                                                    {t("cancel", $language)}
                                                </button>
                                            </div>
                                        </form>
                                    </td>
                                </tr>
                            {/if}
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Users List - Mobile Cards -->
        <div class="lg:hidden space-y-4">
            {#each sortedUsers as user}
                <div class="bg-card border border-border rounded-lg p-4">
                    <div class="space-y-3">
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <h3 class="font-semibold text-foreground">
                                        {user.displayName}
                                    </h3>
                                    {#if user.id === $auth.currentUser?.id}
                                        <div
                                            title={$language === "en"
                                                ? "Currently Logged In"
                                                : "Momenteel Ingelogd"}
                                            class="cursor-help"
                                        >
                                            <CheckCircle2
                                                class="w-4 h-4"
                                                style="color: var(--action-icon);"
                                                aria-label="Currently logged in"
                                            />
                                        </div>
                                    {/if}
                                </div>
                                <p class="text-sm text-muted-foreground">
                                    {user.username}
                                </p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span
                                    class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                    style={getRoleBadgeStyle(user.role)}
                                >
                                    {t(user.role, $language)}
                                </span>
                            </div>
                        </div>

                        <div class="text-sm space-y-1">
                            <div class="flex gap-2">
                                <span class="text-muted-foreground">Email:</span
                                >
                                <span class="text-foreground">{user.email}</span
                                >
                            </div>
                            <div class="flex gap-2">
                                <span class="text-muted-foreground"
                                    >{t("createdAt", $language)}:</span
                                >
                                <span class="text-foreground"
                                    >{new Date(
                                        user.createdAt,
                                    ).toLocaleDateString()}</span
                                >
                            </div>
                        </div>
                        {#if !(($auth.currentUser?.role === "manager" && user.role === "manager" && user.id !== $auth.currentUser?.id) || ($auth.currentUser?.role === "manager" && user.role !== "gardener" && user.id !== $auth.currentUser?.id))}
                            <div
                                class="flex items-center gap-2 pt-2 border-t border-border"
                            >
                                {#if !($auth.currentUser?.role === "manager" && user.role === "manager" && user.id !== $auth.currentUser?.id)}
                                    <button
                                        on:click={() => {
                                            Object.keys(editingUser).forEach(
                                                (id) => {
                                                    if (id !== user.id) {
                                                        editingUser[id] = false;
                                                        editError[id] = "";
                                                        editPassword[id] = "";
                                                        passwordVisibility[id] =
                                                            false;
                                                    }
                                                },
                                            );
                                            editingUser[user.id] =
                                                !editingUser[user.id];
                                            if (editingUser[user.id]) {
                                                editUsername[user.id] =
                                                    user.username;
                                                editFullName[user.id] =
                                                    user.displayName;
                                                editEmail[user.id] = user.email;
                                                editPassword[user.id] =
                                                    user.password;
                                                editRole[user.id] = user.role;
                                                editError[user.id] = "";
                                            }
                                        }}
                                        class="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer flex-1"
                                    >
                                        <Pencil
                                            class="w-4 h-4"
                                            style="color: var(--action-icon);"
                                        />
                                        <span class="text-sm font-medium"
                                            >{t("edit", $language)}</span
                                        >
                                    </button>
                                {/if}
                                {#if !($auth.currentUser?.role === "manager" && user.role === "manager" && user.id !== $auth.currentUser?.id) && !($auth.currentUser?.role === "manager" && user.role !== "gardener" && user.id !== $auth.currentUser?.id) && user.role !== "admin" && !(user.role === "manager" && user.id === $auth.currentUser?.id)}
                                    <button
                                        on:click={() =>
                                            handleDeleteUser(user.id)}
                                        class="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer flex-1"
                                    >
                                        <Trash2
                                            class="w-4 h-4"
                                            style="color: var(--status-critical);"
                                        />
                                        <span
                                            class="text-sm font-medium"
                                            style="color: var(--status-critical);"
                                            >{t("delete", $language)}</span
                                        >
                                    </button>
                                {/if}
                            </div>
                        {/if}
                    </div>

                    {#if editingUser[user.id]}
                        <div class="mt-4 pt-4 border-t border-border">
                            <form
                                on:submit|preventDefault={() => {
                                    if (user.role === "admin") {
                                        handleAdminEditSave(
                                            user.id,
                                            editPassword[user.id],
                                        );
                                    } else {
                                        handleEditUser(user.id);
                                    }
                                }}
                                class="space-y-4"
                            >
                                <h3
                                    class="text-sm font-semibold text-foreground"
                                >
                                    {t("editUser", $language)}
                                </h3>

                                <div class="space-y-3">
                                    <div>
                                        <label
                                            for="edit-username-mobile-{user.id}"
                                            class="block text-sm font-medium text-foreground mb-2"
                                        >
                                            {t("username", $language)}
                                        </label>
                                        <input
                                            id="edit-username-mobile-{user.id}"
                                            type="text"
                                            bind:value={editUsername[user.id]}
                                            required
                                            disabled={user.role === "admin" ||
                                                ($auth.currentUser?.role ===
                                                    "manager" &&
                                                    user.role === "manager" &&
                                                    user.id !==
                                                        $auth.currentUser?.id)}
                                            class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary {user.role ===
                                                'admin' ||
                                            ($auth.currentUser?.role ===
                                                'manager' &&
                                                user.role === 'manager' &&
                                                user.id !==
                                                    $auth.currentUser?.id)
                                                ? 'opacity-60 cursor-not-allowed'
                                                : ''}"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            for="edit-fullname-mobile-{user.id}"
                                            class="block text-sm font-medium text-foreground mb-2"
                                        >
                                            {t("fullName", $language)}
                                        </label>
                                        <input
                                            id="edit-fullname-mobile-{user.id}"
                                            type="text"
                                            bind:value={editFullName[user.id]}
                                            required
                                            disabled={user.role === "admin" ||
                                                ($auth.currentUser?.role ===
                                                    "manager" &&
                                                    user.role === "manager" &&
                                                    user.id !==
                                                        $auth.currentUser?.id)}
                                            class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary {user.role ===
                                                'admin' ||
                                            ($auth.currentUser?.role ===
                                                'manager' &&
                                                user.role === 'manager' &&
                                                user.id !==
                                                    $auth.currentUser?.id)
                                                ? 'opacity-60 cursor-not-allowed'
                                                : ''}"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            for="edit-email-mobile-{user.id}"
                                            class="block text-sm font-medium text-foreground mb-2"
                                        >
                                            {t("email", $language)}
                                        </label>
                                        <input
                                            id="edit-email-mobile-{user.id}"
                                            type="email"
                                            bind:value={editEmail[user.id]}
                                            required
                                            disabled={user.role === "admin" ||
                                                ($auth.currentUser?.role ===
                                                    "manager" &&
                                                    user.role === "manager" &&
                                                    user.id !==
                                                        $auth.currentUser?.id)}
                                            class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary {user.role ===
                                                'admin' ||
                                            ($auth.currentUser?.role ===
                                                'manager' &&
                                                user.role === 'manager' &&
                                                user.id !==
                                                    $auth.currentUser?.id)
                                                ? 'opacity-60 cursor-not-allowed'
                                                : ''}"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            for="edit-password-mobile-{user.id}"
                                            class="block text-sm font-medium text-foreground mb-2"
                                        >
                                            {t("password", $language)}
                                        </label>
                                        <div class="relative">
                                            <input
                                                id="edit-password-mobile-{user.id}"
                                                type={passwordVisibility[
                                                    user.id
                                                ]
                                                    ? "text"
                                                    : "password"}
                                                bind:value={
                                                    editPassword[user.id]
                                                }
                                                placeholder="••••••••••"
                                                class="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                            <button
                                                type="button"
                                                on:click={() => {
                                                    passwordVisibility[
                                                        user.id
                                                    ] =
                                                        !passwordVisibility[
                                                            user.id
                                                        ];
                                                    passwordVisibility =
                                                        passwordVisibility;
                                                }}
                                                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            >
                                                {#if passwordVisibility[user.id]}
                                                    <EyeOff class="w-4 h-4" />
                                                {:else}
                                                    <Eye class="w-4 h-4" />
                                                {/if}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            for="edit-role-mobile-{user.id}"
                                            class="block text-sm font-medium text-foreground mb-2"
                                        >
                                            {t("role", $language)}
                                        </label>
                                        {#if $auth.currentUser?.role === "admin" && user.role !== "admin"}
                                            <select
                                                id="edit-role-mobile-{user.id}"
                                                bind:value={editRole[user.id]}
                                                class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                                            >
                                                <option value="manager"
                                                    >{t(
                                                        "manager",
                                                        $language,
                                                    )}</option
                                                >
                                                <option value="gardener"
                                                    >{t(
                                                        "gardener",
                                                        $language,
                                                    )}</option
                                                >
                                            </select>
                                        {:else}
                                            <input
                                                id="edit-role-mobile-{user.id}"
                                                type="text"
                                                value={t(user.role, $language)}
                                                disabled
                                                class="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                                            />
                                        {/if}
                                    </div>
                                </div>

                                {#if editError[user.id]}
                                    <div
                                        class="px-4 py-3 rounded-lg"
                                        style={`background-color: color-mix(in oklch, var(--status-critical) 12%, transparent); border: 1px solid color-mix(in oklch, var(--status-critical) 32%, transparent); color: var(--status-critical);`}
                                    >
                                        {editError[user.id]}
                                    </div>
                                {/if}

                                <div class="flex gap-2">
                                    <button
                                        type="submit"
                                        class="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                                    >
                                        {t("save", $language)}
                                    </button>
                                    <button
                                        type="button"
                                        on:click={() => {
                                            editingUser[user.id] = false;
                                            editPassword[user.id] = "";
                                            editError[user.id] = "";
                                            passwordVisibility[user.id] = false;
                                        }}
                                        class="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                                    >
                                        {t("cancel", $language)}
                                    </button>
                                </div>
                            </form>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>

        <!-- Admin Password Change Form -->
        {#if showAdminPasswordChange}
            <div class="bg-card border border-border rounded-lg p-6 mt-6">
                <h2 class="text-sm font-semibold text-foreground mb-4">
                    {t("changeAdminPassword", $language)}
                </h2>

                <form
                    on:submit|preventDefault={handleAdminPasswordChange}
                    class="space-y-4 max-w-md"
                >
                    <div>
                        <label
                            for="admin-key"
                            class="block text-sm font-medium text-foreground mb-2"
                        >
                            {t("adminKey", $language)}
                        </label>
                        <div class="relative">
                            <input
                                id="admin-key"
                                type={adminPasswordVisibility["key"]
                                    ? "text"
                                    : "password"}
                                bind:value={adminKey}
                                required
                                class="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder={t("enterAdminKey", $language)}
                            />
                            <button
                                type="button"
                                on:click={() => {
                                    adminPasswordVisibility["key"] =
                                        !adminPasswordVisibility["key"];
                                    adminPasswordVisibility =
                                        adminPasswordVisibility;
                                }}
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                {#if adminPasswordVisibility["key"]}
                                    <EyeOff class="w-4 h-4" />
                                {:else}
                                    <Eye class="w-4 h-4" />
                                {/if}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label
                            for="admin-current-password"
                            class="block text-sm font-medium text-foreground mb-2"
                        >
                            {t("currentPassword", $language)}
                        </label>
                        <div class="relative">
                            <input
                                id="admin-current-password"
                                type={adminPasswordVisibility["current"]
                                    ? "text"
                                    : "password"}
                                bind:value={adminCurrentPassword}
                                required
                                class="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder={t(
                                    "enterCurrentPassword",
                                    $language,
                                )}
                            />
                            <button
                                type="button"
                                on:click={() => {
                                    adminPasswordVisibility["current"] =
                                        !adminPasswordVisibility["current"];
                                    adminPasswordVisibility =
                                        adminPasswordVisibility;
                                }}
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                {#if adminPasswordVisibility["current"]}
                                    <EyeOff class="w-4 h-4" />
                                {:else}
                                    <Eye class="w-4 h-4" />
                                {/if}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label
                            for="admin-new-password"
                            class="block text-sm font-medium text-foreground mb-2"
                        >
                            {t("newPassword", $language)}
                        </label>
                        <div class="relative">
                            <input
                                id="admin-new-password"
                                type={adminPasswordVisibility["new"]
                                    ? "text"
                                    : "password"}
                                bind:value={adminNewPassword}
                                required
                                class="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder={t("enterNewPassword", $language)}
                            />
                            <button
                                type="button"
                                on:click={() => {
                                    adminPasswordVisibility["new"] =
                                        !adminPasswordVisibility["new"];
                                    adminPasswordVisibility =
                                        adminPasswordVisibility;
                                }}
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                {#if adminPasswordVisibility["new"]}
                                    <EyeOff class="w-4 h-4" />
                                {:else}
                                    <Eye class="w-4 h-4" />
                                {/if}
                            </button>
                        </div>
                    </div>

                    {#if adminPasswordError}
                        <div
                            class="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg"
                        >
                            {adminPasswordError}
                        </div>
                    {/if}

                    <div class="flex gap-2">
                        <button
                            type="submit"
                            class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                            {t("changePassword", $language)}
                        </button>
                        <button
                            type="button"
                            on:click={() => {
                                showAdminPasswordChange = false;
                                adminKey = "";
                                adminCurrentPassword = "";
                                adminNewPassword = "";
                                adminPasswordError = "";
                                adminPasswordVisibility = {};
                            }}
                            class="bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                        >
                            {t("cancel", $language)}
                        </button>
                    </div>
                </form>
            </div>
        {/if}

        <!-- Admin Save Modal -->
        {#if showAdminSaveModal}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <div
                class="fixed inset-0 bg-black/50 flex items-center justify-center"
                style="z-index: 200;"
                on:click={closeAdminSaveModal}
                role="presentation"
            >
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6"
                    on:click|stopPropagation
                >
                    <h2 class="text-lg font-semibold text-foreground mb-4">
                        {t("changeAdminPassword", $language)}
                    </h2>

                    <form
                        on:submit|preventDefault={submitAdminSave}
                        class="space-y-4"
                    >
                        <div>
                            <label
                                for="admin-save-key"
                                class="block text-sm font-medium text-foreground mb-2"
                            >
                                {t("adminKey", $language)}
                            </label>
                            <div class="relative">
                                <input
                                    id="admin-save-key"
                                    type={adminSaveShowKey
                                        ? "text"
                                        : "password"}
                                    bind:value={adminSaveKey}
                                    class="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder={t("enterAdminKey", $language)}
                                />
                                <button
                                    type="button"
                                    on:click={() =>
                                        (adminSaveShowKey = !adminSaveShowKey)}
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    aria-label="Toggle admin key visibility"
                                >
                                    {#if adminSaveShowKey}
                                        <EyeOff class="w-4 h-4" />
                                    {:else}
                                        <Eye class="w-4 h-4" />
                                    {/if}
                                </button>
                            </div>
                        </div>

                        {#if adminSaveError}
                            <div
                                class="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
                            >
                                {adminSaveError}
                            </div>
                        {/if}

                        <div class="flex gap-3 pt-2">
                            <button
                                type="button"
                                on:click={closeAdminSaveModal}
                                class="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted/80 transition-colors cursor-pointer"
                            >
                                {t("cancel", $language)}
                            </button>
                            <button
                                type="submit"
                                class="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                            >
                                {t("save", $language)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        {/if}
    </div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
    <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
        on:click={closeDeleteConfirm}
        on:keydown={(e) => e.key === "Escape" && closeDeleteConfirm()}
        role="button"
        tabindex="0"
    >
        <div
            class="bg-card border border-border rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
            on:click|stopPropagation
            on:keydown|stopPropagation
        >
            <h2 class="text-xl font-bold text-foreground mb-4">
                {t("confirmDelete", $language)}
            </h2>
            <p class="text-muted-foreground mb-4">
                {$language === "en"
                    ? `Are you sure you want to delete ${userToDeleteName}? This action cannot be undone.`
                    : `Weet je zeker dat je ${userToDeleteName} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
            </p>

            <div class="mb-4">
                {#if deleteError}
                    <p
                        class="text-sm mt-2"
                        style="color: var(--status-critical);"
                    >
                        {deleteError}
                    </p>
                {/if}
            </div>

            <div class="flex gap-3">
                <button
                    on:click={closeDeleteConfirm}
                    class="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted/80 transition-colors cursor-pointer"
                >
                    {t("cancel", $language)}
                </button>
                <button
                    on:click={confirmDelete}
                    class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                    style="background-color: var(--status-critical); color: white;"
                >
                    {$language === "en" ? "Delete" : "Verwijderen"}
                </button>
            </div>
        </div>
    </div>
{/if}
