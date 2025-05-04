import { CareerRecommendation } from "@shared/schema";
import { apiRequest } from "./queryClient";

// Function to send form responses to the server and get career recommendations
export async function getCareerRecommendation(
  formResponses: Record<string, string | string[]>
): Promise<CareerRecommendation> {
  try {
    const response = await apiRequest("POST", "/api/career-recommendation", {
      formResponses,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get career recommendation");
    }
    
    const data = await response.json();
    return data as CareerRecommendation;
  } catch (error) {
    console.error("Error getting career recommendation:", error);
    throw error;
  }
}
