# n8n Local Development Notes

## Start n8n Locally
Use Docker to run n8n locally.

Local n8n base URL:
- `http://192.168.1.8:5678`

## Local Webhook Examples
- `http://192.168.1.8:5678/webhook/viralpro-image-generate`
- `http://192.168.1.8:5678/webhook/viralpro-blog-generate`
- `http://192.168.1.8:5678/webhook/viralpro-keyword-research`

## LAN/Wi-Fi Access Note
When testing from another device on same network, use local IP (`192.168.1.8`) instead of `localhost`.

## External Access to Local n8n
If external services need to call local n8n, use:
- ngrok, or
- Cloudflare Tunnel.

## Secrets and Env Files
- Do not commit real secrets.
- Use `.env.local` for local values.
- Use `.env.example` for placeholders/reference.
