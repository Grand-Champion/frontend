<script>
  import { language, t } from "$lib/stores/language";
  let { image, name } = $props();
  let imgElt;
  let imgUrl;
  let showPreview = $state(false);
  async function change(e) {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;
    showPreview = true;
    fileReader.onload = () => {
      imgElt.src = fileReader.result;
      imgUrl.value = fileReader.result;
    };
    await fileReader.readAsDataURL(file);
  }
</script>

<label for="filePicker" class="font-semibold mb-2 block"
  >{t("selectImage", $language)}</label
>
<input
  type="file"
  accept="image/*"
  onchange={change}
  id="filePicker"
  class="px-3 py-2 border border-border rounded-lg bg-background text-foreground cursor-pointer file:px-3 file:py-1 file:bg-primary file:text-primary-foreground file:border-0 file:rounded file:font-medium file:cursor-pointer hover:file:bg-primary/90"
/>

{#if showPreview}
  <img
    src={image}
    bind:this={imgElt}
    alt="Selected image preview"
    class="max-w-[60vh] max-h-[60vh] mt-4"
  />
{/if}
