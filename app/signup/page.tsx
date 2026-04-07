import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
  getFriendlySupabaseErrorMessage,
  getCurrentSession,
  syncAuthUser,
} from "@/lib/supabase/server";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

function getErrorMessage(error: string | string[] | undefined) {
  if (!error) {
    return null;
  }

  return Array.isArray(error) ? error[0] : error;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const error = getErrorMessage(params.error);

  async function signup(formData: FormData) {
    "use server";

    const parsed = signupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      redirect(`/signup?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Unable to sign up.")}`);
    }

    const supabase = await createServerSupabaseClient();
    const serviceRoleClient = createServiceRoleClient();
    const { data, error: authError } = await serviceRoleClient.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        name: parsed.data.name,
      },
    });

    if (authError) {
      redirect(`/signup?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(authError.message))}`);
    }

    const authUser = data.user;

    if (!authUser) {
      redirect("/login?error=Check your email to confirm your account before logging in.");
    }

    const { data: organization, error: organizationError } = await serviceRoleClient
      .from("organizations")
      .insert({
        name: `${parsed.data.name}'s Organization`,
      })
      .select("id")
      .single();

    if (organizationError || !organization) {
      redirect(
        `/signup?error=${encodeURIComponent(
          getFriendlySupabaseErrorMessage(
            organizationError?.message ?? "Unable to create organization.",
          ),
        )}`,
      );
    }

    const { error: userInsertError } = await serviceRoleClient.from("users").insert({
      id: authUser.id,
      email: parsed.data.email,
      name: parsed.data.name,
      role: "admin",
      organization_id: organization.id,
    });

    if (userInsertError) {
      await serviceRoleClient.auth.admin.deleteUser(authUser.id);
      redirect(`/signup?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(userInsertError.message))}`);
    }

    try {
      await syncAuthUser(authUser.id);
    } catch (error) {
      await serviceRoleClient.auth.admin.deleteUser(authUser.id);
      const message = error instanceof Error ? error.message : "Unable to finish account setup.";
      redirect(`/signup?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(message))}`);
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (signInError) {
      redirect(
        `/login?error=${encodeURIComponent(
          getFriendlySupabaseErrorMessage(
            "Account created. If email confirmation is enabled in Supabase, confirm your email before logging in.",
          ),
        )}`,
      );
    }

    redirect("/dashboard");
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
      <p className="mt-2 text-sm text-slate-600">Set up your admin account and starter organization.</p>
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <form action={signup} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Create account
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-slate-900">
          Login
        </Link>
      </p>
    </section>
  );
}
