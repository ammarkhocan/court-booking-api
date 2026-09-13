import { sign, verify } from "hono/jwt";

function getTokenSecretKey(): string {
  const secret = process.env.TOKEN_SECRET_KEY;

  if (!secret) {
    throw new Error("TOKEN_SECRET_KEY is not defined");
  }

  return secret;
}

const tokenSecretKey = getTokenSecretKey();

interface JWTPayload {
  sub?: string;
}

export async function signToken(userId: string) {
  const payload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  return await sign(payload, tokenSecretKey, "HS256");
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const payload = await verify(token, tokenSecretKey, "HS256");

  return payload as JWTPayload;
}
