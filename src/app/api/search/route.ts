import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : undefined;

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    // Log the query parameters
    console.log("Search query:", q || "(empty - returning all)");
    console.log("Limit:", limit || "(no limit)");

    let query = supabase
        .from("characters")
        .select("character, pinyin, definition");

    // If q is provided, filter by pinyin_no_tones; otherwise return all entries
    if (q) {
        query = query.ilike("pinyin_no_tones", `${q}%`);
    }

    if (limit !== undefined) {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    // Log the results
    console.log("Query result - count:", data?.length || 0);
    if (data && data.length > 0) {
        console.log("First result:", data[0]);
    }

    if (error) {
        console.error("Supabase query error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ items: data ?? [] });
}