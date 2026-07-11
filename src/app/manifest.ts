import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pendaftaran Pasien Klinik Gigi",
    short_name: "Antrian Gigi",
    description: "Pendaftaran antrian pasien walk-in klinik gigi hari ini",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#092F54",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
