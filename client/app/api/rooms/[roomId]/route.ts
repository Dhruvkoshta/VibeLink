import { db } from "@/db/index"; // Assuming Drizzle instance
import * as schema from "@/db/schema"; // Assuming Drizzle schema
import { eq, } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const { user:users, chatGroups } = schema;

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found in session" },
        { status: 400 }
      );
    }

    const roomResult = await db
      .select({ userId: chatGroups.userId })
      .from(chatGroups)
      .where(eq(chatGroups.id, roomId))
      .limit(1);

    if (!roomResult || roomResult.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const room = roomResult[0];

    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const user = userResult[0];

    // Check if the user is the owner of the room
    if (room.userId !== user.id) {
      return NextResponse.json(
        { error: "You can't delete other people's rooms" },
        { status: 403 }
      );
    }

    await db.delete(chatGroups).where(eq(chatGroups.id, roomId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomResult = await db
      .select({
        id: chatGroups.id,
        title: chatGroups.title,
        userId: chatGroups.userId,
        createdAt: chatGroups.createdAt,
        updatedAt: chatGroups.updatedAt,
      })
      .from(chatGroups)
      .where(eq(chatGroups.id, roomId))
      .limit(1);

    if (!roomResult || roomResult.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const room = roomResult[0];

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}