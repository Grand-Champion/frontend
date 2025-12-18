import { jwt } from '$lib/stores/jwt';
import { PUBLIC_API_URL } from '$env/static/public';


export function getPayload(jwts: string|undefined): object {
    if(jwts){
        const parts = jwts.split(".");
        if(parts.length === 3){
            return JSON.parse(atob(parts[1]));
        }
    }
    return {};
}

export async function login(email: string, password: string): Promise<void>{
    const request = await fetch(PUBLIC_API_URL + "/login", {
        method: "POST",
        body: new URLSearchParams({email, password})
    });
    const data = await request.json();
    if(request.ok){
        jwt.set(data.data.token);
    } else {
        throw new Error(data.message);
    }
}

export async function updateUser(jwts: string, id: string | number, data: Record<string, string>): Promise<void>{
    const headers = new Headers();
    headers.set("Authorization", jwts);
    const request = await fetch(PUBLIC_API_URL + "/users/" + id, {
        method: "PATCH",
        body: new URLSearchParams(data),
        headers
    });
    const response = await request.json();
    if(request.ok){
        if(id === "me" || id === getPayload(jwts)?.id){
            refreshToken(jwts);
        }
    } else {
        throw new Error(response.message);
    }
}


export async function createUser(jwts: string, data: Record<string, string>): Promise<void>{
    const headers = new Headers();
    headers.set("Authorization", jwts);
    const request = await fetch(PUBLIC_API_URL + "/users/", {
        method: "POST",
        body: new URLSearchParams(data),
        headers
    });
    const response = await request.json();
    if(request.ok){
        return;
    } else {
        throw new Error(response.message);
    }
}

export async function updatePassword(jwts: string, password: string, newPassword: string): Promise<void>{
    const headers = new Headers();
    headers.set("Authorization", jwts);
    const request = await fetch(PUBLIC_API_URL + "/users/me/password", {
        method: "PATCH",
        body: new URLSearchParams({password, newPassword}),
        headers
    });
    const response = await request.json();
    if(request.ok){
        return;
    } else {
        throw new Error(response.message);
    }
}

export async function refreshToken(jwts: string): Promise<void> {
    const headers = new Headers();
    headers.set("Authorization", jwts);
    const request = await fetch(PUBLIC_API_URL + "/token", {
        method: "POST",
        headers
    });
    const response = await request.json();
    if(request.ok){
        jwt.set(response.data.token);
    } else {
        throw new Error(response.message);
    }
}

export async function getUser(jwts: string, id: number | string): Promise<object>{
    const headers = new Headers();
    headers.set("Authorization", jwts);
    const request = await fetch(PUBLIC_API_URL + "/users/" + id, {
        headers
    });
    const response = await request.json();
    if(request.ok){
        return response.data;
    } else {
        throw new Error(response.message);
    }
}

export async function getUsers(jwts: string): Promise<object[]>{
    const headers = new Headers();
    headers.set("Authorization", jwts);
    const request = await fetch(PUBLIC_API_URL + "/users/", {
        headers
    });
    const response = await request.json();
    if(request.ok){
        return response.data;
    } else {
        throw new Error(response.message);
    }
}


export async function deleteUser(jwts: string, id: number | string, password: string | undefined): Promise<void>{
    const headers = new Headers();
    const data: Record<string, string> = {};
    if(password) data.password = password;
    headers.set("Authorization", jwts);
    const request = await fetch(PUBLIC_API_URL + "/users/" + id, {
        method: "DELETE",
        body: new URLSearchParams(data),
        headers
    });
    const response = await request.json();
    if(request.ok){
        return;
    } else {
        throw new Error(response.message);
    }
}
