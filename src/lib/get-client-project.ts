import { createAdminClient } from "@/src/lib/supabase/admin";
import type { Project } from "@/src/lib/types";

/**
 * Get the active project for a user.
 * - Admin: returns the selected project, or the latest project overall.
 * - Client: returns the selected project (if it belongs to them), or their latest project.
 *
 * @param userId - The authenticated user's ID
 * @param role - "admin" or "client"
 * @param selectedProjectId - Optional project ID from ?project= search param
 */
export async function getClientProject(
  userId: string,
  role: string,
  selectedProjectId?: string
): Promise<Project | null> {
  const supabase = createAdminClient();

  if (role === "admin") {
    if (selectedProjectId) {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", selectedProjectId)
        .single();
      if (data) return data as Project;
    }
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    return (data as Project) || null;
  }

  // Client role — find their client_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("client_id")
    .eq("user_id", userId)
    .single();

  if (!profile?.client_id) return null;

  // If a specific project was selected, verify it belongs to this client
  if (selectedProjectId) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", selectedProjectId)
      .eq("client_id", profile.client_id)
      .single();
    if (data) return data as Project;
  }

  // Default to latest project
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", profile.client_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return (data as Project) || null;
}

/**
 * Get all projects for a user (used by layout for multi-project selector).
 */
export async function getClientProjects(
  userId: string,
  role: string
): Promise<Array<{ id: string; title: string }>> {
  const supabase = createAdminClient();

  if (role === "admin") {
    const { data } = await supabase
      .from("projects")
      .select("id, title")
      .order("created_at", { ascending: false });
    return data || [];
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("client_id")
    .eq("user_id", userId)
    .single();

  if (!profile?.client_id) return [];

  const { data } = await supabase
    .from("projects")
    .select("id, title")
    .eq("client_id", profile.client_id)
    .order("created_at", { ascending: false });

  return data || [];
}
