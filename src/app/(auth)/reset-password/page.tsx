import { redirect } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "../actions";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  // The recovery link signs the user in first (via /auth/confirm).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=link");

  return (
    <div className="card">
      <h1 className="heading text-2xl">New password</h1>
      <p className="mt-1 mb-6 text-sm text-muted">For {user.email}</p>
      <ActionForm action={updatePassword} submitLabel="Save password" buttonClassName="btn-primary w-full">
        <div>
          <label className="field-label" htmlFor="password">
            New password
          </label>
          <input id="password" name="password" type="password" className="input" required minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <label className="field-label" htmlFor="confirm">
            Confirm password
          </label>
          <input id="confirm" name="confirm" type="password" className="input" required minLength={8} autoComplete="new-password" />
        </div>
      </ActionForm>
    </div>
  );
}
