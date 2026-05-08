import { createFileRoute } from "@tanstack/react-router";
import { Coinminers } from "@/game/Coinminers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coinminers — Pixel Bitcoin Mining Tycoon" },
      { name: "description", content: "Coinminers: ultra-detailed pixel-art Bitcoin mining idle simulator. Build your crypto empire from a dusty garage to a quantum space station." },
      { property: "og:title", content: "Coinminers — Pixel Bitcoin Mining Tycoon" },
      { property: "og:description", content: "Cyberpunk pixel-art idle game. Buy GPUs, overclock rigs, and mine your way to a galactic crypto empire." },
    ],
  }),
  component: Coinminers,
});
