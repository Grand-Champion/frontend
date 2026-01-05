import { PUBLIC_API_URL } from '$env/static/public';

export const load = async ({ fetch }) => {
    try {
        const response = await fetch (`${PUBLIC_API_URL}/forests/api/v1/messages`);
        const messages = await response.json();
        return { messages };
    } catch (error) {
        console.log(error);
        return {error};
        }
    };
