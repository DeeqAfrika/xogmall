"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/admin";

export type CreateAdminUserState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function createAdminUser(
  _previousState: CreateAdminUserState,
  formData: FormData,
): Promise<CreateAdminUserState> {
  const adminContext = await getAdminContext();

  if (adminContext.status !== "ok") {
    return { status: "error", message: "Only full admins can create admin users." };
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();

  if (!email || !email.includes("@")) {
    return { status: "error", message: "Enter a valid email address." };
  }

  if (password.length < 8) {
    return { status: "error", message: "Enter a password with at least 8 characters." };
  }

  const { error } = await adminContext.supabase.rpc("create_admin_auth_user", {
    p_email: email,
    p_password: password,
    p_full_name: fullName || null,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/users");
  return { status: "success", message: `${email} is now a full admin.` };
}
