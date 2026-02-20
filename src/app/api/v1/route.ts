import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ids } from "@/lib/utils";

const DRIPFEED_INTERVALS = [0, 5, 10, 15, 30, 60] as const;
const SPEED_MIN = 10;
const SPEED_MAX = 900;
const DELAY_MIN = 1;
const DELAY_MAX = 60;

function jsonResponse(data: any) {
  return NextResponse.json(data);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "Active",
    completed: "Completed",
    processing: "Processing",
    pending: "Pending",
    inprogress: "In progress",
    partial: "Partial",
    canceled: "Canceled",
    refunded: "Refunded",
  };
  return labels[status] || "Pending";
}

async function getUserPrice(uid: number, service: { id: number; price: any }) {
  const customPrice = await prisma.general_users_price.findFirst({
    where: { uid, service_id: service.id },
  });
  if (customPrice?.service_price) return Number(customPrice.service_price);
  return Number(service.price || 0);
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);

  let bodyParams: Record<string, string> = {};
  if (request.method === "POST") {
    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        bodyParams = await request.json();
      } else if (contentType.includes("form")) {
        const formData = await request.formData();
        formData.forEach((val, key) => {
          bodyParams[key] = String(val);
        });
      }
    } catch {}
  }

  const allParams = { ...params, ...bodyParams };

  const apiKey = allParams.key || "";
  const action = allParams.action || "";
  const orderId = allParams.order || "";
  const orderIds = allParams.orders || "";

  if (!apiKey) {
    return jsonResponse({ error: "API is disabled for this user or user not found" });
  }

  const user = await prisma.general_users.findFirst({
    where: { api_key: apiKey, status: 1 },
    select: { id: true, balance: true },
  });

  if (!user) {
    return jsonResponse({ error: "API is disabled for this user or user not found" });
  }

  const uid = user.id;

  if (!action) {
    return jsonResponse({ error: "This action is invalid" });
  }

  switch (action) {
    case "services":
      return handleServices(uid);
    case "add":
      return handleAdd(uid, allParams, user);
    case "status":
      if (orderId) return handleSingleStatus(uid, orderId);
      if (orderIds) return handleMultiStatus(uid, orderIds);
      return jsonResponse({ error: "Order ID is required" });
    case "balance":
      return handleBalance(user);
    case "refill":
      return handleRefill(uid, allParams);
    case "refill_status":
      return handleRefillStatus(uid, allParams);
    default:
      return jsonResponse({ error: "This action is invalid" });
  }
}

async function handleServices(uid: number) {
  const services = await prisma.services.findMany({
    where: { status: 1 },
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      price: true,
      min: true,
      max: true,
      refill: true,
      cate_id: true,
      desc: true,
      dripfeed: true,
    },
  });

  const customPrices = await prisma.general_users_price.findMany({
    where: { uid },
  });

  const categories = await prisma.categories.findMany({
    where: { status: 1 },
    select: { id: true, name: true },
  });
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const result = services.map((s) => {
    const custom = customPrices.find((p) => p.service_id === s.id);
    const rate = custom?.service_price ? Number(custom.service_price) : Number(s.price || 0);
    return {
      service: s.id,
      name: s.name || "",
      type: s.type || "Default",
      rate: rate.toFixed(4),
      min: s.min || 0,
      max: s.max || 0,
      dripfeed: !!s.dripfeed,
      refill: !!s.refill,
      category: catMap.get(s.cate_id || 0) || "",
      description: s.desc || "",
    };
  });

  return jsonResponse(result);
}

async function handleAdd(
  uid: number,
  params: Record<string, string>,
  user: { id: number; balance: any }
) {
  const serviceId = parseInt(params.service || "0");
  const link = params.link || "";
  const hashtag = params.hashtag || "";
  const message = params.message || "";
  const usernames = params.usernames || "";
  const comments = params.comments || "";
  const positionTime = parseInt(params.position_time || "0");
  const position = parseInt(params.position || "0");

  if (!serviceId) {
    return jsonResponse({ error: "There are missing required parameters" });
  }

  const service = await prisma.services.findFirst({
    where: { id: serviceId, status: 1 },
  });

  if (!service) {
    return jsonResponse({ error: "Service ID does not exist" });
  }

  const serviceType = service.type || "default";
  let quantity = parseInt(params.quantity || "0");
  let isCustomComments = false;
  let parsedComments = "";
  let delay1 = parseInt(params.delay1 || "0");
  let delay2 = parseInt(params.delay2 || "0");
  let isDripFeed = false;
  let runs = parseInt(params.runs || "0");
  let interval = parseInt(params.interval || "0");
  let dripfeedQuantity = 0;
  let isPosition = 0;
  let orderLink = link;

  switch (serviceType) {
    case "mentions_custom_list":
      quantity = usernames ? usernames.split("\r\n").length : 0;
      if (message) {
        orderLink = message;
      } else {
        return jsonResponse({ error: "Wrong input" });
      }
      break;

    case "mentions_hashtag":
      if (hashtag) {
        const speedVal = parseInt(hashtag, 10);
        if (!isNaN(speedVal) && (speedVal < SPEED_MIN || speedVal > SPEED_MAX)) {
          return jsonResponse({ error: `Speed (hashtag) must be between ${SPEED_MIN} and ${SPEED_MAX}` });
        }
      }
      break;

    case "custom_comments":
      if (!comments) {
        return jsonResponse({ error: "Comments field is required" });
      }
      const commentLines = comments
        .replace(/\r\n/g, " | ")
        .replace(/\n/g, " | ")
        .split(" | ");
      quantity = commentLines.length;
      parsedComments = commentLines.join("\n");
      isCustomComments = true;
      break;

    default:
      if (runs > 0 || interval > 0) {
        if (!service.dripfeed) {
          return jsonResponse({ error: "This service does not support Dripfeed" });
        }
        if (runs > 0 && !interval) {
          return jsonResponse({ error: "Interval time is required" });
        }
        if (!runs && interval > 0) {
          return jsonResponse({ error: "Runs is required" });
        }
        if (!DRIPFEED_INTERVALS.includes(interval as any)) {
          return jsonResponse({ error: "Invalid interval in minutes; allowed: 0, 5, 10, 15, 30, 60" });
        }
        if (!quantity) {
          return jsonResponse({ error: "Quantity is required" });
        }
        isDripFeed = true;
        dripfeedQuantity = quantity;
        quantity = runs * dripfeedQuantity;
      }
      break;
  }

  if (!orderLink) {
    return jsonResponse({ error: "Bad Link" });
  }

  if (position > 0 && position < 11) {
    quantity = 0;
    isPosition = positionTime === 0 ? 2 : 1;
  }

  const min = service.min || 0;
  const max = service.max || 0;

  if (quantity < 1 && isPosition === 0) {
    return jsonResponse({
      error: `Quantity must be higher than or equal to minimum amount ${min}`,
    });
  }
  if (quantity > 0 && quantity < min) {
    return jsonResponse({
      error: `Quantity must be higher than or equal to minimum amount ${min}`,
    });
  }

  if (quantity > 0 && quantity > max) {
    return jsonResponse({
      error: `Quantity must be less than or equal to maximum amount ${max}`,
    });
  }

  const price = await getUserPrice(uid, { id: service.id, price: service.price });
  let totalCharge: number;

  if (serviceType === "package" || serviceType === "custom_comments_package") {
    totalCharge = price;
  } else {
    totalCharge = price * (quantity / 1000);
  }

  const userBalance = Number(user.balance || 0);
  if (userBalance < totalCharge) {
    return jsonResponse({ error: "Not enough funds on balance" });
  }

  const originalPrice = Number(service.original_price || 0);
  const servicePrice = Number(service.price || 0);
  const formalCharge = servicePrice > 0 ? (originalPrice * totalCharge) / servicePrice : 0;
  const profit = totalCharge - formalCharge;

  const now = new Date();
  const orderData: any = {
    ids: ids(),
    uid: String(uid),
    type: "api",
    cate_id: String(service.cate_id),
    service_id: String(service.id),
    usernames: usernames || null,
    link: orderLink,
    quantity: String(quantity),
    hashtag: hashtag || null,
    position: position > 0 ? position : null,
    position_time: positionTime > 0 ? positionTime : null,
    is_position: isPosition,
    charge: totalCharge,
    formal_charge: formalCharge,
    profit,
    api_provider_id: service.api_provider_id || 0,
    api_service_id: service.api_service_id || "0",
    api_order_id:
      service.api_provider_id && service.api_service_id ? -1 : 0,
    status: isDripFeed ? "inprogress" : "pending",
    service_type: serviceType,
    changed: now,
    created: now,
  };

  if (isCustomComments) {
    orderData.comments = JSON.stringify(parsedComments);
    orderData.delay1 = Math.min(DELAY_MAX, Math.max(DELAY_MIN, delay1));
    orderData.delay2 = Math.min(DELAY_MAX, Math.max(DELAY_MIN, delay2));
  }

  if (isDripFeed) {
    orderData.is_drip_feed = 1;
    orderData.runs = runs;
    orderData.interval = interval;
    orderData.dripfeed_quantity = String(dripfeedQuantity);
  }

  if (service.refill) {
    orderData.refill = 1;
  }

  const order = await prisma.orders.create({ data: orderData });

  const newBalance = userBalance - totalCharge;
  await prisma.general_users.update({
    where: { id: uid },
    data: { balance: Math.max(newBalance, 0) },
  });

  return jsonResponse({ status: "success", order: order.id });
}

async function handleSingleStatus(uid: number, orderId: string) {
  if (!orderId || isNaN(parseInt(orderId))) {
    return jsonResponse({ error: "Incorrect order ID" });
  }

  const uidStr = String(uid);

  const order = await prisma.orders.findFirst({
    where: { id: parseInt(orderId), uid: uidStr },
    select: {
      id: true,
      service_type: true,
      status: true,
      charge: true,
      start_counter2: true,
      remains: true,
      runs: true,
      is_drip_feed: true,
      sub_expiry: true,
      sub_posts: true,
    },
  });

  if (!order) {
    return jsonResponse({ error: "Incorrect order ID" });
  }

  if (order.service_type === "subscriptions") {
    const relatedOrders = await prisma.orders.findMany({
      where: { main_order_id: order.id },
      select: { id: true },
    });
    return jsonResponse({
      status: getStatusLabel(order.status || "pending"),
      expiry: order.sub_expiry
        ? new Date(order.sub_expiry) > new Date()
        : false,
      posts: order.sub_posts,
      orders: relatedOrders.map((o) => o.id),
    });
  }

  if (order.is_drip_feed) {
    const relatedOrders = await prisma.orders.findMany({
      where: { main_order_id: order.id },
      select: { id: true },
    });
    return jsonResponse({
      status: getStatusLabel(order.status || "pending"),
      runs: order.runs,
      orders: relatedOrders.map((o) => o.id),
    });
  }

  return jsonResponse({
    order: order.id,
    status: getStatusLabel(order.status || "pending"),
    charge: String(order.charge || "0"),
    start_count: order.start_counter2 || "0",
    remains: order.remains || "0",
    currency: "USD",
  });
}

async function handleMultiStatus(uid: number, orderIdsStr: string) {
  if (!orderIdsStr) {
    return jsonResponse({ error: "Order ID is required" });
  }

  const uidStr = String(uid);
  const orderIdList = orderIdsStr.split(",").map((id) => parseInt(id.trim()));
  const result: Record<string, any> = {};

  for (const oid of orderIdList) {
    const order = await prisma.orders.findFirst({
      where: { id: oid, uid: uidStr },
      select: {
        id: true,
        service_type: true,
        status: true,
        charge: true,
        start_counter2: true,
        remains: true,
        runs: true,
        is_drip_feed: true,
        sub_expiry: true,
        sub_posts: true,
      },
    });

    if (!order) {
      result[oid] = "Incorrect order ID";
      continue;
    }

    if (order.service_type === "subscriptions") {
      const relatedOrders = await prisma.orders.findMany({
        where: { main_order_id: order.id },
        select: { id: true },
      });
      result[oid] = {
        status: getStatusLabel(order.status || "pending"),
        expiry: order.sub_expiry
          ? new Date(order.sub_expiry) > new Date()
          : false,
        posts: order.sub_posts,
        orders: relatedOrders.map((o) => o.id),
      };
    } else if (order.is_drip_feed) {
      const relatedOrders = await prisma.orders.findMany({
        where: { main_order_id: order.id },
        select: { id: true },
      });
      result[oid] = {
        status: getStatusLabel(order.status || "pending"),
        runs: order.runs,
        orders: relatedOrders.map((o) => o.id),
      };
    } else {
      result[oid] = {
        order: order.id,
        status: getStatusLabel(order.status || "pending"),
        charge: String(order.charge || "0"),
        start_count: order.start_counter2 || "0",
        remains: order.remains || "0",
        currency: "USD",
      };
    }
  }

  return jsonResponse(result);
}

function handleBalance(user: { id: number; balance: any }) {
  return jsonResponse({
    status: "success",
    balance: String(user.balance || "0"),
    currency: "USD",
  });
}

async function handleRefill(uid: number, params: Record<string, string>) {
  const orderId = parseInt(params.order_id || params.order || "0");
  const uidStr = String(uid);

  if (!orderId) {
    return jsonResponse({ error: "Order ID is required" });
  }

  const order = await prisma.orders.findFirst({
    where: { id: orderId, uid: uidStr, refill: 1 },
    select: { id: true, refill_status: true },
  });

  if (!order) {
    return jsonResponse({ error: "Order not found or refill not available" });
  }

  if (order.refill_status === 1) {
    return jsonResponse({ error: "Refill already requested for this order" });
  }

  await prisma.orders.update({
    where: { id: orderId },
    data: { refill_status: 1, refill_date: new Date() },
  });

  return jsonResponse({ refill: orderId });
}

async function handleRefillStatus(uid: number, params: Record<string, string>) {
  const orderId = parseInt(params.refill || params.order || "0");
  const uidStr = String(uid);

  if (!orderId) {
    return jsonResponse({ error: "Order ID is required" });
  }

  const order = await prisma.orders.findFirst({
    where: { id: orderId, uid: uidStr },
    select: { refill_status: true },
  });

  if (!order) {
    return jsonResponse({ error: "Order not found" });
  }

  const statusMap: Record<number, string> = {
    1: "Pending",
    2: "Awaiting",
    3: "In Process",
    4: "Rejected",
    5: "Fail",
    7: "Complete",
  };

  return jsonResponse({
    status: statusMap[order.refill_status || 0] || "Pending",
  });
}
