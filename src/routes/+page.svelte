<script>
  import { language, t } from "$lib/stores/language";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  export let data;
  $: forestId = data.forestId;
  if(browser) goto("/forests/"+(forestId ?? 1));

  $: pageTitle = `${t("home", $language)} - Food Forest`;
</script>
