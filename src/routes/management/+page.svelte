<script lang="ts">
    import { auth, type UserRole } from "$lib/stores/auth";
    import { goto } from "$app/navigation";
    import { t, language } from "$lib/stores/language";
    import {
        Trash2,
        UserPlus,
        ChevronUp,
        ChevronDown,
        Eye,
        EyeOff,
        Pencil,
    } from "lucide-svelte";

    // Redirect if not admin or manager
    $: if (
        !$auth.currentUser ||
        ($auth.currentUser.role !== "admin" &&
            $auth.currentUser.role !== "manager")
    ) {
        goto("/");
    }

    let showCreateForm = false;
    let newUsername = "";
    let newFullName = "";
    let newPassword = "";
    let newRole: UserRole = "gardener";
    let createError = "";

    let sortBy: "username" | "fullName" | "role" | "createdAt" = "username";
    let sortAsc = true;
    let searchFilter = "";

    // Edit user state
    let editingUser: Record<string, boolean> = {};
    let editUsername: Record<string, string> = {};
    let editFullName: Record<string, string> = {};
    let editPassword: Record<string, string> = {};
    let editRole: Record<string, UserRole> = {};
    let editError: Record<string, string> = {};
    let passwordVisibility: Record<string, boolean> = {};

    function handleEditUser(userId: string) {
        const user = $auth.users.find((u) => u.id === userId);
        if (!user) return;

        const newUsername = editUsername[userId] || user.username;
        const newFullName = editFullName[userId] || user.fullName;
        const newPassword = editPassword[userId];
        const newRole = editRole[userId] || user.role;

        // Validate required fields
        if (!newUsername.trim() || !newFullName.trim()) {
            editError[userId] = t("pleaseEnterCredentials", $language);
            return;
        }

        const updates: any = {
            username: newUsername,
            fullName: newFullName,
            role: newRole,
        };

        if (newPassword && newPassword.length >= 3) {
            updates.password = newPassword;
        }

        auth.updateUser(userId, updates);
        editingUser[userId] = false;
        editPassword[userId] = "";
        editError[userId] = "";
        passwordVisibility[userId] = false;
    }

    function handleCreateUser() {
        createError = "";

        if (!newUsername || !newFullName || !newPassword) {
            createError = t("pleaseEnterCredentials", $language);
            return;
        }

        // Check if username already exists
        if ($auth.users.find((u) => u.username === newUsername)) {
            createError = t("usernameExists", $language);
            return;
        }

        if ($auth.currentUser) {
            // Managers can only create gardener accounts
            if (
                $auth.currentUser.role === "manager" &&
                newRole !== "gardener"
            ) {
                createError = t("managerCanOnlyCreateKeepers", $language);
                return;
            }

            auth.createUser(
                newUsername,
                newFullName,
                newPassword,
                newRole,
                $auth.currentUser.username,
            );
            newUsername = "";
            newFullName = "";
            newPassword = "";
            newRole = "gardener";
            showCreateForm = false;
        }
    }

    function handleDeleteUser(userId: string) {
        if (confirm(t("confirmDelete", $language))) {
            auth.deleteUser(userId);
        }
    }

    function toggleSort(
        column: "username" | "fullName" | "role" | "createdAt",
    ) {
        if (sortBy === column) {
            sortAsc = !sortAsc;
        } else {
            sortBy = column;
            sortAsc = true;
        }
    }

    $: sortedUsers = [...$auth.users]
        .filter((user) => {
            // Hide admin accounts for managers
            if ($auth.currentUser?.role === "manager" && user.role === "admin")
                return false;
            if (!searchFilter.trim()) return true;
            const search = searchFilter.toLowerCase();
            return (
                user.username.toLowerCase().includes(search) ||
                user.fullName.toLowerCase().includes(search)
            );
        })
        .sort((a, b) => {
            let aVal: string | number = "";
            let bVal: string | number = "";

            switch (sortBy) {
                case "username":
                    aVal = a.username.toLowerCase();
                    bVal = b.username.toLowerCase();
                    break;
                case "fullName":
                    const aFullName = a.fullName?.trim() || "";
                    const bFullName = b.fullName?.trim() || "";
                    // Handle empty fullName - place at top when sorting A-Z
                    if (!aFullName && bFullName) return sortAsc ? -1 : 1;
                    if (aFullName && !bFullName) return sortAsc ? 1 : -1;
                    if (!aFullName && !bFullName) return 0;
                    aVal = aFullName.toLowerCase();
                    bVal = bFullName.toLowerCase();
                    break;
                case "role":
                    aVal = a.role;
                    bVal = b.role;
                    break;
                case "createdAt":
                    aVal = new Date(a.createdAt).getTime();
                    bVal = new Date(b.createdAt).getTime();
                    break;
            }

            if (aVal < bVal) return sortAsc ? -1 : 1;
            if (aVal > bVal) return sortAsc ? 1 : -1;
            return 0;
        });

    function getRoleBadgeStyle(role: UserRole) {
        const roleColor =
            {
                admin: "var(--role-admin)",
                manager: "var(--role-manager)",
                gardener: "var(--role-gardener)",
            }[role] || "var(--foreground)";
        return `background-color: color-mix(in oklch, ${roleColor} 12%, transparent); color: ${roleColor};`;
    }
</script>

<div class="min-h-screen bg-background p-6">
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
        <div class="mb-6 flex items-center justify-between gap-4">
            <button
                on:click={() => (showCreateForm = !showCreateForm)}
                class="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
                <UserPlus class="w-4 h-4" />
                {t("createNewAccount", $language)}
            </button>
            <input
                type="text"
                bind:value={searchFilter}
                placeholder="{t('search', $language)} {t(
                    'username',
                    $language,
                )}/{t('fullName', $language)}..."
                class="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-80"
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
                                for="new-username"
                                class="block text-sm font-medium text-foreground mb-2"
                            >
                                {t("username", $language)}
                            </label>
                            <input
                                id="new-username"
                                type="text"
                                bind:value={newUsername}
                                required
                                class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder={t("enterUsername", $language)}
                            />
                        </div>

                        <div>
                            <label
                                for="new-fullname"
                                class="block text-sm font-medium text-foreground mb-2"
                            >
                                {t("fullName", $language)}
                            </label>
                            <input
                                id="new-fullname"
                                type="text"
                                bind:value={newFullName}
                                required
                                class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder={t("enterFullName", $language)}
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
                            {#if $auth.currentUser?.role === "admin"}
                                <select
                                    id="new-role"
                                    bind:value={newRole}
                                    class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                                >
                                    <option value="manager"
                                        >{t("manager", $language)}</option
                                    >
                                    <option value="gardener"
                                        >{t("gardener", $language)}</option
                                    >
                                </select>
                            {:else}
                                <input
                                    id="new-role"
                                    type="text"
                                    value={t("gardener", $language)}
                                    disabled
                                    class="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                                />
                            {/if}
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
                                newUsername = "";
                                newFullName = "";
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

        <!-- Users List -->
        <div class="bg-card border border-border rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-muted">
                        <tr>
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
                                on:click={() => toggleSort("fullName")}
                            >
                                <div class="flex items-center gap-2">
                                    {t("fullName", $language)}
                                    {#if sortBy === "fullName"}
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
                                    {user.username}
                                </td>
                                <td class="px-6 py-4 text-sm text-foreground">
                                    {user.fullName}
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
                                        {#if user.id === $auth.currentUser?.id && $auth.currentUser?.role === "manager"}
                                            <span
                                                class="text-muted-foreground text-xs"
                                                >-</span
                                            >
                                        {:else}
                                            {#if user.role !== "admin" && !($auth.currentUser?.role === "manager" && user.role === "manager" && user.id !== $auth.currentUser?.id)}
                                                <button
                                                    on:click={() => {
                                                        // Close all other edit forms
                                                        Object.keys(
                                                            editingUser,
                                                        ).forEach((id) => {
                                                            if (
                                                                id !== user.id
                                                            ) {
                                                                editingUser[
                                                                    id
                                                                ] = false;
                                                                editError[id] =
                                                                    "";
                                                                editPassword[
                                                                    id
                                                                ] = "";
                                                                passwordVisibility[
                                                                    id
                                                                ] = false;
                                                            }
                                                        });
                                                        editingUser[user.id] =
                                                            !editingUser[
                                                                user.id
                                                            ];
                                                        if (
                                                            editingUser[user.id]
                                                        ) {
                                                            editUsername[
                                                                user.id
                                                            ] = user.username;
                                                            editFullName[
                                                                user.id
                                                            ] = user.fullName;
                                                            editPassword[
                                                                user.id
                                                            ] = user.password;
                                                            editRole[user.id] =
                                                                user.role;
                                                            editError[user.id] =
                                                                "";
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
                                            {#if user.role === "admin" || ($auth.currentUser?.role === "manager" && user.role === "manager" && user.id !== $auth.currentUser?.id) || ($auth.currentUser?.role === "manager" && user.role !== "gardener" && user.id !== $auth.currentUser?.id)}
                                                <!-- Only show one '-' if both actions are unavailable -->
                                            {:else}
                                                <button
                                                    on:click={() =>
                                                        handleDeleteUser(
                                                            user.id,
                                                        )}
                                                    class="cursor-pointer"
                                                    style="color: var(--status-critical);"
                                                    aria-label="Delete user"
                                                >
                                                    <Trash2 class="w-4 h-4" />
                                                </button>
                                            {/if}
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                            {#if editingUser[user.id]}
                                <tr>
                                    <td
                                        colspan="5"
                                        class="px-6 py-4 bg-muted/30"
                                    >
                                        <form
                                            on:submit|preventDefault={() =>
                                                handleEditUser(user.id)}
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
                                                        for="edit-username-{user.id}"
                                                        class="block text-sm font-medium text-foreground mb-2"
                                                    >
                                                        {t(
                                                            "username",
                                                            $language,
                                                        )}
                                                    </label>
                                                    <input
                                                        id="edit-username-{user.id}"
                                                        type="text"
                                                        bind:value={
                                                            editUsername[
                                                                user.id
                                                            ]
                                                        }
                                                        required
                                                        class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        for="edit-fullname-{user.id}"
                                                        class="block text-sm font-medium text-foreground mb-2"
                                                    >
                                                        {t(
                                                            "fullName",
                                                            $language,
                                                        )}
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
                                                    {#if $auth.currentUser?.role === "admin"}
                                                        <select
                                                            id="edit-role-{user.id}"
                                                            bind:value={
                                                                editRole[
                                                                    user.id
                                                                ]
                                                            }
                                                            class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                                                        >
                                                            <option
                                                                value="manager"
                                                                >{t(
                                                                    "manager",
                                                                    $language,
                                                                )}</option
                                                            >
                                                            <option
                                                                value="gardener"
                                                                >{t(
                                                                    "gardener",
                                                                    $language,
                                                                )}</option
                                                            >
                                                        </select>
                                                    {:else}
                                                        <input
                                                            id="edit-role-{user.id}"
                                                            type="text"
                                                            value={t(
                                                                "gardener",
                                                                $language,
                                                            )}
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
    </div>
</div>
