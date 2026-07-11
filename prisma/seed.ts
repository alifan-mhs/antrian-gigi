import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const name = process.env.SEED_OPERATOR_NAME;
  const email = process.env.SEED_OPERATOR_EMAIL;
  const password = process.env.SEED_OPERATOR_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "SEED_OPERATOR_NAME, SEED_OPERATOR_EMAIL, dan SEED_OPERATOR_PASSWORD wajib diisi di .env"
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const operator = await prisma.operator.upsert({
    where: { email: email.toLowerCase() },
    update: { name, passwordHash },
    create: { name, email: email.toLowerCase(), passwordHash },
  });

  console.log(`Operator siap: ${operator.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
