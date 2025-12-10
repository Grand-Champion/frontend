import { writable } from "svelte/store";

// Gebruik backend species types (Tree, Shrub, Plant)
export const selectedCategories = writable(["Tree", "Shrub", "Plant"]);
export const selectedStatus = writable(["good", "attention", "critical"]);
