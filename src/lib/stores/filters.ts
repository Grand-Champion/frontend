import { writable } from "svelte/store";

// Gebruik backend species types (lowercase: tree, shrub, herb, vegetable)
export const selectedCategories = writable(["tree", "shrub", "herb", "vegetable"]);
export const selectedStatus = writable(["good", "attention", "critical"]);
