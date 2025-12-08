<script>
  import { Trees, ListTree, Sprout, Leaf } from "lucide-svelte";
</script>

<div
  class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-y-auto"
>
  <div class="container mx-auto px-4 py-16">
    <!-- Header -->
    <div class="text-center mb-16">
      <div class="flex justify-center mb-6">
        <div class="relative">
          <Trees class="w-20 h-20 text-emerald-600" />
          <Sprout class="w-10 h-10 text-lime-500 absolute -bottom-2 -right-2" />
        </div>
      </div>
      <h1 class="text-5xl font-bold text-gray-800 mb-4">Food Garden</h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Monitor and manage your sustainable food forest ecosystem
      </p>
    </div>

    <!-- Navigation Cards -->
    <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <!-- Map View Card -->
      <a
        href="/map"
        class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
      >
        <div
          class="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white"
        >
          <Trees
            class="w-16 h-16 mb-4 group-hover:scale-110 transition-transform"
          />
          <h2 class="text-3xl font-bold mb-2">Garden Map</h2>
          <p class="text-emerald-50">
            Interactive visual layout of your food forest
          </p>
        </div>
        <div class="p-6">
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-center">
              <span class="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
              View plant locations
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
              Monitor plant health status
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
              Filter by category and condition
            </li>
          </ul>
        </div>
      </a>

      <!-- Species List Card -->
      <a
        href="/species"
        class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
      >
        <div
          class="bg-gradient-to-br from-lime-500 to-green-600 p-8 text-white"
        >
          <ListTree
            class="w-16 h-16 mb-4 group-hover:scale-110 transition-transform"
          />
          <h2 class="text-3xl font-bold mb-2">Species List</h2>
          <p class="text-lime-50">Detailed information about all your plants</p>
        </div>
        <div class="p-6">
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-center">
              <span class="w-2 h-2 bg-lime-500 rounded-full mr-3"></span>
              Browse all species
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-lime-500 rounded-full mr-3"></span>
              View detailed plant data
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-lime-500 rounded-full mr-3"></span>
              Track harvest schedules
            </li>
          </ul>
        </div>
      </a>
    </div>

    <!-- Quick Stats -->
    <div class="mt-16 max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">
          Garden Overview
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="flex justify-center mb-2">
              <Trees class="w-8 h-8 text-emerald-600" />
            </div>
            <div class="text-3xl font-bold text-gray-800">3</div>
            <div class="text-sm text-gray-600">Trees</div>
          </div>
          <div class="text-center">
            <div class="flex justify-center mb-2">
              <Sprout class="w-8 h-8 text-teal-600" />
            </div>
            <div class="text-3xl font-bold text-gray-800">3</div>
            <div class="text-sm text-gray-600">Shrubs</div>
          </div>
          <div class="text-center">
            <div class="flex justify-center mb-2">
              <Leaf class="w-8 h-8 text-lime-600" />
            </div>
            <div class="text-3xl font-bold text-gray-800">3</div>
            <div class="text-sm text-gray-600">Herbs</div>
          </div>
          <div class="text-center">
            <div class="flex justify-center mb-2">
              <svg
                class="w-8 h-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div class="text-3xl font-bold text-gray-800">3</div>
            <div class="text-sm text-gray-600">Vegetables</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
