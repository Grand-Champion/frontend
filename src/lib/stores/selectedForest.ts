import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedForestId = browser ? localStorage.getItem('selectedForestId') || '1' : '1';

export const selectedForestId = writable<string>(storedForestId);

selectedForestId.subscribe((value) => {
    if (browser) {
        localStorage.setItem('selectedForestId', value);
    }
});
