import {
  appSettings,
  billingSummary,
  contentItems,
  dashboardMetrics,
  docsSections,
  historyItems,
  imageItems,
  navItems,
} from "@/server/data/demo-data";

export const appRepository = {
  getNavigation: () => navItems,
  getHistory: () => historyItems,
  getDashboardMetrics: () => dashboardMetrics,
  getContentItems: () => contentItems,
  getImageItems: () => imageItems,
  getBillingSummary: () => billingSummary,
  getSettings: () => appSettings,
  getDocsSections: () => docsSections,
};
