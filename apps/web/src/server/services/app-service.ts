import { appRepository } from "@/server/repositories/app-repository";
import { createClient } from "@/lib/supabase/server";
import { ContentItem } from "../domain/types";

export const appService = {
  getNavigation: () => appRepository.getNavigation(),
  getHistory: () => appRepository.getHistory(),
  getDashboard: () => ({ metrics: appRepository.getDashboardMetrics() }),
  getContent: async (): Promise<{ items: ContentItem[] }> => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { items: [] };
    }

    const { data, error } = await supabase
      .from("articles")
      .select("id, title, topic, primary_keyword, status, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Error fetching articles:", error);
      return { items: [] };
    }

    return {
      items: data.map((article) => ({
        id: article.id,
        title: article.title || article.topic || "Untitled",
        keyword: article.primary_keyword || "N/A",
        status: article.status, // Now matches ArticleStatus type correctly
        updatedAt: new Date(article.updated_at).toLocaleDateString(),
      })),
    };
  },
  getImages: () => ({ items: appRepository.getImageItems() }),
  getBilling: () => appRepository.getBillingSummary(),
  getSettings: () => appRepository.getSettings(),
  getDocs: () => ({ sections: appRepository.getDocsSections() }),
  generateArticle: (prompt: string) => ({
    title: prompt || "Untitled Article",
    body:
      "This is a demo generated response from the backend service layer. Replace this with your real generation API logic.",
  }),
};
