import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createServerSupabaseClient,
  getFriendlySupabaseErrorMessage,
  getCurrentSession,
} from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

function getErrorMessage(error: string | string[] | undefined) {
  if (!error) {
    return null;
  }

  return Array.isArray(error) ? error[0] : error;
}

export default async function LoginPage({
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

  async function login(formData: FormData) {
    "use server";

    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Unable to log in.")}`);
    }

    const supabase = await createServerSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithPassword(parsed.data);

    if (authError) {
      redirect(`/login?error=${encodeURIComponent(getFriendlySupabaseErrorMessage(authError.message))}`);
    }

    redirect("/dashboard");
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
      <p className="mt-2 text-sm text-slate-600">Sign in with your Supabase email and password.</p>
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <form action={login} className="mt-6 space-y-4">
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
          Login
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Need an account?{" "}
        <Link href="/signup" className="font-medium text-slate-900">
          Sign up
        </Link>
      </p>
    </section>
  );
}
