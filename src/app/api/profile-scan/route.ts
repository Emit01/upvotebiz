import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.uid) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }
  const uid = session.user.uid as number;

  const items = await prisma.profile_scan.findMany({
    where: { uid },
    orderBy: { id: "desc" },
  });

  const list = items.map((i) => ({
    id: i.id,
    username: i.username ?? "",
    category: i.category,
    whitelist: i.whitelist ?? "",
    blacklist: i.blacklist ?? "",
    no_of_upvotes: i.no_of_upvotes,
    no_of_upvotes2: i.no_of_upvotes2,
    rank: i.rank ?? "",
    rank2: i.rank2 ?? "",
    speed: i.speed,
    position_time: i.position_time,
    service_id: i.service_id,
  }));

  return NextResponse.json({ status: "success", items: list });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.uid) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }
  const uid = session.user.uid as number;

  const user = await prisma.general_users.findUnique({
    where: { id: uid },
    select: { api_key: true },
  });
  const apiKey = user?.api_key ?? "";

  const body = await request.json();
  const {
    username,
    category,
    rank,
    rank2,
    no_of_upvotes,
    no_of_upvotes2,
    position_time,
    whitelist,
    blacklist,
    speed,
    service_id,
  } = body;

  if (!username || !String(username).trim()) {
    return NextResponse.json({ status: "error", message: "Username is required" });
  }

  const categoryVal = category === "rank" ? "rank" : "upvotes";
  const rankStr = rank != null ? String(rank) : "";
  const rank2Str = rank2 != null ? String(rank2) : "";
  const SPEED_MIN = 0.25;
  const SPEED_MAX = 900;
  const POSITION_TIME_MAX = 1440;
  const NO_UPVOTES_MIN = 1;
  const NO_UPVOTES_MAX = 1000;
  const noUp1 = Math.min(NO_UPVOTES_MAX, Math.max(NO_UPVOTES_MIN, parseInt(no_of_upvotes) || 1));
  const noUp2 = Math.min(NO_UPVOTES_MAX, Math.max(NO_UPVOTES_MIN, parseInt(no_of_upvotes2) || 1));
  const posTime = Math.min(POSITION_TIME_MAX, Math.max(0, parseInt(position_time) || 0));
  const speedNum = Math.min(SPEED_MAX, Math.max(SPEED_MIN, parseFloat(speed) || 0.25));
  const whitelistStr = whitelist != null ? String(whitelist) : "";
  const blacklistStr = blacklist != null ? String(blacklist) : "";
  const serviceId = parseInt(service_id) || 2;

  await prisma.profile_scan.create({
    data: {
      uid,
      API_key: apiKey,
      username: String(username).trim(),
      category: categoryVal as "rank" | "upvotes",
      rank: rankStr,
      rank2: rank2Str,
      no_of_upvotes: noUp1,
      no_of_upvotes2: noUp2,
      position_time: posTime,
      whitelist: whitelistStr,
      blacklist: blacklistStr,
      speed: speedNum,
      service_id: serviceId,
    },
  });

  return NextResponse.json({ status: "success", message: "Data Added Successfully" });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.uid) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }
  const uid = session.user.uid as number;

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") ?? "0");
  if (!id) {
    return NextResponse.json({ status: "error", message: "Invalid id" }, { status: 400 });
  }

  await prisma.profile_scan.deleteMany({
    where: { id, uid },
  });

  return NextResponse.json({ status: "success", message: "Data Deleted Successfully" });
}
