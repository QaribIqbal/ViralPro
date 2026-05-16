export type Plan = "free" | "pro";
export type ArticleStatus =
  | "queued"
  | "generating"
  | "completed"
  | "failed"
  | "draft"
  | "published";
export type ImageStatus = "queued" | "generating" | "completed" | "failed";
export type TemplateType = "article" | "image";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

export type UserUsage = {
  id: string;
  user_id: string;
  month_key: string;
  articles_generated: number;
  images_generated: number;
  created_at: string;
  updated_at: string;
};

export type Article = {
  id: string;
  user_id: string;
  title: string | null;
  topic: string;
  primary_keyword: string | null;
  content_html: string | null;
  content_markdown: string | null;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  slug: string | null;
  word_count: number | null;
  status: ArticleStatus;
  generation_settings: JsonValue;
  references: JsonValue;
  seo_score: number | null;
  ai_search_optimized: boolean;
  featured_image_id: string | null;
  wordpress_post_id: string | null;
  wordpress_site_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type GeneratedImage = {
  id: string;
  user_id: string;
  article_id: string | null;
  prompt: string;
  image_url: string | null;
  storage_path: string | null;
  alt_text: string | null;
  provider: string;
  status: ImageStatus;
  width: number | null;
  height: number | null;
  aspect_ratio: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type GenerationTemplate = {
  id: string;
  user_id: string;
  name: string;
  type: TemplateType;
  settings: JsonValue;
  created_at: string;
  updated_at: string;
};
