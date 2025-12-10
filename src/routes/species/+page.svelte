<script>
  import SpeciesList from '$lib/components/species-list.svelte'
  
  export let data;
</script>

<SpeciesList forestData={data.forestData} />
