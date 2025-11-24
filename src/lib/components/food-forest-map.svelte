<script>
  import { derived } from 'svelte/store'
  import { plants } from '$lib/plant-data'
  import { Leaf, Trees, Flower2, Sprout, X, ChevronDown, Droplets, Sun, Thermometer, MessageCircle, Send } from 'lucide-svelte'
  import { selectedCategories, selectedStatus } from '$lib/stores/filters'

  const categoryConfig = {
    tree: { label: "Trees", icon: Trees, color: "bg-emerald-600" },
    shrub: { label: "Shrubs", icon: Sprout, color: "bg-teal-600" },
    herb: { label: "Herbs", icon: Leaf, color: "bg-lime-600" },
    vegetable: { label: "Vegetables", icon: Flower2, color: "bg-amber-600" },
  }

  const statusConfig = {
    good: { label: "Good" },
    attention: { label: "Needs Attention" },
    critical: { label: "Critical" },
  }

  let selectedPlant = $state(null)
  let speciesOpen = $state(true)
  let maintenanceOpen = $state(true)
  let hoveredPlantId = $state(null)
  let comments = $state({})
  let commentText = $state('')

  function calculateStatus(current, optimal) {
    let issueCount = 0
    let criticalCount = 0

    const tempDiff = Math.max(optimal.temperature.min - current.temperature, current.temperature - optimal.temperature.max, 0)
    if (tempDiff > 0) {
      if (tempDiff > 5) criticalCount++
      else issueCount++
    }

    const humidityDiff = Math.max(optimal.humidity.min - current.humidity, current.humidity - optimal.humidity.max, 0)
    if (humidityDiff > 0) {
      if (humidityDiff > 15) criticalCount++
      else issueCount++
    }

    const phDiff = Math.max(optimal.soilPH.min - current.soilPH, current.soilPH - optimal.soilPH.max, 0)
    if (phDiff > 0) {
      if (phDiff > 0.5) criticalCount++
      else issueCount++
    }

    const moistureDiff = Math.max(optimal.soilMoisture.min - current.soilMoisture, current.soilMoisture - optimal.soilMoisture.max, 0)
    if (moistureDiff > 0) {
      if (moistureDiff > 20) criticalCount++
      else issueCount++
    }

    const sunlightDiff = Math.max(optimal.sunlightHours.min - current.sunlightHours, current.sunlightHours - optimal.sunlightHours.max, 0)
    if (sunlightDiff > 0) {
      if (sunlightDiff > 2) criticalCount++
      else issueCount++
    }

    if (criticalCount >= 2) return "critical"
    if (criticalCount >= 1 || issueCount >= 2) return "attention"
    return "good"
  }

  function getStatusColor(status) {
    switch (status) {
      case "good": return "bg-green-500"
      case "attention": return "bg-orange-500"
      case "critical": return "bg-red-500"
    }
  }

  function formatStage(stage) {
    return stage.charAt(0).toUpperCase() + stage.slice(1)
  }

  function generateAdvice(plant) {
    const advice = []
    const current = plant.currentConditions
    const optimal = plant.optimalConditions

    if (current.temperature < optimal.temperature.min) {
      advice.push(`Temperature too cold. Move plant to warmer location or provide protection.`)
    } else if (current.temperature > optimal.temperature.max) {
      advice.push(`Temperature too hot. Provide shade or increase air circulation.`)
    }

    if (current.humidity < optimal.humidity.min) {
      advice.push(`Humidity too low. Mist plant regularly or increase water in surrounding soil.`)
    } else if (current.humidity > optimal.humidity.max) {
      advice.push(`Humidity too high. Improve air circulation to prevent fungal disease.`)
    }

    if (current.soilPH < optimal.soilPH.min) {
      advice.push(`Soil too acidic. Add lime or alkaline materials to raise pH.`)
    } else if (current.soilPH > optimal.soilPH.max) {
      advice.push(`Soil too alkaline. Add sulfur or acidifying materials to lower pH.`)
    }

    if (current.soilMoisture < optimal.soilMoisture.min) {
      advice.push(`Soil too dry. Water more frequently and deeply.`)
    } else if (current.soilMoisture > optimal.soilMoisture.max) {
      advice.push(`Soil too wet. Reduce watering and improve drainage.`)
    }

    if (current.sunlightHours < optimal.sunlightHours.min) {
      advice.push(`Not enough sunlight. Move plant to a sunnier location if possible.`)
    } else if (current.sunlightHours > optimal.sunlightHours.max) {
      advice.push(`Too much direct sun. Provide partial shade during intense afternoon heat.`)
    }

    return advice.length > 0 ? advice : ["All conditions are optimal. Continue current care routine."]
  }

  function toggleCategory(category) {
    selectedCategories.update(categories => {
      if (categories.includes(category)) {
        return categories.filter((c) => c !== category)
      } else {
        return [...categories, category]
      }
    })
  }

  function toggleStatus(status) {
    selectedStatus.update(statuses => {
      if (statuses.includes(status)) {
        return statuses.filter((s) => s !== status)
      } else {
        return [...statuses, status]
      }
    })
  }

  function addComment() {
    if (commentText.trim() && selectedPlant) {
      comments[selectedPlant.id] = [...(comments[selectedPlant.id] || []), commentText]
      commentText = ''
    }
  }

  const filteredPlants = derived(
    [selectedCategories, selectedStatus],
    ([$categories, $statuses]) => {
      return plants.filter((plant) => {
        const status = calculateStatus(plant.currentConditions, plant.optimalConditions)
        return $categories.includes(plant.category) && $statuses.includes(status)
      })
    }
  )

  function getConditionColor(current, min, max, criticalThreshold) {
    if (current >= min && current <= max) return 'text-green-600'
    const midpoint = (min + max) / 2
    return Math.abs(current - midpoint) > criticalThreshold ? 'text-red-600' : 'text-orange-600'
  }
</script>

<div class="flex h-full w-full">
  <!-- Left Sidebar - Filters -->
  <div class="w-64 rounded-none border-y-0 border-l-0 bg-card border-r border-border">
    <div class="p-6">
      <div class="mb-6">
        <button
          onclick={() => (speciesOpen = !speciesOpen)}
          class="flex w-full items-center justify-between text-xl font-semibold text-card-foreground"
        >
          Species
          <ChevronDown class="h-5 w-5 transition-transform {speciesOpen ? 'rotate-180' : ''}" />
        </button>
        {#if speciesOpen}
          <div class="mt-4 space-y-4">
            {#each Object.entries(categoryConfig) as [category, config]}
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={category}
                  checked={$selectedCategories.includes(category)}
                  onchange={() => toggleCategory(category)}
                  class="rounded border-gray-300"
                />
                <label for={category} class="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <config.icon class="h-4 w-4" />
                  {config.label}
                </label>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div>
        <button
          onclick={() => (maintenanceOpen = !maintenanceOpen)}
          class="flex w-full items-center justify-between text-xl font-semibold text-card-foreground"
        >
          Status
          <ChevronDown class="h-5 w-5 transition-transform {maintenanceOpen ? 'rotate-180' : ''}" />
        </button>
        {#if maintenanceOpen}
          <div class="mt-4 space-y-4">
            {#each Object.entries(statusConfig) as [status, config]}
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={status}
                  checked={$selectedStatus.includes(status)}
                  onchange={() => toggleStatus(status)}
                  class="rounded border-gray-300"
                />
                <label for={status} class="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <div class="h-3 w-3 rounded-full {getStatusColor(status)}" aria-hidden="true"></div>
                  {config.label}
                </label>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Center - Map -->
  <div class="relative flex-1 bg-muted">
    <div class="absolute inset-0">
      <img
        src="/images/food-forest-map.jpg"
        alt="Food forest aerial view"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/10"></div>
    </div>
    
    <!-- Plant markers overlay -->
    <div class="absolute inset-0">
      {#each $filteredPlants as plant (plant.id)}
        {@const config = categoryConfig[plant.category]}
        {@const status = calculateStatus(plant.currentConditions, plant.optimalConditions)}
        {@const statusColor = getStatusColor(status)}
        
        <button
          onclick={() => (selectedPlant = plant)}
          onmouseenter={() => (hoveredPlantId = plant.id)}
          onmouseleave={() => (hoveredPlantId = null)}
          class="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full {statusColor} text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl {selectedPlant?.id === plant.id ? 'ring-4 ring-white scale-110' : ''}"
          style="left: {plant.position.x}%; top: {plant.position.y}%;"
          aria-label="View {plant.name}"
        >
          <config.icon class="h-5 w-5" />
        </button>
        
        {#if hoveredPlantId === plant.id}
          <div
            class="absolute rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg whitespace-nowrap pointer-events-none z-50"
            style="left: {plant.position.x}%; top: calc({plant.position.y}% + 30px); transform: translateX(-50%);"
          >
            {plant.name}
          </div>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Right Sidebar - Plant Details -->
  {#if selectedPlant}
    <div class="w-96 rounded-none border-y-0 border-r-0 bg-card border-l border-border overflow-y-auto">
      <div class="p-6">
        <div class="mb-4 flex items-start justify-between">
          <div class="flex-1">
            <div class="mb-2 inline-block px-2 py-1 rounded text-xs font-semibold {categoryConfig[selectedPlant.category].color} text-primary-foreground">
              {categoryConfig[selectedPlant.category].label}
            </div>
            <h2 class="text-2xl font-bold text-card-foreground">{selectedPlant.name}</h2>
            <p class="text-sm italic text-muted-foreground">{selectedPlant.scientificName}</p>
          </div>
          <button onclick={() => (selectedPlant = null)} class="p-2 hover:bg-muted rounded-lg" aria-label="Close details">
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="space-y-6">
          <div class="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={selectedPlant.image || "/placeholder.svg"}
              alt={selectedPlant.name}
              class="w-full h-full object-cover"
            />
          </div>

          <div
            class="rounded-lg p-4 {calculateStatus(selectedPlant.currentConditions, selectedPlant.optimalConditions) === 'good'
              ? 'bg-green-50 border border-green-200'
              : calculateStatus(selectedPlant.currentConditions, selectedPlant.optimalConditions) === 'attention'
                ? 'bg-orange-50 border border-orange-200'
                : 'bg-red-50 border border-red-200'}"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-card-foreground">Overall Status</h3>
              <div class="px-2 py-1 rounded text-xs font-semibold {getStatusColor(calculateStatus(selectedPlant.currentConditions, selectedPlant.optimalConditions))} text-white">
                {calculateStatus(selectedPlant.currentConditions, selectedPlant.optimalConditions) === 'good'
                  ? 'Optimal'
                  : calculateStatus(selectedPlant.currentConditions, selectedPlant.optimalConditions) === 'attention'
                    ? 'Needs Attention'
                    : 'Critical'}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <h3 class="mb-1 text-xs font-semibold text-card-foreground">Current Stage</h3>
              <p class="text-sm text-muted-foreground capitalize">{formatStage(selectedPlant.currentConditions.stage)}</p>
            </div>
            <div>
              <h3 class="mb-1 text-xs font-semibold text-card-foreground">Harvest In</h3>
              <p class="text-sm text-muted-foreground">
                {selectedPlant.currentConditions.harvestDays === 0 ? 'Ready' : `${selectedPlant.currentConditions.harvestDays} days`}
              </p>
            </div>
          </div>

          <div>
            <h3 class="mb-3 text-sm font-semibold text-card-foreground">Current Conditions</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between rounded-lg bg-muted p-3">
                <div class="flex items-center gap-2">
                  <Thermometer class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm font-medium">Temperature</span>
                </div>
                <span class="text-sm font-semibold {getConditionColor(
                  selectedPlant.currentConditions.temperature,
                  selectedPlant.optimalConditions.temperature.min,
                  selectedPlant.optimalConditions.temperature.max,
                  5
                )}">
                  {selectedPlant.currentConditions.temperature}°C
                </span>
              </div>

              <div class="flex items-center justify-between rounded-lg bg-muted p-3">
                <div class="flex items-center gap-2">
                  <Droplets class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm font-medium">Humidity</span>
                </div>
                <span class="text-sm font-semibold {getConditionColor(
                  selectedPlant.currentConditions.humidity,
                  selectedPlant.optimalConditions.humidity.min,
                  selectedPlant.optimalConditions.humidity.max,
                  15
                )}">
                  {selectedPlant.currentConditions.humidity}%
                </span>
              </div>

              <div class="flex items-center justify-between rounded-lg bg-muted p-3">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">Soil pH</span>
                </div>
                <span class="text-sm font-semibold {getConditionColor(
                  selectedPlant.currentConditions.soilPH,
                  selectedPlant.optimalConditions.soilPH.min,
                  selectedPlant.optimalConditions.soilPH.max,
                  0.5
                )}">
                  {selectedPlant.currentConditions.soilPH.toFixed(1)}
                </span>
              </div>

              <div class="flex items-center justify-between rounded-lg bg-muted p-3">
                <div class="flex items-center gap-2">
                  <Droplets class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm font-medium">Soil Moisture</span>
                </div>
                <span class="text-sm font-semibold {getConditionColor(
                  selectedPlant.currentConditions.soilMoisture,
                  selectedPlant.optimalConditions.soilMoisture.min,
                  selectedPlant.optimalConditions.soilMoisture.max,
                  20
                )}">
                  {selectedPlant.currentConditions.soilMoisture}%
                </span>
              </div>

              <div class="flex items-center justify-between rounded-lg bg-muted p-3">
                <div class="flex items-center gap-2">
                  <Sun class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm font-medium">Sunlight</span>
                </div>
                <span class="text-sm font-semibold {getConditionColor(
                  selectedPlant.currentConditions.sunlightHours,
                  selectedPlant.optimalConditions.sunlightHours.min,
                  selectedPlant.optimalConditions.sunlightHours.max,
                  2
                )}">
                  {selectedPlant.currentConditions.sunlightHours}h/day
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="mb-3 text-sm font-semibold text-card-foreground">Care Advice</h3>
            <div class="space-y-2 rounded-lg bg-blue-50 border border-blue-200 p-4">
              {#each generateAdvice(selectedPlant) as advice}
                <p class="text-sm text-blue-900">{advice}</p>
              {/each}
            </div>
          </div>

          <div>
            <div class="mb-3 flex items-center gap-2">
              <MessageCircle class="h-4 w-4" />
              <h3 class="text-sm font-semibold text-card-foreground">
                Comments ({comments[selectedPlant.id]?.length || 0})
              </h3>
            </div>
            <div class="space-y-2 mb-3 max-h-32 overflow-y-auto">
              {#each comments[selectedPlant.id] || [] as comment}
                <div class="rounded-lg bg-muted p-2">
                  <p class="text-sm text-muted-foreground">{comment}</p>
                </div>
              {/each}
            </div>
            <div class="flex gap-2">
              <input
                type="text"
                bind:value={commentText}
                onkeypress={(e) => e.key === 'Enter' && addComment()}
                placeholder="Add a comment..."
                class="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button onclick={addComment} class="px-3 py-2 rounded-lg border border-border hover:bg-muted">
                <Send class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
