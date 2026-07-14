import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const fullName = process.env.ADMIN_FULL_NAME?.trim();

if (!url || !serviceRoleKey) {
  fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

if (!email || !email.includes("@")) {
  fail("ADMIN_EMAIL is required.");
}

if (!password || password.length < 8) {
  fail("ADMIN_PASSWORD with at least 8 characters is required.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const fullAdminMetadata = {
  role: "admin",
  permissions: ["rates", "agents", "content", "admin_users"],
};

const existingUser = await findUserByEmail(email);

if (existingUser) {
  const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
    password,
    email_confirm: true,
    app_metadata: {
      ...safeRecord(existingUser.app_metadata),
      ...fullAdminMetadata,
    },
    user_metadata: {
      ...safeRecord(existingUser.user_metadata),
      ...(fullName ? { full_name: fullName } : {}),
    },
  });

  if (error) {
    fail(error.message);
  }

  console.log(`Updated ${email} as a full admin.`);
} else {
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: fullAdminMetadata,
    user_metadata: fullName ? { full_name: fullName } : {},
  });

  if (error) {
    fail(error.message);
  }

  console.log(`Created ${email} as a full admin.`);
}

async function findUserByEmail(targetEmail) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      fail(error.message);
    }

    const match = data.users.find((user) => user.email?.toLowerCase() === targetEmail);
    if (match) {
      return match;
    }

    if (data.users.length < 100) {
      return null;
    }
  }

  return null;
}

function loadEnvFile(fileName) {
  const path = resolve(process.cwd(), fileName);

  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();

    if (!key || process.env[key]) {
      continue;
    }

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

function safeRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...value }
    : {};
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
