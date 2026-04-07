import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

function getRequiredEnv(name: keyof NodeJS.ProcessEnv) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // In server component render paths, Next exposes a read-only cookie store.
              // Supabase may still attempt to persist refreshed cookies, so we ignore
              // those writes here and let mutable contexts like actions handle them.
            }
          });
        },
      },
    },
  );
}

export function createServiceRoleClient() {
  return createClient<Database>(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export function getFriendlySupabaseErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("could not find the table") ||
    normalizedMessage.includes("schema cache")
  ) {
    return "Database tables are not set up yet. Run the SQL in database.sql inside your Supabase SQL Editor, then try again.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Your email is not confirmed yet. Disable email confirmation in Supabase for MVP, or confirm the email before logging in.";
  }

  if (normalizedMessage.includes("email rate limit exceeded")) {
    return "Supabase email rate limit was hit. For local MVP testing, use admin-created users in the server flow or wait and try again with a fresh email.";
  }

  if (normalizedMessage.includes("user already registered")) {
    return "This email is already registered. Try logging in instead, or delete the test user in Supabase Auth and sign up again.";
  }

  return message;
}

export async function getCurrentSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export async function getCurrentAuthUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentAppUser() {
  const authUser = await getCurrentAuthUser();

  if (!authUser) {
    return null;
  }

  const serviceRoleClient = createServiceRoleClient();
  const { data, error } = await serviceRoleClient
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (error) {
    throw new Error(getFriendlySupabaseErrorMessage(error.message));
  }

  return data;
}

export async function syncAuthUser(authUserId?: string) {
  const serviceRoleClient = createServiceRoleClient();
  const authUser =
    authUserId != null
      ? (await serviceRoleClient.auth.admin.getUserById(authUserId)).data.user
      : await getCurrentAuthUser();

  if (!authUser || !authUser.email) {
    return null;
  }

  const { data: existingUser, error: existingUserError } = await serviceRoleClient
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (existingUserError) {
    throw new Error(getFriendlySupabaseErrorMessage(existingUserError.message));
  }

  if (existingUser) {
    return existingUser;
  }

  const displayName =
    typeof authUser.user_metadata?.name === "string" && authUser.user_metadata.name.trim().length > 0
      ? authUser.user_metadata.name.trim()
      : null;

  const { data: organization, error: organizationError } = await serviceRoleClient
    .from("organizations")
    .insert({
      name: displayName ? `${displayName}'s Organization` : "Default Organization",
    })
    .select("*")
    .single();

  if (organizationError || !organization) {
    throw new Error(
      getFriendlySupabaseErrorMessage(
        organizationError?.message ?? "Unable to create organization.",
      ),
    );
  }

  const { data: insertedUser, error: insertUserError } = await serviceRoleClient
    .from("users")
    .insert({
      id: authUser.id,
      email: authUser.email,
      name: displayName,
      role: "admin",
      organization_id: organization.id,
    })
    .select("*")
    .single();

  if (insertUserError) {
    throw new Error(getFriendlySupabaseErrorMessage(insertUserError.message));
  }

  return insertedUser;
}
