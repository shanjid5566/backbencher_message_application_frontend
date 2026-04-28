import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    fetchOptions: {
        credentials: "include",
    },
    onError: (error) => {
        console.error("Auth Error:", error);
    },
});