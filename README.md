# Villa 57

Independent public read-only movie discovery website. No connection to the private Movie Collection or personal records.

## Setup
1. Install Node.js 20+.
2. `npm install`
3. Copy `.env.example` to `.env.local` and supply your TMDB API Read Access Token.
4. `npm run dev` and open http://localhost:3000.
5. Deploy this **separate project** to a production hosting account (e.g. Vercel) and set `TMDB_READ_ACCESS_TOKEN` as a server-side environment variable.
6. Before public launch, verify TMDB API licensing/attribution and JustWatch attribution/usage terms for your intended public use. This starter displays TMDB's US watch-provider feed, not independently verified real-time streaming availability; confirm licensing and freshness requirements before advertising availability as verified.
7. Once deployed, follow the host's exact DNS instructions to connect `thevilla57.com` and `www.thevilla57.com` in GoDaddy. Preserve MX, TXT, email CNAMEs, and NS records. Inspect all DNS records first.

## Notes
- Movie data and watch providers come from TMDB. No fabricated provider links or prices. The watch button links to the TMDB/JustWatch watch page, not an invented deep link.
- No editing, account registration, personal collection access, or video hosting.
- The mobile 1/2/4 layout setting is stored only in the visitor's own browser.
- TMDB may require a commercial license for monetized/public commercial use. Confirm terms before production.
