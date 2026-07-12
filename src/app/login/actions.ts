"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const operator = await prisma.operator.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!operator) {
    return { error: "Email atau password salah" };
  }

  const passwordMatch = await bcrypt.compare(
    parsed.data.password,
    operator.passwordHash
  );

  if (!passwordMatch) {
    return { error: "Email atau password salah" };
  }

  await createSession({
    operatorId: operator.id,
    email: operator.email,
    name: operator.name,
  });

  const callbackUrl = formData.get("callbackUrl");
  const destination =
    typeof callbackUrl === "string" &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/dashboard";

  redirect(destination);
}
