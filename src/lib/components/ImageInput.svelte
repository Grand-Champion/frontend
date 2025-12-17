<script>
  import { language, t } from "$lib/stores/language";
  let { image, name } = $props();
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
<label for="filePicker">{t("selectImage", $language)}</label> <input type="file" accept="image/*" onchange={change} id="filePicker" />
<img src={image} bind:this={imgElt} class="max-w-[60vh] max-h-[60vh]" />
<input type="hidden" bind:this={imgUrl} name={name || "image"}/>