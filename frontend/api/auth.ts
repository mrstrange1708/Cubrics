import api from "@/lib/api";

export const authApi = {
    signup: async (data: any) => {
        const response = await api.post("/auth/signup", data);
        return response.data;
    },

    signin: async (data: any) => {
        const response = await api.post("/auth/signin", data);
        return response.data;
    }
};
