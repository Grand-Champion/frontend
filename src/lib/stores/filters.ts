import { writable } from "svelte/store"

export const selectedCategories = writable(["tree", "shrub", "herb", "vegetable"])
export const selectedStatus = writable(["good", "attention", "critical"])
