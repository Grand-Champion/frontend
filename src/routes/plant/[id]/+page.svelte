<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { language, t } from "$lib/stores/language";
  import {
    Leaf,
    Trees,
    Flower2,
    Sprout,
    ArrowLeft,
    Thermometer,
    FlaskConical,
    Droplet,
    Droplets,
    Sun,
    MessageCircle,
    Send,
  } from "lucide-svelte";
  import { PUBLIC_API_URL } from '$env/static/public';
    import { jwt } from "$lib/stores/jwt.js";
    import { getPayload } from "$lib/Auth.js";

  export let data;

  //Pak plant, species en conditions uit de API data
  $: plant = data.plantData?.data;
  $: species = plant?.species;
  $: conditions = plant?.conditions[0] ?? {};

  // Gebruik backend species types (Tree, Shrub, Plant)
  $: categoryConfig = {
    Tree: {
      label: t("trees", $language),
      icon: Trees,
      color: "var(--category-tree)",
    },
    Shrub: {
      label: t("shrubs", $language),
      icon: Sprout,
      color: "var(--category-shrub)",
    },
    herb: {
      label: t("herbs", $language),
      icon: Leaf,
      color: "var(--category-herb)",
    },
    vegetable: {
      label: t("vegetables", $language),
      icon: Flower2,
      color: "var(--category-vegetable)",
    },
  };

  let comments = [];
  let commentText = "";
  let overallStatus = null;
  let overallColor = null;

  function formatLastUpdate(date) {
  if (!date) return "Unknown";
  return date.toLocaleString();
}

  function calculateStatus() {
    if (!conditions || !species) return "critical";

    let issueCount = 0;
    let criticalCount = 0;

    const tempDiff = Math.max(
      species.minTemperature - conditions.temperature,
      conditions.temperature - species.maxTemperature,
      0,
    );
    if (tempDiff > 0) {
      if (tempDiff > 5) criticalCount++;
      else issueCount++;
    }

    const humidityDiff = Math.max(
      species.minHumidity - conditions.humidity,
      conditions.humidity - species.maxHumidity,
      0,
    );
    if (humidityDiff > 0) {
      if (humidityDiff > 15) criticalCount++;
      else issueCount++;
    }

    const phDiff = Math.max(
      species.minSoilPH - conditions.soilPH,
      conditions.soilPH - species.maxSoilPH,
      0,
    );
    if (phDiff > 0) {
      if (phDiff > 0.5) criticalCount++;
      else issueCount++;
    }

    const moistureDiff = Math.max(
      species.minSoilMoisture - conditions.soilMoisture,
      conditions.soilMoisture - species.maxSoilMoisture,
      0,
    );
    if (moistureDiff > 0) {
      if (moistureDiff > 20) criticalCount++;
      else issueCount++;
    }

    const sunlightDiff = Math.max(
      species.minSunlight - conditions.sunlight,
      conditions.sunlight - species.maxSunlight,
      0,
    );
    if (sunlightDiff > 0) {
      if (sunlightDiff > 2) criticalCount++;
      else issueCount++;
    }

    if (criticalCount >= 2) return "critical";
    if (criticalCount >= 1 || issueCount >= 2) return "attention";
    return "good";
  }

  function getStatusColor(status) {
    switch (status) {
      case "good":
        return "var(--status-good)";
      case "attention":
        return "var(--status-attention)";
      case "critical":
        return "var(--status-critical)";
    }
  }

  const statusBg = (color) => `color-mix(in oklch, ${color} 12%, transparent)`;
  const statusBorder = (color) =>
    `color-mix(in oklch, ${color} 32%, transparent)`;

  function formatStage(stage) {
    if (!stage) return "Unknown";
    return stage;
  }

  function getMaintenanceLabel(level) {
    if (!level) return "Medium";
    return level;
  }

  function generateAdvice() {
    if (!conditions || !species) return [t("adviceOptimal", $language)];

    const advice = [];

    if (conditions.temperature < species.minTemperature) {
      advice.push(t("adviceTempTooCold", $language));
    } else if (conditions.temperature > species.maxTemperature) {
      advice.push(t("adviceTempTooHot", $language));
    }

    if (conditions.humidity < species.minHumidity) {
      advice.push(t("adviceHumidityTooLow", $language));
    } else if (conditions.humidity > species.maxHumidity) {
      advice.push(t("adviceHumidityTooHigh", $language));
    }

    if (conditions.soilPH < species.minSoilPH) {
      advice.push(t("adviceSoilTooAcidic", $language));
    } else if (conditions.soilPH > species.maxSoilPH) {
      advice.push(t("adviceSoilTooAlkaline", $language));
    }

    if (conditions.soilMoisture < species.minSoilMoisture) {
      advice.push(t("adviceSoilTooDry", $language));
    } else if (conditions.soilMoisture > species.maxSoilMoisture) {
      advice.push(t("adviceSoilTooWet", $language));
    }

    if (conditions.sunlight < species.minSunlight) {
      advice.push(t("adviceNotEnoughSun", $language));
    } else if (conditions.sunlight > species.maxSunlight) {
      advice.push(t("adviceTooMuchSun", $language));
    }

    return advice.length > 0 ? advice : [t("adviceOptimal", $language)];
  }

  function getConditionColor(current, min, max, criticalThreshold) {
    if (current >= min && current <= max) return getStatusColor("good");
    const midpoint = (min + max) / 2;
    return Math.abs(current - midpoint) > criticalThreshold
      ? getStatusColor("critical")
      : getStatusColor("attention");
  }

  function addComment() {
    if (commentText.trim()) {
      comments = [...comments, commentText];
      commentText = "";
    }
  }

  function goBack() {
    if (browser && window.history.length > 1) {
      window.history.back();
    } else {
      goto("/");
    }
  }

  $: if (plant) {
    overallStatus = calculateStatus(
      plant.currentConditions,
      plant.optimalConditions,
    );
    overallColor = getStatusColor(overallStatus);
  } else {
    overallStatus = null;
    overallColor = null;
  }

  $: pageTitle = `${plant?.name || "Plant"} - Food Forest`;

  async function deletePlant(){
    if(confirm("Weet je het zeker?")){
      const headers = new Headers();
      headers.set("Authorization", $jwt);
      const request = await fetch(PUBLIC_API_URL + "/forests/api/v1/plants/" + plant.id, {
        body: data,
        method: "DELETE",
        headers
      });
      if(!request.ok){
        alert(request.statusText);
      } else {
        goBack();
      }
    }

  }

</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

{#if plant}
  <div class="bg-background">
    <div class="max-w-5xl mx-auto px-6 py-8">
      <!-- Back button -->
      <button
        onclick={goBack}
        class="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft class="h-4 w-4" />
        {t("back", $language)}
      </button>
      <div class="float-right flex gap-6">
        {#if (getPayload($jwt).id === data.forestData.data.ownerId || getPayload($jwt).role === "admin" )}
          <button
            onclick={goto("/plant/"+ plant.id+ "/edit")}
            class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            {t("edit", $language)}
          </button>
          
          <button
            onclick={deletePlant}
            class="bg-[red] text-primary-foreground px-4 py-2 rounded-lg hover:bg-[#f00a] transition-colors cursor-pointer"
          >
            {t("delete", $language)}
          </button>
        {/if}
      </div>

      <!-- Header -->
      <div class="mb-8">
        <div
          class="mb-3 inline-block px-3 py-1 rounded text-sm font-semibold text-white"
          style="background-color: {categoryConfig[
            species?.type?.toLowerCase() || 'tree'
          ]?.color || 'var(--category-tree)'}"
        >
          {categoryConfig[species?.type || "Tree"].label}
        </div>
        <h1 class="text-4xl font-bold text-foreground mb-2">
          {species?.name || "Unknown Plant"}
        </h1>
        <p class="text-xl italic text-muted-foreground">
          {species?.scientificName || ""}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Image -->
          <div
            class="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-muted"
          >
            <img
              src={plant?.image || species?.image || "/placeholder.svg"}
              alt={species?.name || "Plant"}
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Description -->
          <div class="bg-card border border-border rounded-xl p-6">
            <h2 class="text-xl font-semibold text-card-foreground mb-3">
              {t("about", $language)}
            </h2>
            <p class="text-muted-foreground leading-relaxed">
              {species?.description || "No description available"}
            </p>
          </div>

          <!-- Basic Info -->
          <div class="bg-card border border-border rounded-xl p-6">
            <h2 class="text-xl font-semibold text-card-foreground mb-4">
              {t("growingInformation", $language)}
            </h2>
            <div class="space-y-3">
              <div class="flex justify-between py-2 border-b border-border">
                <span class="text-muted-foreground"
                  >{t("harvestSeason", $language)}</span
                >
                <span class="font-medium text-card-foreground"
                  >{species?.harvestSeason || "Unknown"}</span
                >
              </div>
              <div class="flex justify-between py-2 border-b border-border">
                <span class="text-muted-foreground"
                  >{t("sunRequirement", $language)}</span
                >
                <span class="font-medium text-card-foreground"
                  >{species?.sunRequirement || "Unknown"}</span
                >
              </div>
              <div class="flex justify-between py-2 border-b border-border">
                <span class="text-muted-foreground"
                  >{t("waterNeeds", $language)}</span
                >
                <span class="font-medium text-card-foreground"
                  >{species?.waterNeeds || "Unknown"}</span
                >
              </div>
              <div class="flex justify-between py-2 border-b border-border">
                <span class="text-muted-foreground"
                  >{t("matureHeight", $language)}</span
                >
                <span class="font-medium text-card-foreground"
                  >{plant?.height || "N/A"}</span
                >
              </div>
              <div class="flex justify-between py-2">
                <span class="text-muted-foreground"
                  >{t("maintenanceLevel", $language)}</span
                >
                <span class="font-medium text-card-foreground capitalize"
                  >{getMaintenanceLabel(species?.maintenance)}</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Overall Status -->
          <div
            class="rounded-xl p-6 border"
            style={`--status-color: ${overallColor || "var(--status-good)"}; background-color: color-mix(in oklch, var(--status-color) 12%, transparent); border-color: color-mix(in oklch, var(--status-color) 32%, transparent);`}
          >
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-foreground">
                {t("overallStatus", $language)}
              </h2>
              <div
                class="px-3 py-1 rounded-lg text-sm font-semibold text-white"
                style={`background-color: ${overallColor || "var(--status-good)"};`}
              >
                {overallStatus === "good"
                  ? t("optimal", $language)
                  : overallStatus === "attention"
                    ? t("needsAttention", $language)
                    : t("critical", $language)}
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-background/50 rounded-lg p-3 border border-border">
                <p class="text-sm text-muted-foreground mb-1">
                  {t("currentStage", $language)}
                </p>
                <p class="text-lg font-semibold capitalize text-foreground">
                  {formatStage(plant?.stage)}
                </p>
              </div>
              <div class="bg-background/50 rounded-lg p-3 border border-border">
                <p class="text-sm text-muted-foreground mb-1">
                  {t("harvestIn", $language)}
                </p>
                <p class="text-lg font-semibold text-foreground">
                  {plant?.harvestPrediction || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          <!-- Current Conditions -->
          <div class="bg-card border border-border rounded-xl p-6">
            <h2 class="text-xl font-semibold text-card-foreground mb-4">
              {t("currentConditions", $language)}
            </h2>
            <!-- Last sensor update -->
            <p class="mb-4 text-sm text-muted-foreground">
              {t("lastUpdated", $language) || "Last updated"}:
                <span class="font-medium text-foreground">
                  {formatLastUpdate(new Date(conditions.createdAt))}
                </span>
            </p>
            <div class="space-y-3">
              <div
                class="flex items-center justify-between rounded-lg bg-muted p-4"
              >
                <div class="flex items-center gap-3">
                  <Thermometer class="h-5 w-5 text-muted-foreground" />
                  <span class="font-medium">{t("temperature", $language)}</span>
                </div>
                <span
                  class="text-lg font-semibold"
                  style={`color: ${getConditionColor(
                    plant.conditions[0]?.temperature ?? 0,
                    plant.species?.minTemperature ?? 0,
                    plant.species?.maxTemperature ?? 0,
                    5,
                  )}`}
                >
                  {plant.conditions[0]?.temperature ?? "—"}°C
                </span>
              </div>

              <div
                class="flex items-center justify-between rounded-lg bg-muted p-4"
              >
                <div class="flex items-center gap-3">
                  <Droplet class="h-5 w-5 text-muted-foreground" />
                  <span class="font-medium">{t("humidity", $language)}</span>
                </div>
                <span
                  class="text-lg font-semibold"
                  style={`color: ${getConditionColor(
                    plant.conditions[0]?.humidity ?? 0,
                    plant.species?.minHumidity ?? 0,
                    plant.species?.maxHumidity ?? 0,
                    15,
                  )}`}
                >
                  {plant.conditions[0]?.humidity ?? "—"}%
                </span>
              </div>

              <div
                class="flex items-center justify-between rounded-lg bg-muted p-4"
              >
                <div class="flex items-center gap-3">
                  <FlaskConical class="h-5 w-5 text-muted-foreground" />
                  <span class="font-medium">{t("soilPH", $language)}</span>
                </div>
                <span
                  class="text-lg font-semibold"
                  style={`color: ${getConditionColor(
                    plant.conditions[0]?.soilPH ?? 0,
                    plant.species?.minSoilPH ?? 0,
                    plant.species?.maxSoilPH ?? 0,
                    0.5,
                  )}`}
                >
                  {plant.conditions[0]?.soilPH ?? "—"}
                </span>
              </div>

              <div
                class="flex items-center justify-between rounded-lg bg-muted p-4"
              >
                <div class="flex items-center gap-3">
                  <Droplets class="h-5 w-5 text-muted-foreground" />
                  <span class="font-medium">{t("soilMoisture", $language)}</span
                  >
                </div>
                <span
                  class="text-lg font-semibold"
                  style={`color: ${getConditionColor(
                    plant.conditions[0]?.soilMoisture ?? 0,
                    plant.species?.minSoilMoisture ?? 0,
                    plant.species?.maxSoilMoisture ?? 0,
                    20,
                  )}`}
                >
                  {plant.conditions[0]?.soilMoisture ?? "—"}%
                </span>
              </div>

              <div
                class="flex items-center justify-between rounded-lg bg-muted p-4"
              >
                <div class="flex items-center gap-3">
                  <Sun class="h-5 w-5 text-muted-foreground" />
                  <span class="font-medium">{t("sunlight", $language)}</span>
                </div>
                <span
                  class="text-lg font-semibold"
                  style={`color: ${getConditionColor(
                    plant.conditions[0]?.sunlight ?? 0,
                    plant.species?.minSunlight ?? 0,
                    plant.species?.maxSunlight ?? 0,
                    2,
                  )}`}
                >
                  {plant.conditions[0]?.sunlight ?? "—"}h/day
                </span>
              </div>
            </div>
          </div>

          <!-- Care Advice -->
          <div class="bg-card border border-border rounded-xl p-6">
            <h2 class="text-xl font-semibold text-card-foreground mb-4">
              {t("careAdvice", $language)}
            </h2>
            <div
              class="space-y-3 rounded-lg border p-4"
              style="background-color: color-mix(in oklch, var(--primary) 12%, transparent); border-color: color-mix(in oklch, var(--primary) 32%, transparent);"
            >
              {#each generateAdvice() as advice}
                <p class="text-sm text-foreground leading-relaxed">{advice}</p>
              {/each}
            </div>
          </div>

          <!-- Comments -->
          <div class="bg-card border border-border rounded-xl p-6">
            <div class="flex items-center gap-2 mb-4">
              <MessageCircle class="h-5 w-5" />
              <h2 class="text-xl font-semibold text-card-foreground">
                {t("comments", $language)} ({comments.length})
              </h2>
            </div>
            <div class="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {#each comments as comment}
                <div class="rounded-lg bg-muted p-3">
                  <p class="text-sm text-muted-foreground">{comment}</p>
                </div>
              {/each}
            </div>
            <div class="flex gap-2">
              <input
                type="text"
                bind:value={commentText}
                onkeypress={(e) => e.key === "Enter" && addComment()}
                placeholder={t("addComment", $language)}
                class="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onclick={addComment}
                class="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Send class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="bg-background py-20">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-foreground mb-2">Plant Not Found</h1>
      <button
        onclick={() => goto("/")}
        class="text-primary hover:underline cursor-pointer"
      >
        Go back to map
      </button>
    </div>
  </div>
{/if}
