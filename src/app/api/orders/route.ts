import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";

function generateIds(): string {
  const raw = crypto.randomBytes(16).toString("hex") + Date.now().toString();
  return crypto.createHash("md5").update(raw).digest("hex");
}

function stripTags(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

// Server-side bounds (do not trust client)
const DRIPFEED_INTERVALS = [0, 5, 10, 15, 30, 60] as const;
const SPEED_MIN = 10;
const SPEED_MAX = 900;
const DELAY_MIN = 1;
const DELAY_MAX = 60;
const POSITION_MAX = 10;
const POSITION_TIME_MAX = 9999;
const POSITION_UPVOTES_MAX = 9999;

async function getUserPrice(uid: number, serviceId: number, servicePrice: number): Promise<number> {
  const custom = await prisma.general_users_price.findFirst({
    where: { uid, service_id: serviceId },
    select: { service_price: true },
  });
  return custom?.service_price ? Number(custom.service_price) : servicePrice;
}

function err(message: string, status = 200) {
  return NextResponse.json({ status: "error", message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return err("Unauthorized", 401);

    const uid = session.user.uid;
    if (!uid) return err("Unauthorized", 401);

    const body = await request.json();
    const { action } = body;

    if (action === "mass_order") {
      return handleMassOrder(uid, body);
    }

    return handleSingleOrder(uid, body);
  } catch (error) {
    console.error("Order creation error:", error);
    return err("There was an error processing your request", 500);
  }
}

async function handleSingleOrder(uid: number, body: any) {
  const {
    category_id,
    service_id,
    link: rawLink,
    quantity: rawQuantity,
    agree,
    is_drip_feed,
    runs,
    interval,
    comments,
    comments_custom_package,
    usernames,
    usernames_custom,
    hashtags,
    hashtag,
    username,
    media_url,
    is_position: rawIsPosition,
    position: rawPosition,
    position_time: rawPositionTime,
    position_upvotes: rawPositionUpvotes,
    delay1: rawDelay1,
    delay2: rawDelay2,
    delay_order: rawDelayOrder,
    sub_username,
    sub_posts,
    sub_min,
    sub_max,
    sub_delay,
    sub_expiry,
  } = body;

  const cateId = parseInt(category_id) || 0;
  if (cateId <= 0) return err("Please choose a category");
  if (!service_id) return err("Please choose a service");

  const checkCategory = await prisma.categories.findFirst({
    where: { id: cateId, status: 1 },
  });
  if (!checkCategory) return err("Category does not exist");

  const svcId = parseInt(service_id);
  const checkService = await prisma.services.findFirst({
    where: { id: svcId, status: 1 },
  });
  if (!checkService) return err("Service does not exist");

  const serviceType = checkService.type || "default";
  const apiProviderId = checkService.api_provider_id || 0;
  const apiServiceId = checkService.api_service_id || "0";
  const servicePrice = Number(checkService.price || 0);
  const originalPrice = Number(checkService.original_price || 0);

  // Subscriptions are handled separately
  if (serviceType === "subscriptions") {
    return handleSubscriptionOrder(uid, body, checkService, cateId);
  }

  // Link validation
  const link = rawLink ? stripTags(String(rawLink)) : "";
  if (!link) return err("Invalid link");

  // Quantity calculation based on service type
  let quantity = parseInt(rawQuantity) || 0;

  switch (serviceType) {
    case "custom_comments": {
      const commentsText = comments ? stripTags(String(comments).trim()) : "";
      if (!commentsText) return err("Comments field is required");
      quantity = commentsText.split("\n").filter((l: string) => l.trim()).length;
      break;
    }
    case "mentions_custom_list": {
      if (!usernames_custom) return err("Username field is required");
      quantity = String(usernames_custom).split("\n").filter((l: string) => l.trim()).length;
      break;
    }
    case "package":
      quantity = 1;
      break;
    case "custom_comments_package": {
      const ccp = comments_custom_package ? stripTags(String(comments_custom_package)) : "";
      if (!ccp) return err("Comments field is required");
      quantity = 1;
      break;
    }
  }

  if (!quantity && !rawIsPosition) return err("Quantity is required");

  // Dripfeed
  const isDripFeed = is_drip_feed ? 1 : 0;
  let totalQuantity = quantity;

  if (isDripFeed) {
    if (!runs) return err("Runs is required");
    if (!interval) return err("Interval time is required");
    const intervalNum = parseInt(interval);
    if (!DRIPFEED_INTERVALS.includes(intervalNum as any)) return err("Invalid interval; allowed: 0, 5, 10, 15, 30, 60 minutes");
    totalQuantity = parseInt(runs) * quantity;
  }

  // Price calculation
  const min = checkService.min || 0;
  const max = checkService.max || 0;
  const price = await getUserPrice(uid, svcId, servicePrice);

  let totalCharge: number;
  if (serviceType === "package" || serviceType === "custom_comments_package") {
    totalCharge = price;
  } else {
    totalCharge = (price * totalQuantity) / 1000;
  }

  // Quantity validation (same as PHP ajax_add_orderr — relaxed for position orders)
  if (!rawIsPosition) {
    if (totalQuantity <= 0 || totalQuantity < min || quantity < min) {
      return err("Quantity must be greater than or equal to minimum amount");
    }
    if (totalQuantity > max) {
      return err("Quantity must be less than or equal to maximum amount");
    }
  }

  // Agreement check
  if (!agree) return err("You must confirm the conditions before placing order");

  // Balance check
  const user = await prisma.general_users.findUnique({
    where: { id: uid },
    select: { balance: true },
  });
  const userBalance = Number(user?.balance || 0);

  if (userBalance < totalCharge) return err("Not enough funds on balance");

  // Formal charge and profit
  const formalCharge = servicePrice > 0 ? (originalPrice * totalCharge) / servicePrice : 0;
  const profit = totalCharge - formalCharge;

  // Position fields
  const isPosition = rawIsPosition ? 1 : 0;
  const position = parseInt(rawPosition) || 0;
  const positionTime = parseInt(rawPositionTime) || 0;
  const positionUpvotes = parseInt(rawPositionUpvotes) || 0;
  const delay1 = parseInt(rawDelay1) || 0;
  const delay2 = parseInt(rawDelay2) || 0;
  const delayOrder = parseInt(rawDelayOrder) || 0;

  const now = new Date();
  const orderData: any = {
    ids: generateIds(),
    uid: String(uid),
    cate_id: String(cateId),
    service_id: String(svcId),
    service_type: serviceType,
    link,
    quantity: String(totalQuantity),
    charge: totalCharge,
    formal_charge: formalCharge,
    profit,
    api_provider_id: apiProviderId,
    api_service_id: apiServiceId,
    is_drip_feed: isDripFeed,
    status: "pending",
    is_position: isPosition === 1,
    delay1,
    delay2,
    position,
    position_time: positionTime,
    position_upvotes: positionUpvotes,
    delay_order: delayOrder,
    changed: now,
    created: now,
  };

  // Server-side validation of client-editable fields (speed, delays, position)
  if (serviceType === "mentions_hashtag") {
    if (hashtag === undefined || hashtag === null || String(hashtag).trim() === "") return err("Hashtag (speed) is required");
    const speedVal = parseInt(String(hashtag).trim(), 10);
    if (isNaN(speedVal) || speedVal < SPEED_MIN || speedVal > SPEED_MAX) return err(`Speed must be between ${SPEED_MIN} and ${SPEED_MAX}`);
    orderData.hashtag = String(speedVal);
  }
  const delay1Clamp = Math.min(DELAY_MAX, Math.max(DELAY_MIN, parseInt(rawDelay1) || 0));
  const delay2Clamp = Math.min(DELAY_MAX, Math.max(DELAY_MIN, parseInt(rawDelay2) || 0));
  orderData.delay1 = delay1Clamp;
  orderData.delay2 = delay2Clamp;
  orderData.position = Math.min(POSITION_MAX, Math.max(0, position));
  orderData.position_time = Math.min(POSITION_TIME_MAX, Math.max(0, positionTime));
  orderData.position_upvotes = Math.min(POSITION_UPVOTES_MAX, Math.max(0, positionUpvotes));

  // Service-type-specific fields
  switch (serviceType) {
    case "mentions_with_hashtags": {
      const unames = usernames ? stripTags(String(usernames)) : "";
      if (!unames) return err("Username field is required");
      if (!hashtags) return err("Hashtag field is required");
      orderData.usernames = unames;
      orderData.hashtags = String(hashtags);
      break;
    }
    case "mentions_hashtag":
      // already set above
      break;
    case "comment_likes": {
      const uname = username ? stripTags(String(username)) : "";
      if (!uname) return err("Username field is required");
      orderData.username = uname;
      break;
    }
    case "mentions_user_followers": {
      const uname = username ? stripTags(String(username)) : "";
      if (!uname) return err("Username field is required");
      orderData.username = uname;
      break;
    }
    case "mentions_media_likers":
      if (!media_url) return err("Invalid link");
      orderData.media = String(media_url);
      break;
    case "custom_comments":
      orderData.comments = JSON.stringify(comments);
      break;
    case "custom_comments_package":
      orderData.comments = JSON.stringify(comments_custom_package);
      break;
    case "mentions_custom_list":
      orderData.usernames = JSON.stringify(usernames_custom);
      break;
  }

  // Dripfeed overrides
  if (isDripFeed) {
    orderData.runs = parseInt(runs);
    orderData.interval = parseInt(interval);
    orderData.dripfeed_quantity = String(quantity);
    orderData.status = "active";
  }

  // API order flag
  if (apiProviderId && apiServiceId && apiServiceId !== "0") {
    orderData.api_order_id = -1;
  }

  // Refill flag
  if (checkService.refill) {
    orderData.refill = 1;
  }

  // Deduct balance then insert order (matches PHP save_order logic)
  const newBalance = Math.max(userBalance - totalCharge, 0);
  const updateResult = await prisma.general_users.updateMany({
    where: { id: uid },
    data: { balance: newBalance },
  });

  if (updateResult.count > 0 || totalCharge === 0) {
    await prisma.orders.create({ data: orderData });
    return NextResponse.json({ status: "success", message: "Order placed successfully!" });
  }

  return err("There was an error processing your request. Please try again later.");
}

async function handleSubscriptionOrder(
  uid: number,
  body: any,
  checkService: any,
  cateId: number,
) {
  const {
    agree,
    link: rawLink,
    sub_username,
    sub_posts: rawSubPosts,
    sub_min: rawSubMin,
    sub_max: rawSubMax,
    sub_delay: rawSubDelay,
    sub_expiry: rawSubExpiry,
  } = body;

  const apiProviderId = checkService.api_provider_id || 0;
  const apiServiceId = checkService.api_service_id || "0";
  const serviceType = checkService.type || "subscriptions";
  const servicePrice = Number(checkService.price || 0);
  const originalPrice = Number(checkService.original_price || 0);
  const svcId = checkService.id;

  const link = rawLink ? stripTags(String(rawLink)) : "";
  const usernameVal = sub_username ? String(sub_username).trim() : "";
  const posts = parseInt(rawSubPosts) || 0;
  const subMin = parseInt(rawSubMin) || 0;
  const subMax = parseInt(rawSubMax) || 0;
  const subDelay = parseInt(rawSubDelay) || 0;

  if (!usernameVal) return err("Username field is required");
  if (subMin < (checkService.min || 0)) return err("Quantity must be greater than or equal to minimum amount");
  if (subMax < subMin) return err("Min cannot be higher than Max");
  if (subMax > (checkService.max || 0)) return err("Quantity must be less than or equal to maximum amount");
  if (![0, 5, 10, 15, 30, 60, 90].includes(subDelay)) return err("Incorrect delay");
  if (posts <= 0) return err("New posts must be greater than or equal to 1");
  if (!agree) return err("You must confirm the conditions before placing order");

  const price = await getUserPrice(uid, svcId, servicePrice);
  const charge = (subMax * posts * price) / 1000;

  const user = await prisma.general_users.findUnique({
    where: { id: uid },
    select: { balance: true },
  });
  const userBalance = Number(user?.balance || 0);
  if (userBalance < charge) return err("Not enough funds on balance");

  let expiry = "";
  if (rawSubExpiry) {
    const parsed = new Date(String(rawSubExpiry).replace(/\//g, "-"));
    if (!isNaN(parsed.getTime())) {
      expiry = parsed.toISOString().split("T")[0];
    }
  }

  const now = new Date();
  const orderData: any = {
    ids: generateIds(),
    uid: String(uid),
    cate_id: String(cateId),
    service_id: String(svcId),
    service_type: serviceType,
    api_provider_id: apiProviderId,
    api_service_id: apiServiceId,
    sub_status: "Active",
    status: "pending",
    link,
    username: usernameVal,
    sub_posts: posts === 0 ? -1 : posts,
    sub_min: subMin,
    sub_max: subMax,
    sub_delay: subDelay,
    sub_expiry: expiry,
    charge,
    formal_charge: 0,
    profit: 0,
    changed: now,
    created: now,
  };

  if (apiProviderId && apiServiceId && apiServiceId !== "0") {
    orderData.api_order_id = -1;
  }

  const newBalance = Math.max(userBalance - charge, 0);
  const updateResult = await prisma.general_users.updateMany({
    where: { id: uid },
    data: { balance: newBalance },
  });

  if (updateResult.count > 0 || charge === 0) {
    await prisma.orders.create({ data: orderData });
    return NextResponse.json({ status: "success", message: "Order placed successfully!" });
  }

  return err("There was an error processing your request. Please try again later.");
}

async function handleMassOrder(uid: number, body: any) {
  const { mass_order, agree } = body;

  if (!agree) return err("You must confirm the conditions before placing order");
  if (!mass_order || !Array.isArray(mass_order) || mass_order.length === 0) {
    return err("Field cannot be blank");
  }

  const user = await prisma.general_users.findUnique({
    where: { id: uid },
    select: { balance: true },
  });
  const userBalance = Number(user?.balance || 0);
  if (userBalance === 0) return err("You do not have enough funds to place order");

  const errors: Record<string, string> = {};
  const orders: any[] = [];
  let sumCharge = 0;
  const now = new Date();

  for (const row of mass_order) {
    const parts = String(row).split("|");
    if (parts.length < 3 || parts.length > 4) {
      errors[row] = "Invalid format";
      continue;
    }

    const [svcIdStr, qtyStr, link, speed] = parts;
    const svcId = parseInt(svcIdStr);
    const qty = parseInt(qtyStr);

    const checkService = await prisma.services.findFirst({
      where: { id: svcId, status: 1 },
    });
    if (!checkService) {
      errors[row] = "Service ID does not exist";
      continue;
    }

    const min = checkService.min || 0;
    const max = checkService.max || 0;
    const price = await getUserPrice(uid, svcId, Number(checkService.price || 0));
    const charge = parseFloat(((price * qty) / 1000).toFixed(2));
    const originalPrice = Number(checkService.original_price || 0);
    const servicePrice = Number(checkService.price || 0);

    if (qty <= 0 || qty < min) {
      errors[row] = "Quantity must be greater than or equal to minimum amount";
      continue;
    }
    if (qty > max) {
      errors[row] = "Quantity must be less than or equal to maximum amount";
      continue;
    }

    // Server-side validation of speed (hashtag) when present
    let sanitizedSpeed = (speed || "").trim();
    if (sanitizedSpeed) {
      const speedNum = parseInt(sanitizedSpeed, 10);
      if (!isNaN(speedNum)) {
        if (speedNum < SPEED_MIN || speedNum > SPEED_MAX) {
          errors[row] = `Speed must be between ${SPEED_MIN} and ${SPEED_MAX}`;
          continue;
        }
        sanitizedSpeed = String(speedNum);
      }
    }

    const formalCharge = servicePrice > 0 ? (originalPrice * charge) / servicePrice : 0;
    const profit = charge - formalCharge;
    const apiProviderId = checkService.api_provider_id || 0;
    const apiServiceId = checkService.api_service_id || "0";

    orders.push({
      ids: generateIds(),
      uid: String(uid),
      cate_id: String(checkService.cate_id || 0),
      service_id: String(svcId),
      link: link || "",
      quantity: String(qty),
      hashtag: sanitizedSpeed,
      charge,
      formal_charge: formalCharge,
      profit,
      api_provider_id: apiProviderId,
      api_service_id: apiServiceId,
      api_order_id: (apiProviderId && apiServiceId && apiServiceId !== "0") ? -1 : 0,
      status: "pending" as const,
      changed: now,
      created: now,
    });

    sumCharge += charge;
  }

  if (sumCharge > userBalance) return err("Not enough funds on balance");

  if (orders.length > 0) {
    for (const order of orders) {
      await prisma.orders.create({ data: order });
    }
    const newBalance = Math.max(userBalance - sumCharge, 0);
    await prisma.general_users.update({
      where: { id: uid },
      data: { balance: newBalance },
    });
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({
      status: "error",
      message: "Some orders had errors",
      errors,
      success_count: orders.length,
    });
  }

  return NextResponse.json({ status: "success", message: "Order placed successfully!" });
}
