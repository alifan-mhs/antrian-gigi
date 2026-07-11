import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type OperatorSeed = { name: string; email: string; password: string };

function operatorsFromEnv(): OperatorSeed[] {
  const operators: OperatorSeed[] = [];

  // Numbered SEED_OPERATOR{n}_* triples, e.g. SEED_OPERATOR_*, SEED_OPERATOR2_*, ...
  // Each is independently optional so seeding one doesn't require the others.
  const suffixes = ["", "2", "3", "4"];
  for (const suffix of suffixes) {
    const name = process.env[`SEED_OPERATOR${suffix}_NAME`];
    const email = process.env[`SEED_OPERATOR${suffix}_EMAIL`];
    const password = process.env[`SEED_OPERATOR${suffix}_PASSWORD`];
    if (name && email && password) {
      operators.push({ name, email, password });
    }
  }

  return operators;
}

async function main() {
  const operators = operatorsFromEnv();

  if (operators.length === 0) {
    throw new Error(
      "Isi minimal SEED_OPERATOR_NAME, SEED_OPERATOR_EMAIL, dan SEED_OPERATOR_PASSWORD di .env"
    );
  }

  for (const { name, email, password } of operators) {
    const passwordHash = await bcrypt.hash(password, 12);

    const operator = await prisma.operator.upsert({
      where: { email: email.toLowerCase() },
      update: { name, passwordHash },
      create: { name, email: email.toLowerCase(), passwordHash },
    });

    console.log(`Operator siap: ${operator.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
