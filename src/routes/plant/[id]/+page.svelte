<script>
  import { page } from "$app/stores";
  import { plants } from "$lib/plant-data";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import {
    Leaf,
    Trees,
    Flower2,
    Sprout,
    ArrowLeft,
    Thermometer,
    Droplets,
    Sun,
    MessageCircle,
    Send,
  } from "lucide-svelte";

  const categoryConfig = {
    tree: { label: "Trees", icon: Trees, color: "bg-emerald-600" },
    shrub: { label: "Shrubs", icon: Sprout, color: "bg-teal-600" },
    herb: { label: "Herbs", icon: Leaf, color: "bg-lime-600" },
    vegetable: { label: "Vegetables", icon: Flower2, color: "bg-amber-600" },
  };

  let plantId = parseInt($page.params.id);
  let plant = plants.find((p) => p.id === plantId);

  let comments = [];
  let commentText = "";

  function calculateStatus(current, optimal) {
    let issueCount = 0;
    let criticalCount = 0;

    const tempDiff = Math.max(
      optimal.temperature.min - current.temperature,
      current.temperature - optimal.temperature.max,
      0,
    );
    if (tempDiff > 0) {
      if (tempDiff > 5) criticalCount++;
      else issueCount++;
    }

    const humidityDiff = Math.max(
      optimal.humidity.min - current.humidity,
      current.humidity - optimal.humidity.max,
      0,
    );
    if (humidityDiff > 0) {
      if (humidityDiff > 15) criticalCount++;
      else issueCount++;
    }

    const phDiff = Math.max(
      optimal.soilPH.min - current.soilPH,
      current.soilPH - optimal.soilPH.max,
      0,
    );
    if (phDiff > 0) {
      if (phDiff > 0.5) criticalCount++;
      else issueCount++;
    }

    const moistureDiff = Math.max(
      optimal.soilMoisture.min - current.soilMoisture,
      current.soilMoisture - optimal.soilMoisture.max,
      0,
    );
    if (moistureDiff > 0) {
      if (moistureDiff > 20) criticalCount++;
      else issueCount++;
    }

    const sunlightDiff = Math.max(
      optimal.sunlightHours.min - current.sunlightHours,
      current.sunlightHours - optimal.sunlightHours.max,
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
        return "bg-green-500";
      case "attention":
        return "bg-orange-500";
      case "critical":
        return "bg-red-500";
    }
  }

  function formatStage(stage) {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  }

  function generateAdvice(plant) {
    const advice = [];
    const current = plant.currentConditions;
    const optimal = plant.optimalConditions;

    if (current.temperature < optimal.temperature.min) {
      advice.push(
        `Temperature too cold. Move plant to warmer location or provide protection.`,
      );
    } else if (current.temperature > optimal.temperature.max) {
      advice.push(
        `Temperature too hot. Provide shade or increase air circulation.`,
      );
    }

    if (current.humidity < optimal.humidity.min) {
      advice.push(
        `Humidity too low. Mist plant regularly or increase water in surrounding soil.`,
      );
    } else if (current.humidity > optimal.humidity.max) {
      advice.push(
        `Humidity too high. Improve air circulation to prevent fungal disease.`,
      );
    }

    if (current.soilPH < optimal.soilPH.min) {
      advice.push(
        `Soil too acidic. Add lime or alkaline materials to raise pH.`,
      );
    } else if (current.soilPH > optimal.soilPH.max) {
      advice.push(
        `Soil too alkaline. Add sulfur or acidifying materials to lower pH.`,
      );
    }

    if (current.soilMoisture < optimal.soilMoisture.min) {
      advice.push(`Soil too dry. Water more frequently and deeply.`);
    } else if (current.soilMoisture > optimal.soilMoisture.max) {
      advice.push(`Soil too wet. Reduce watering and improve drainage.`);
    }

    if (current.sunlightHours < optimal.sunlightHours.min) {
      advice.push(
        `Not enough sunlight. Move plant to a sunnier location if possible.`,
      );
    } else if (current.sunlightHours > optimal.sunlightHours.max) {
      advice.push(
        `Too much direct sun. Provide partial shade during intense afternoon heat.`,
      );
    }

    return advice.length > 0
      ? advice
      : ["All conditions are optimal. Continue current care routine."];
  }

  function getConditionColor(current, min, max, criticalThreshold) {
    if (current >= min && current <= max) return "text-green-600";
    const midpoint = (min + max) / 2;
    return Math.abs(current - midpoint) > criticalThreshold
      ? "text-red-600"
      : "text-orange-600";
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
</script>

{#if plant}
  <div class="bg-background">
    <div class="max-w-5xl mx-auto px-6 py-8">
      <!-- Back button -->
      <button
        onclick={goBack}
        class="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft class="h-4 w-4" />
        Back
      </button>

      <!-- Header -->
      <div class="mb-8">
        <div
          class="mb-3 inline-block px-3 py-1 rounded text-sm font-semibold {categoryConfig[
            plant.category
          ].color} text-white"
        >
          {categoryConfig[plant.category].label}
        </div>
        <h1 class="text-4xl font-bold text-foreground mb-2">{plant.name}</h1>
        <p class="text-xl italic text-muted-foreground">
          {plant.scientificName}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Image -->
          <div
            class="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted"
          >
            <img
              src={plant.image || "/placeholder.svg"}
              alt={plant.name}
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Description -->
          <div class="bg-card border border-border rounded-xl p-6">
            <h2 class="text-xl font-semibold text-card-foreground mb-3">
              About
            </h2>
            <p class="text-muted-foreground leading-relaxed">
              {plant.description}
            </p>
          </div>

          <!-- Basic Info -->
          <div class="bg-card border border-border rounded-xl p-6">
            <h2 class="text-xl font-semibold text-card-foreground mb-4">
              Growing Information
            </h2>
            <div class="space-y-3">
              <div class="flex justify-between py-2 border-b border-border">
                <span class="text-muted-foreground">Harvest Season</span>
                <span class="font-medium text-card-foreground"
                  >{plant.harvestSeason}</span
                >
              </div>
              <div class="flex justify-between py-2 border-b border-border">
                <span class="text-muted-foreground">Sun Requirement</span>
                <span class="font-medium text-card-foreground"
                  >{plant.sunRequirement}</span
                >
              </div>
              <div class="flex justify-between py-2 border-b border-border">
                <span class="text-muted-foreground">Water Needs</span>
                <span class="font-medium text-card-foreground"
                  >{plant.waterNeeds}</span
                >
              </div>
              <div class="flex justify-between py-2 border-b border-border">
                <span class="text-muted-foreground">Mature Height</span>
                <span class="font-medium text-card-foreground"
                  >{plant.height}</span
                >
              </div>
              <div class="flex justify-between py-2">
                <span class="text-muted-foreground">Maintenance Level</span>
                <span class="font-medium text-card-foreground capitalize"
                  >{plant.maintenance}</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Overall Status -->
          <div
            class="rounded-xl p-6 {calculateStatus(
              plant.currentConditions,
              plant.optimalConditions,
            ) === 'good'
              ? 'bg-green-50 border border-green-200'
              : calculateStatus(
                    plant.currentConditions,
                    plant.optimalConditions,
                  ) === 'attention'
                ? 'bg-orange-50 border border-orange-200'
                : 'bg-red-50 border border-red-200'}"
          >
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-card-foreground">
                Overall Status
              </h2>
              <div
                class="px-3 py-1 rounded-lg text-sm font-semibold {getStatusColor(
                  calculateStatus(
                    plant.currentConditions,
                    plant.optimalConditions,
                  ),
                )} text-white"
              >
                {calculateStatus(
                  plant.currentConditions,
                  plant.optimalConditions,
                ) === "good"
                  ? "Optimal"
                  : calculateStatus(
                        plant.currentConditions,
                        plant.optimalConditions,
                      ) === "attention"
                    ? "Needs Attention"
                    : "Critical"}
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white/50 rounded-lg p-3">
                <p class="text-sm text-muted-foreground mb-1">Current Stage</p>
                <p class="text-lg font-semibold capitalize">
                  {formatStage(plant.currentConditions.stage)}
                </p>
              </div>
              <div class="bg-white/50 rounded-lg p-3">
                <p class="text-sm text-muted-foreground mb-1">Harvest In</p>
                <p class="text-lg font-semibold">
                  {plant.currentConditions.harvestDays === 0
                    ? "Ready"
                    : `${plant.currentConditions.harvestDays} days`}
                </p>
              </div>
            </div>
          </div>

          <!-- Current Conditions -->
          <div class="bg-card border border-border rounded-xl p-6">
            <h2 class="text-xl font-semibold text-card-foreground mb-4">
              Current Conditions
            </h2>
            <div class="space-y-3">
              <div
                class="flex items-center justify-between rounded-lg bg-muted p-4"
              >
                <div class="flex items-center gap-3">
                  <Thermometer class="h-5 w-5 text-muted-foreground" />
                  <span class="font-medium">Temperature</span>
                </div>
                <span
                  class="text-lg font-semibold {getConditionColor(
                    plant.currentConditions.temperature,
                    plant.optimalConditions.temperature.min,
                    plant.optimalConditions.temperature.max,
                    5,
                  )}"
                >
                  {plant.currentConditions.temperature}°C
                </span>
              </div>

              <div
                class="flex items-center justify-between rounded-lg bg-muted p-4"
              >
                <div class="flex items-center gap-3">
                  <Droplets class="h-5 w-5 text-muted-foreground" />
                  <span class="font-medium">Humidity</span>
                </div>
                <span
                  class="text-lg font-semibold {getConditionColor(
                    plant.currentConditions.humidity,
                    plant.optimalConditions.humidity.min,
                    plant.optimalConditions.humidity.max,
                    15,
                  )}"
                >
                  {plant.currentConditions.humidity}%
                </span>
              </div>

              <div
                class="flex items-center justify-between rounded-lg bg-muted p-4"
              >
                <div class="flex items-center gap-3">
                  <span class="font-medium">Soil pH</span>
                </div>
                <span
                  class="text-lg font-semibold {getConditionColor(
                    plant.currentConditions.soilPH,
                    plant.optimalConditions.soilPH.min,
                    plant.optimalConditions.soilPH.max,
                    0.5,
                  )}"
                >
                  {plant.currentConditions.soilPH.toFixed(1)}
                </span>
              </div>

              <div
                class="flex items-center justify-between rounded-lg bg-muted p-4"
              >
                <div class="flex items-center gap-3">
                  <Droplets class="h-5 w-5 text-muted-foreground" />
                  <span class="font-medium">Soil Moisture</span>
                </div>
                <span
                  class="text-lg font-semibold {getConditionColor(
                    plant.currentConditions.soilMoisture,
                    plant.optimalConditions.soilMoisture.min,
                    plant.optimalConditions.soilMoisture.max,
                    20,
                  )}"
                >
                  {plant.currentConditions.soilMoisture}%
                </span>
              </div>

              <div
                class="flex items-center justify-between rounded-lg bg-muted p-4"
              >
                <div class="flex items-center gap-3">
                  <Sun class="h-5 w-5 text-muted-foreground" />
                  <span class="font-medium">Sunlight</span>
                </div>
                <span
                  class="text-lg font-semibold {getConditionColor(
                    plant.currentConditions.sunlightHours,
                    plant.optimalConditions.sunlightHours.min,
                    plant.optimalConditions.sunlightHours.max,
                    2,
                  )}"
                >
                  {plant.currentConditions.sunlightHours}h/day
                </span>
              </div>
            </div>
          </div>

          <!-- Care Advice -->
          <div class="bg-card border border-border rounded-xl p-6">
            <h2 class="text-xl font-semibold text-card-foreground mb-4">
              Care Advice
            </h2>
            <div
              class="space-y-3 rounded-lg bg-blue-50 border border-blue-200 p-4"
            >
              {#each generateAdvice(plant) as advice}
                <p class="text-sm text-blue-900 leading-relaxed">{advice}</p>
              {/each}
            </div>
          </div>

          <!-- Comments -->
          <div class="bg-card border border-border rounded-xl p-6">
            <div class="flex items-center gap-2 mb-4">
              <MessageCircle class="h-5 w-5" />
              <h2 class="text-xl font-semibold text-card-foreground">
                Comments ({comments.length})
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
                placeholder="Add a comment..."
                class="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onclick={addComment}
                class="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
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
      <button onclick={() => goto("/")} class="text-primary hover:underline">
        Go back to map
      </button>
    </div>
  </div>
{/if}
