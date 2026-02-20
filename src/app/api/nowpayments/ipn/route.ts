import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPaymentInfo } from "@/lib/nowpayments";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || !body.payment_id || !body.order_id) {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
    }

    const invoiceId = String(body.invoice_id || "");
    const paymentId = String(body.payment_id);
    const orderId = String(body.order_id);

    const transaction = await prisma.general_transaction_logs.findFirst({
      where: {
        transaction_id: invoiceId,
        status: 0,
        note: orderId,
        type: "nowpayments",
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction ID does not exist" },
        { status: 404 }
      );
    }

    // Get the API key from payment config
    const payment = await prisma.payments.findFirst({
      where: { type: "nowpayments" },
      select: { id: true, params: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment config not found" },
        { status: 500 }
      );
    }

    let params: any = {};
    try {
      params = typeof payment.params === "string"
        ? JSON.parse(payment.params)
        : payment.params || {};
    } catch {}
    const apiKey = params?.option?.api_key || params?.api_key || "";

    const verifyResult = await getPaymentInfo(apiKey, paymentId);

    if (verifyResult.status === "success" && verifyResult.data?.payment_status) {
      const verifyStatus = verifyResult.data.payment_status.toLowerCase();
      const updateData: any = {};

      switch (verifyStatus) {
        case "finished":
          updateData.status = 1;

          // Update user balance (matching PHP add_funds_bonus_email logic)
          const txnFee = Number(transaction.txn_fee || 0);
          const newFunds = Number(transaction.amount || 0) - txnFee;

          const user = await prisma.general_users.findUnique({
            where: { id: transaction.uid! },
            select: { balance: true, spent: true },
          });

          if (user) {
            const newBalance = Number(user.balance || 0) + newFunds;
            const totalSpent = parseFloat(user.spent || "0") + Number(transaction.amount || 0);

            await prisma.general_users.update({
              where: { id: transaction.uid! },
              data: {
                balance: newBalance,
                spent: String(totalSpent),
              },
            });

            // Check for payment bonus
            const paymentBonus = await prisma.payments_bonus.findFirst({
              where: {
                payment_id: payment.id,
                status: 1,
                bonus_from: { lte: Number(transaction.amount || 0) },
              },
              orderBy: { bonus_from: "desc" },
            });

            if (paymentBonus) {
              const bonus = (Number(paymentBonus.percentage || 0) / 100) * newFunds;
              await prisma.general_users.update({
                where: { id: transaction.uid! },
                data: { balance: newBalance + bonus },
              });

              // Log bonus transaction
              const { ids } = await import("@/lib/utils");
              await prisma.general_transaction_logs.create({
                data: {
                  ids: ids(),
                  uid: transaction.uid,
                  type: "Bonus",
                  transaction_id: `#${transaction.id}`,
                  amount: bonus,
                  status: 1,
                  created: new Date(),
                },
              });
            }
          }
          break;

        case "refunded":
        case "failed":
        case "expired":
          updateData.status = -1;
          break;

        default:
          updateData.status = 0;
          break;
      }

      if (["finished", "refunded", "failed", "expired"].includes(verifyStatus)) {
        let existingData: any = {};
        try {
          existingData = transaction.data ? JSON.parse(transaction.data) : {};
        } catch {}
        updateData.data = JSON.stringify({ ...existingData, ...verifyResult.data });
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.general_transaction_logs.update({
          where: { id: transaction.id },
          data: updateData,
        });
      }

      return NextResponse.json({ message: "Successfully" });
    }

    return NextResponse.json({ error: "Transaction invalid" }, { status: 400 });
  } catch (error) {
    console.error("NOWPayments IPN error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
