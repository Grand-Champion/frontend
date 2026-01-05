<script>
    import Message from '../../lib/components/Message.svelte';
    let { data } = $props();
    console.log('Hoi');
</script>

{#each data.messages.data as message (`${message.userId}-${message.foodForestID}-${message.createdAt}`)}
  <Message {message} />
{/each}