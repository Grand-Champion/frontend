<script lang="ts">
    import { theme } from "$lib/stores/theme";

    export interface MessageData {
    message: string;
    createdAt: string;
    user: {
      displayName?: string;
  }
  }

    const { message }: { message: MessageData } = $props();
</script>

<article class="message-card">
  <header class="message-header">
    <span class="author">{message.user.displayName}</span>
    <time class="date">
      {new Date(message.createdAt).toLocaleDateString()}
    </time>
  </header>

  <p class="message-body">
    {message.message}
  </p>
</article>

{#if $theme === "light"}
  <style>
    .message-card {
      background: #ffffff;
      border: 1px solid #eaeaea;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .message-header {
      color: #666;
    }

    .author {
      color: #333;
    }

    .message-body {
      color: #222;
    }
  </style>
{:else}
  <style>
    .message-card {
      background: #032309;
      border: 1px solid rgba(34, 197, 94, 0.15);
      box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.7),
        inset 0 1px 0 rgba(255, 255, 255, 0.02);
    }

    .message-card:hover {
      box-shadow:
        0 14px 38px rgba(0, 0, 0, 0.8),
        inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    .message-header {
      color: #9ca3af;
    }

    .author {
      color: #d1fae5;
    }

    .date {
      color: #6ee7b7;
    }

    .message-body {
      color: #ecfdf5;
    }
  </style>
{/if}

<style>
  .message-card {
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .message-card:hover {
    transform: translateY(-2px);
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
  }

  .author {
    font-weight: 600;
  }

  .date {
    font-style: italic;
  }

  .message-body {
    font-size: 1rem;
    line-height: 1.6;
    white-space: pre-wrap;
  }
</style>