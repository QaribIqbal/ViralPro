import { appRepository } from "@/server/repositories/app-repository";

export const appService = {
  getNavigation: () => appRepository.getNavigation(),
  getHistory: () => appRepository.getHistory(),
  getDashboard: () => ({ metrics: appRepository.getDashboardMetrics() }),
  getContent: () => ({ items: appRepository.getContentItems() }),
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
