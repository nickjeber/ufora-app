"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getActionUser } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

const decisionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["listening", "signed", "passed", "new"]),
});

/** Record a decision on a submission. Signing also creates a one-time invite. */
export async function decideSubmission(id: string, status: string): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return { error: "Your session expired — please sign in again." };
  const parsed = decisionSchema.safeParse({ id, status });
  if (!parsed.success) return { error: "Unknown decision." };

  const { data: sub, error: readError } = await supabase
    .from("submissions")
    .select("id, email, artist_name")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (readError || !sub) return { error: "Submission not found." };

  if (parsed.data.status === "signed") {
    // Reuse an unused invite for this person if one already exists.
    const { data: existing } = await supabase
      .from("artist_invites")
      .select("id")
      .ilike("email", sub.email)
      .is("used_at", null)
      .limit(1)
      .maybeSingle();
    if (!existing) {
      const { error } = await supabase
        .from("artist_invites")
        .insert({ submission_id: sub.id, email: sub.email, artist_name: sub.artist_name });
      if (error) return { error: "Couldn’t create the invite. Try again." };
    }
  }

  if (parsed.data.status !== "signed") {
    // Undoing a signing cancels the invite if it hasn't been used yet.
    await supabase.from("artist_invites").delete().eq("submission_id", sub.id).is("used_at", null);
  }

  const { error } = await supabase
    .from("submissions")
    .update({
      status: parsed.data.status,
      decided_at: parsed.data.status === "signed" || parsed.data.status === "passed" ? new Date().toISOString() : null,
    })
    .eq("id", sub.id);
  if (error) return { error: "Couldn’t save that decision. Try again." };

  revalidatePath("/admin");
  return { ok: true };
}
