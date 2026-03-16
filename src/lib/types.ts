export type UserRole = "admin" | "client";

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  client_id: string | null;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  logo_url: string | null;
  brand_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string;
  status: "planning" | "in_progress" | "review" | "completed" | "on_hold";
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "pending" | "in_progress" | "completed";
  sort_order: number;
  created_at: string;
}

export interface Deliverable {
  id: string;
  milestone_id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "delivered" | "approved";
  file_url: string | null;
  created_at: string;
}

export interface Update {
  id: string;
  project_id: string;
  title: string;
  content: string;
  type: "info" | "milestone" | "deliverable" | "alert";
  created_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_at: string;
}

export interface WelcomeDoc {
  id: string;
  project_id: string;
  hero_title: string;
  hero_subtitle: string;
  overview: string;
  what_happens_next: WelcomeStep[];
  communication: CommunicationChannel[];
  team_members: TeamMember[];
  custom_sections: CustomSection[];
  portal_access: PortalAccess | null;
  pdf_url: string | null;
  generated_at: string;
}

export interface PortalAccess {
  url: string;
  email: string;
  password: string;
}

export interface WelcomeStep {
  order: number;
  title: string;
  description: string;
  icon?: string;
}

export interface CommunicationChannel {
  type: string;
  value: string;
  label: string;
}

export interface TeamMember {
  name: string;
  role: string;
  avatar_url?: string;
}

export interface CustomSection {
  title: string;
  content: string;
}
