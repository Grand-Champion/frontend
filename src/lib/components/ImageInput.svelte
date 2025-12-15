<script>
  let { image } = $props();
  let imgElt;
  let imgUrl;
  async function change(e){
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if(!file) return;
    fileReader.onload = ()=>{
      imgElt.src = fileReader.result;
      imgUrl.value = fileReader.result;
    }
    await fileReader.readAsDataURL(file);
  }
</script>
<input type="file" accept="image/*" onchange={change} />
<img src={image} bind:this={imgElt} class="max-w-[60vh] max-h-[60vh]" />
<input type="hidden" bind:this={imgUrl} name="image"/>