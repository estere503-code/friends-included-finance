import { cookies } from "next/headers";
import type { Role } from "./types";

const roles = new Set<Role>(["svetlana", "richard", "anastasia", "jean_claude", "kevin"]);
export const isRole = (value: unknown): value is Role => typeof value === "string" && roles.has(value as Role);
export async function demoRole(): Promise<Role | null> {
  const value = (await cookies()).get("friends-included-demo-role")?.value;
  return isRole(value) ? value : null;
}
