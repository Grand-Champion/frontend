<script>
    import Message from '../../lib/components/Message.svelte';
    let { data } = $props();
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';

    console.log('Hoi');
    
    async function handleCreateMessage() {
        await goto(resolve('/messages/create'));
    }
</script>

{#each data.messages.data as message (`${message.userId}-${message.foodForestID}-${message.createdAt}`)}
  <Message {message} />
{/each}

<button class="create-button" onclick={handleCreateMessage}>
  Create message
</button>

<style>
  .create-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  padding: 0.65rem 1.25rem;
  margin-bottom: 1.5rem;

  font-size: 0.95rem;
  font-weight: 600;

  color: #ffffff;
  background: linear-gradient(135deg, #16a34a, #15803d);

  border: none;
  border-radius: 10px;

  cursor: pointer;

  box-shadow:
    0 6px 16px rgba(22, 163, 74, 0.25),
    0 1px 2px rgba(0, 0, 0, 0.08);

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.create-button:hover {
  transform: translateY(-1px);
  box-shadow:
    0 10px 24px rgba(22, 163, 74, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.1);
}

.create-button:active {
  transform: translateY(0);
  box-shadow:
    0 4px 12px rgba(22, 163, 74, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.1);
}

.create-button:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px rgba(22, 163, 74, 0.35),
    0 6px 16px rgba(22, 163, 74, 0.25);
}
</style>