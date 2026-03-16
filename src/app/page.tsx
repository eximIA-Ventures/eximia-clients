import { redirect } from "next/navigation";
import { getServerUser } from "@/src/lib/server-auth";

export default async function Home() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  redirect(user.role === "admin" ? "/admin" : "/portal");
}
