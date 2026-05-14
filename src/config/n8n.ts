export const N8N_WEBHOOKS = {
  imageGenerate: process.env.N8N_IMAGE_GENERATE_WEBHOOK_URL,
  blogGenerate: process.env.N8N_BLOG_GENERATE_WEBHOOK_URL,
  keywordResearch: process.env.N8N_KEYWORD_RESEARCH_WEBHOOK_URL,
} as const;

export const n8nConfig = {
  imageGenerateWebhookUrl: N8N_WEBHOOKS.imageGenerate,
  blogGenerateWebhookUrl: N8N_WEBHOOKS.blogGenerate,
  keywordResearchWebhookUrl: N8N_WEBHOOKS.keywordResearch,
  webhookSecret: process.env.N8N_WEBHOOK_SECRET,
};

function requireEnv(name: string, value: string | undefined) {
  if (!value || !value.trim()) {
    throw new Error(`Missing ${name} in environment variables.`);
  }
  return value.trim();
}

export function getN8nConfig() {
  return {
    imageGenerateWebhookUrl: requireEnv(
      "N8N_IMAGE_GENERATE_WEBHOOK_URL",
      n8nConfig.imageGenerateWebhookUrl
    ),
    blogGenerateWebhookUrl: requireEnv(
      "N8N_BLOG_GENERATE_WEBHOOK_URL",
      n8nConfig.blogGenerateWebhookUrl
    ),
    keywordResearchWebhookUrl: requireEnv(
      "N8N_KEYWORD_RESEARCH_WEBHOOK_URL",
      n8nConfig.keywordResearchWebhookUrl
    ),
    webhookSecret: requireEnv("N8N_WEBHOOK_SECRET", n8nConfig.webhookSecret),
  };
}
