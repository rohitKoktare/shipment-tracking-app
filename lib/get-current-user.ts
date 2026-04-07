import type { Database } from "@/types/database.types";
import { getCurrentAppUser } from "@/lib/supabase/server";

export type CurrentUser = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  "id" | "email" | "name" | "role" | "organization_id"
>;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const user = await getCurrentAppUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organization_id: user.organization_id,
  };
}
