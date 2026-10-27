import type { MetadataRoute } from "next";

/** Lets phones add the site to the home screen and open it full screen like an app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IELTS Odyssey — A Higher You",
    short_name: "Odyssey",
    description: "ไวยากรณ์ทีละบท คำศัพท์พร้อมภาพและเสียง ทวนอัตโนมัติ เรียนฟรีบนมือถือ",
    lang: "th",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2eee9",
    theme_color: "#fffdfb",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "ฝึกศัพท์", url: "/learn", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "V1-V2-V3", url: "/verbs", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
