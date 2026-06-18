import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const platforms = [
    { id: "trustless-work", name: "Trustless Work", apiKey: "dev_tw_key_local" },
    { id: "blend-protocol", name: "Blend Protocol", apiKey: "dev_blend_key_local" },
    { id: "vaquita", name: "Vaquita", apiKey: "dev_vaquita_key_local" },
  ];

  for (const p of platforms) {
    await prisma.platform.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, active: true },
    });
    console.log(`Seeded platform: ${p.name} — apiKey: ${p.apiKey}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
