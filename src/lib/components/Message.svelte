<script lang="ts">
  export interface MessageData {
    message: string;
    image: string;
    createdAt: string;
    user: {
      displayName?: string;
    };
  }

  const { message }: { message: MessageData } = $props();
</script>

<article
  class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
>
  <div class="message-header">
    <div class="author-info">
      <div
        class="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold text-base"
      >
        {message.user.displayName?.charAt(0).toUpperCase() || "U"}
      </div>
      <span class="text-card-foreground font-semibold text-base"
        >{message.user.displayName || "Unknown User"}</span
      >
    </div>
    <time class="text-muted-foreground text-sm font-medium">
      {new Date(message.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}
    </time>
  </div>

  <p
    class="text-card-foreground leading-relaxed whitespace-pre-wrap break-words"
  >
    {message.message}
  </p>

  <img src={message.image} alt="" />
</article>

<style>
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border);
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
</style>
