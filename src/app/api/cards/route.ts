import { NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    // Fetch user's cards
    const { data, error } = await supabase
      .from("user_cards")
      .select("character, pinyin, definition")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cards:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch (error: any) {
    console.error("Error in GET /api/cards:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { character, pinyin, definition } = body;

    if (!character || !pinyin || !definition) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if card already exists for this user
    const { data: existing } = await supabase
      .from("user_cards")
      .select("id")
      .eq("user_id", user.id)
      .eq("character", character)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Card already exists" }, { status: 409 });
    }

    // Insert new card
    const { data, error } = await supabase
      .from("user_cards")
      .insert({
        user_id: user.id,
        character,
        pinyin,
        definition,
      })
      .select("character, pinyin, definition")
      .single();

    if (error) {
      console.error("Error inserting card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/cards:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const character = searchParams.get("character");

    if (!character) {
      return NextResponse.json(
        { error: "Missing character parameter" },
        { status: 400 }
      );
    }

    // Delete card
    const { error } = await supabase
      .from("user_cards")
      .delete()
      .eq("user_id", user.id)
      .eq("character", character);

    if (error) {
      console.error("Error deleting card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/cards:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

