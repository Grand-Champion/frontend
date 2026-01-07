<script lang="ts">
    export interface MessageData {
    userId: number;
    message: string;
    createdAt: string;
  }
    const { message }: { message: MessageData } = $props();
</script>

<article class="message-card">
  <header class="message-header">
    <span class="author">User #{message.userId}</span>
    <time class="date">
      {new Date(message.createdAt).toLocaleDateString()}
    </time>
  </header>

  <p class="message-body">
    {message.message}
  </p>

</article>

<style>
  .message-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border: 1px solid #eaeaea;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .message-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
    color: #666;
  }

  .author {
    font-weight: 600;
    color: #333;
  }

  .date {
    font-style: italic;
  }

  .message-body {
    font-size: 1rem;
    line-height: 1.6;
    color: #222;
    white-space: pre-wrap;
  }
</style>