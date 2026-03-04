import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { db } from "@/db";

export async function createContext() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { db, supabase, session, user: session?.user ?? null };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
