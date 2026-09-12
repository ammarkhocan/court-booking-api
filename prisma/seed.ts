import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { dataCourts } from "./data/courts";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const dataCourt of dataCourts) {
    const upsertedCourt = await prisma.court.upsert({
      where: { slug: dataCourt.slug },
      update: dataCourt,
      create: dataCourt,
    });

    console.log(`${upsertedCourt.name}`);
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
