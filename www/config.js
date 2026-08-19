/* Deployment settings for On We Go.
   Edit these two values and the app knows where to find its services.
   Neither is secret — the Auth URL is public by design, and the site address
   is just your site. */
window.ONWEGO_CONFIG = {
  // Neon Console → your project → Auth → Configuration
  authUrl: "https://ep-shy-thunder-aytlzep0.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth",

  // Leave blank on the web. In the iOS build, set this to your deployed site,
  // e.g. "https://onwego.netlify.app" — the native shell serves pages locally
  // and needs the full address to reach the API.
  apiBase: ""
};
