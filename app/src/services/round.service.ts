import { toast } from "sonner";
import { api } from "../utils/api";

export const getRound = async (roundId: string) => {
  try {
    const response = await api.get(`/rounds/${roundId}`);
    return response.data;
  } catch (error) {
    toast.error("Failed to get round");
    throw error;
  }
};
