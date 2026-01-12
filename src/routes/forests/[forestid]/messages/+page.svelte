<script>
  import Message from "$lib/components/Message.svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { theme } from "$lib/stores/theme";
  import { language, t } from "$lib/stores/language";
  import { Search } from "lucide-svelte";

  let { data } = $props();
  let searchQuery = $state("");

  async function handleCreateMessage() {
    await goto(
      resolve("/forests/[forestId]/messages/create", {
        forestId: data.forestId,
      }),
    );
  }

  const filteredMessages = $derived(
    data.messages.data.filter((message) => {
      const query = searchQuery.toLowerCase();
      return (
        (message.message && message.message.toLowerCase().includes(query)) ||
        (message.user &&
          message.user.displayName &&
          message.user.displayName.toLowerCase().includes(query))
      );
    }),
  );
</script>

<div class="messages-page">
  <div class="page-header">
    <h1 class="page-title">{t("messages", $language)}</h1>
    <button
      class="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
      onclick={handleCreateMessage}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      {t("newMessage", $language)}
    </button>
  </div>

  <div
    class="search-box flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground mb-6"
  >
    <Search class="h-4 w-4 text-muted-foreground" />
    <input
      type="text"
      bind:value={searchQuery}
      placeholder={t("searchMessages", $language)}
      class="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
    />
  </div>

  <div class="message-list">
    {#if filteredMessages.length === 0}
      <div class="empty-state">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          />
        </svg>
        <h3>
          {searchQuery
            ? t("noMessagesMatch", $language)
            : t("noMessagesYet", $language)}
        </h3>
        <p>
          {searchQuery
            ? t("tryDifferentSearch", $language)
            : t("beFirstToStart", $language)}
        </p>
      </div>
    {:else}
      {#each filteredMessages as message (`${message.userId}-${message.foodForestID}-${message.createdAt}`)}
        <Message {message} />
      {/each}
    {/if}
  </div>
</div>

<style>
  :root {
    --color-primary: rgba(22, 163, 74, 0.15);
    --color-text-white: #ffffff;
    --color-text-dark: #000000;
    --color-overlay-bg: rgba(255, 255, 255, 0.1);
    --color-overlay-border: rgba(255, 255, 255, 0.2);
    --color-overlay-text: rgba(255, 255, 255, 0.6);
    --color-overlay-placeholder: rgba(255, 255, 255, 0.5);
  }

  .messages-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    min-height: 100vh;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid var(--color-primary);
    gap: 1rem;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-dark);
  }

  /* In dark mode we keep the original white title for contrast */
  :global(.dark) .messages-page .page-title {
    color: var(--color-text-white);
  }

  /* Keep the component-specific spacing for the search container */
  .search-box {
    min-width: 0;
  }

  .message-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    opacity: 0.6;
  }

  .empty-state svg {
    margin-bottom: 1.5rem;
    opacity: 0.5;
  }

  .empty-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  .empty-state p {
    font-size: 1rem;
    margin: 0;
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    .messages-page {
      padding: 1.5rem 1rem;
    }

    .page-header {
      flex-direction: row;
      align-items: center;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
      flex: 1;
    }

    .search-box {
      width: 100%;
    }
  }
</style>
