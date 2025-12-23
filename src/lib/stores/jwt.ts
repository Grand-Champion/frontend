import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getPayload } from '$lib/Auth';
let defaultJwt = undefined;
if(browser){
    const cookie = await window.cookieStore.get("jwt");
    if(cookie?.value){
        defaultJwt = cookie.value;
    }
}
export const jwt = writable<string|undefined>(defaultJwt);

jwt.subscribe(async newJwt=>{
    if(browser) {
        if(newJwt) {
            const payload = getPayload(newJwt);
            await window.cookieStore.set({
                name: "jwt", 
                value: newJwt ?? "",
                expires: payload.exp * 1000
            });
        } else {
            await window.cookieStore.delete("jwt")
        }
    }
});
