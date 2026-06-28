import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bokkie Cleaning Services",
    short_name: "Bokkie",
    description:
      "Professional cleaning services in Cape Town. Expert cleaners offering residential, commercial, and specialized cleaning services.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a2540",
    icons: [
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["business", "lifestyle"],
    lang: "en-ZA",
    dir: "ltr",
    orientation: "portrait-primary",
  };
}
