// auth.ts — Masjid Al Karomah — Takmir login (domain-restricted)
//
// Real deployments should replace this mock `authorize()` with a proper
// identity provider — e.g. NextAuth.js Credentials provider backed by a
// hashed-password database lookup, or an SSO/OIDC provider (Google
// Workspace, Microsoft Entra ID) restricted with `hd`/domain-hint checks to
// the official Takmir email domain. This file documents the shape and the
// domain rule so it can be dropped straight into `app/api/auth/[...nextauth]/route.ts`.

export const ADMIN_EMAIL_DOMAIN = "@takmir.masjidalkaromah.id";

export interface TakmirAccount {
  email: string;
  name: string;
  role: "Ketua Takmir" | "Bendahara" | "Amil Zakat" | "Sekretaris";
}

// Mock directory — replace with a database table (e.g. Prisma `TakmirUser`)
// storing a bcrypt/argon2 password hash per account, never plaintext.
const MOCK_ACCOUNTS: Array<TakmirAccount & { password: string }> = [
  { email: `ketua${ADMIN_EMAIL_DOMAIN}`, password: "takmir2026", name: "Ust. Zainal Arifin", role: "Ketua Takmir" },
  { email: `bendahara${ADMIN_EMAIL_DOMAIN}`, password: "kasmasjid1", name: "Bpk. Slamet Riyadi", role: "Bendahara" },
  { email: `amilzakat${ADMIN_EMAIL_DOMAIN}`, password: "zakat12345", name: "Ust. Fauzan", role: "Amil Zakat" },
];

export function isTakmirDomain(email: string): boolean {
  return email.trim().toLowerCase().endsWith(ADMIN_EMAIL_DOMAIN);
}

/**
 * Mock credential check. Swap this body for a real DB lookup + password hash
 * comparison (e.g. `bcrypt.compare`) in production. The domain check should
 * still run first and independently, so a leaked non-domain credential can
 * never authenticate — this mirrors an SSO `hd` (hosted-domain) restriction.
 */
export async function authorize(email: string, password: string): Promise<TakmirAccount | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!isTakmirDomain(cleanEmail)) return null;

  const match = MOCK_ACCOUNTS.find((a) => a.email === cleanEmail && a.password === password);
  if (!match) return null;

  const { password: _discard, ...account } = match;
  return account;
}

/* --------------------------------------------------------------------------
   Example NextAuth wiring (app/api/auth/[...nextauth]/route.ts):

   import NextAuth from "next-auth";
   import Credentials from "next-auth/providers/credentials";
   import { authorize, isTakmirDomain } from "@/lib/auth";

   export const { handlers, auth } = NextAuth({
     providers: [
       Credentials({
         credentials: { email: {}, password: {} },
         authorize: async (creds) => authorize(creds.email as string, creds.password as string),
       }),
     ],
     callbacks: {
       signIn: async ({ user }) => isTakmirDomain(user?.email ?? ""),
     },
     pages: { signIn: "/takmir/login" },
   });
   -------------------------------------------------------------------------- */
