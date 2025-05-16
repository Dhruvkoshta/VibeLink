import { db } from "@/db/index"; // Assuming Drizzle instance
import * as schema from "@/db/schema"; // Assuming Drizzle schema
import { eq, desc, gte, count as drizzleCount, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const { user:users, chatGroups, chatMessages } = schema;

const ROOM_CREATION_RATE_LIMIT = {
  MAX_ROOMS: 1,    
  TIME_WINDOW: 3600
};

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if(!session?.user) {
      return NextResponse.json({error: "Unauthorized"},{status: 401})
    }

    const roomMessagesData = await db
      .select({
        id: chatGroups.id,
        userId: chatGroups.userId,
        title: chatGroups.title,
        createdAt: chatGroups.createdAt,
        updatedAt: chatGroups.updatedAt,
        messageUserId: chatMessages.userId,
      })
      .from(chatGroups)
      .leftJoin(chatMessages, eq(chatGroups.id, chatMessages.chatGroupId))
      .orderBy(desc(chatGroups.createdAt));

    const aggregatedRooms = roomMessagesData.reduce<
      Record<
        string,
        {
          id: string; // Adjust type if ID is not string
          userId: string; // Adjust type if ID is not string
          title: string;
          createdAt: Date;
          updatedAt: Date;
          participantUserIds: Set<string>; // Adjust type if ID is not string
        }
      >
    >((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          userId: row.userId,
          title: row.title,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt ?? new Date(),
          participantUserIds: new Set(),
        };
      }
      if (row.messageUserId) {
        acc[row.id].participantUserIds.add(row.messageUserId);
      }
      return acc;
    }, {});

    const roomsWithUserCount = Object.values(aggregatedRooms).map(room => ({
      id: room.id,
      userId: room.userId,
      title: room.title,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      totalParticipants: room.participantUserIds.size,
    }));

    return NextResponse.json({ rooms: roomsWithUserCount })
  }
  catch(error){
    console.error("Error fetching rooms:", error)
    return NextResponse.json({error: "Failed to fetch rooms"}, {status: 500})
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if(!session?.user) {
      return NextResponse.json({error: "Unauthorized"},{status: 401})
    }
    const {roomName} = await req.json()

    if(!roomName) {
      return NextResponse.json({error: "Room name is required"}, {status: 400})
    }

    const userEmail = session.user.email
    if(!userEmail) {
      return NextResponse.json({error: "User email not found in session"}, {status: 400})
    }
    
    const userResult = await db.select({ id: users.id }).from(users).where(eq(users.email, userEmail)).limit(1);
    
    if(!userResult || userResult.length === 0) {
      return NextResponse.json({error: "User not found"}, {status: 404})
    }
    const user = userResult[0];

    const oneHourAgo = new Date(Date.now() - ROOM_CREATION_RATE_LIMIT.TIME_WINDOW * 1000);
    
    const recentRoomsCountResult = await db
      .select({ count: drizzleCount(chatGroups.id) })
      .from(chatGroups)
      .where(
        and(
          eq(chatGroups.userId, user.id),
          gte(chatGroups.createdAt, oneHourAgo)
        )
      );

    const recentRoomsCount = recentRoomsCountResult[0]?.count || 0;

    if (recentRoomsCount >= ROOM_CREATION_RATE_LIMIT.MAX_ROOMS) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded", 
          message: `You can only create ${ROOM_CREATION_RATE_LIMIT.MAX_ROOMS} room per hour. Please try again later.`
        }, 
        { status: 429 }
      );
    }

    const newRoomArray = await db.insert(chatGroups).values({
      userId: user.id,
      title: roomName,
      // createdAt is often handled by DB default
      updatedAt: new Date() 
    }).returning({
      id: chatGroups.id,
      userId: chatGroups.userId,
      title: chatGroups.title,
      createdAt: chatGroups.createdAt,
      updatedAt: chatGroups.updatedAt,
    });

    if (!newRoomArray || newRoomArray.length === 0) {
      return NextResponse.json({error: "Failed to create room record"}, {status: 500})
    }
    const room = newRoomArray[0];

    const formattedRoom = {
      id: room.id,
      userId: room.userId,
      title: room.title,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      totalParticipants: 0 // New room has 0 participants initially
    }

    return NextResponse.json({ room: formattedRoom })
  }
  catch(error) {
    console.error("Error creating room:", error)
    return NextResponse.json({error: "Failed to create room" }, {status: 500})
  }
}