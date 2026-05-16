# n8n Migration Guide (Local Docker -> n8n Cloud)

## Current Development Setup
- Workflows are developed locally in Docker.
- Local n8n base URL: `http://192.168.1.8:5678`

## Workflow Migration Flow
1. Export workflow JSON from local n8n.
2. Import workflow JSON into n8n Cloud.
3. Ensure webhook node path stays stable:
   - `viralpro-image-generate`
   - `viralpro-blog-generate`
   - `viralpro-keyword-research`
4. Recreate credentials manually in n8n Cloud.
5. Activate workflows in n8n Cloud.

## Environment Variable-Only Switch
After migration, update only environment variables:

- `N8N_IMAGE_GENERATE_WEBHOOK_URL=https://your-n8n-cloud-domain/webhook/viralpro-image-generate`
- `N8N_BLOG_GENERATE_WEBHOOK_URL=https://your-n8n-cloud-domain/webhook/viralpro-blog-generate`
- `N8N_KEYWORD_RESEARCH_WEBHOOK_URL=https://your-n8n-cloud-domain/webhook/viralpro-keyword-research`
- `N8N_WEBHOOK_SECRET=your-shared-secret`
- `N8N_WEBHOOK_URL=https://your-n8n-cloud-domain/webhook/viralpro-image-generate`

No frontend code changes are required.

## Production URL Rules
- Use **Production URL** from n8n webhook node.
- Production URL works only when workflow is active.

## Post-Migration Verification
1. Run `npm run check:n8n-env`.
2. Test:
   - `POST /api/ai/image-generate`
   - `POST /api/ai/blog-generate`
   - `POST /api/ai/keyword-research`
3. Confirm responses are valid and no webhook URL is exposed to browser code.
