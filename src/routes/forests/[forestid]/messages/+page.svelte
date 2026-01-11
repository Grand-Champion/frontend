<script>
  import Message from "$lib/components/Message.svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { theme } from "$lib/stores/theme";

  let { data } = $props();

  async function handleCreateMessage() {
    await goto(
      resolve("/forests/[forestId]/messages/create", {
        forestId: data.forestId,
      }),
    );
  }
</script>

<div class="messages-page">
  <div class="page-header">
    <h1 class="page-title">Messages</h1>
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
      New Message
    </button>
  </div>

  <div class="message-list">
    {#if data.messages.data.length === 0}
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
        <h3>No messages yet</h3>
        <p>Be the first to start a conversation</p>
      </div>
    {:else}
      {#each data.messages.data as message (`${message.userId}-${message.foodForestID}-${message.createdAt}`)}
        <Message {message} />
      {/each}
    {/if}
  </div>
</div>

<style>
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
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid rgba(22, 163, 74, 0.15);
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    color: #ffffff;
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
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
    }
  }
</style>
