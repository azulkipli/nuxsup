// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: false,
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase"],
  css: ["./app/assets/css/main.css"],
  vite: {
    server: {
      allowedHosts: ["dev.nebengyu.web.id"]
    },
    plugins: [tailwindcss() as any],
  },
  supabase: {
    types: false, // disable database types
    redirect: false,
  },
});
