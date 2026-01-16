import api from "@/lib/api";

export interface TimerRecord {
    id?: string;
    userId: string;
    time: number;
    createdAt?: string;
}

export const timerApi = {
    saveTimerRecord: async (data: TimerRecord): Promise<TimerRecord> => {
        const response = await api.post<TimerRecord>('/timer', data);
        return response.data;
    },

    getUserHistory: async (userId: string, limit = 50): Promise<TimerRecord[]> => {
        const response = await api.get<TimerRecord[]>(`/timer/user/${userId}?limit=${limit}`);
        return response.data;
    }
};
