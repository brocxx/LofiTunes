# LofiTunes

LofiTunes uses NextAuth v4 with Google OAuth and the YouTube Data API.

## Production deployment

### 1. Configure the Google OAuth client

In Google Cloud Console, configure the OAuth consent screen with the app name, support email, and required developer contact details. Add the domains used by the live app to **Authorized domains**. If the app remains in **Testing**, only listed test users can sign in; move it to **In production** when you are ready for general access. The YouTube read-only scope may require Google verification for public use. Check the OAuth verification status in Cloud Console if users outside your test list cannot authorize.

Create or edit a Google OAuth **Web application** client. Add the production site origin under **Authorized JavaScript origins**, for example:

```text
https://your-domain.example
```

Add this exact redirect URI under **Authorized redirect URIs**:

```text
https://your-domain.example/api/auth/callback/google
```

For local development, also keep `http://localhost:3000` as an authorized origin and `http://localhost:3000/api/auth/callback/google` as a redirect URI. Replace the example host with the canonical production domain, including `www` only if that is the domain serving the app.

### 2. Set production environment variables

In the hosting provider's project settings (for Vercel: **Project → Settings → Environment Variables**), set these for **Production**:

| Variable | Value |
| --- | --- |
| `GOOGLE_CLIENT_ID` | OAuth client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret; keep it server-side |
| `NEXTAUTH_SECRET` | A long random secret, unique to production |
| `NEXTAUTH_URL` | Canonical public origin, e.g. `https://your-domain.example` |

Set `NEXT_PUBLIC_YOUTUBE_API_KEY` too if the client-side YouTube Data API calls use it. Never use a `NEXT_PUBLIC_` prefix for OAuth client secrets. Generate a secret with `openssl rand -base64 32` or another cryptographically secure generator. Do not commit `.env.local` or production credentials to Git.

The callback route reads `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` on the server. The OAuth client's redirect URI must match the deployed `NEXTAUTH_URL` host exactly. After setting or changing environment variables, redeploy the app.

### 3. Verify the deployment

Open the production site and sign in with a Google account allowed by the consent screen. If Google returns `redirect_uri_mismatch`, compare the callback URL shown in the error with the Authorized redirect URI above. If NextAuth reports a host or secret configuration error, verify `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set in the Production environment and redeploy. Check the hosting function logs for errors from `/api/auth/[...nextauth]`.

## Local development

Create `.env.local` with the same variable names and development values. For local sign-in, use:

```text
NEXTAUTH_URL=http://localhost:3000
```

Then run `npm run dev` and use the localhost callback URI registered in Google Cloud Console.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
