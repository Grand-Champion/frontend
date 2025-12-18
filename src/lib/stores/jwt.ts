import { writable } from 'svelte/store';
import { browser } from '$app/environment';
let defaultJwt = undefined;
if(browser){
    const cookie = await window.cookieStore.get("jwt");
    if(cookie?.value){
        defaultJwt = cookie.value;
    }
}
export const jwt = writable<string|undefined>(defaultJwt);

jwt.subscribe(async newJwt=>{
    if(browser) await window.cookieStore.set("jwt", newJwt ?? "");
});
