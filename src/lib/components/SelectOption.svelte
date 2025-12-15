<script>
    const {value, currentValue, name} = $props();
</script>
<option value="{value}" selected={currentValue == value} class="bg-card">{name ?? value}</option>