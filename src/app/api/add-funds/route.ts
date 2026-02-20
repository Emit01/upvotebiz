import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ids } from "@/lib/utils";
import { createInvoice } from "@/lib/nowpayments";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { payment_id, amount, agree } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({
        status: "error",
        message: "Amount must be greater than zero",
      });
    }

    if (!agree) {
      return NextResponse.json({
        status: "error",
        message: "You must confirm the conditions before paying",
      });
    }

    const payment = await prisma.payments.findFirst({
      where: { id: payment_id },
    });

    if (!payment) {
      return NextResponse.json({
        status: "error",
        message: "Payment method not found",
      });
    }

    const minPayment = payment.min || 0;
    const maxPayment = payment.max || 0;

    if (amount < minPayment) {
      return NextResponse.json({
        status: "error",
        message: `Minimum amount is ${minPayment}`,
      });
    }

    if (maxPayment > 0 && amount > maxPayment) {
      return NextResponse.json({
        status: "error",
        message: `Maximum amount is ${maxPayment}`,
      });
    }

    let params: any = {};
    try {
      params = typeof payment.params === "string"
        ? JSON.parse(payment.params)
        : payment.params || {};
    } catch {}
    const option = params?.option || params || {};

    const paymentType = payment.type || "";
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    if (paymentType === "nowpayments") {
      const apiKey = option.api_key;
      if (!apiKey) {
        return NextResponse.json({
          status: "error",
          message: "This payment method is not properly configured",
        });
      }

      const orderId = `tnx_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      try {
        const invoice = await createInvoice(apiKey, {
          amount,
          orderId,
          description: `Balance recharge - ${session.user.email}`,
          ipnCallbackUrl: `${baseUrl}/api/nowpayments/ipn`,
          successUrl: `${baseUrl}/add-funds?status=success&paymentId=${orderId}`,
          cancelUrl: `${baseUrl}/add-funds?status=cancel&paymentId=${orderId}`,
          isFixedRate: !!option.tnx_fee,
        });

        if (invoice.id && invoice.invoice_url) {
          await prisma.general_transaction_logs.create({
            data: {
              ids: ids(),
              uid: session.user.uid,
              type: paymentType,
              transaction_id: String(invoice.id),
              amount,
              txn_fee: 0,
              note: invoice.order_id || orderId,
              data: JSON.stringify(invoice),
              status: 0,
              created: new Date(),
            },
          });

          return NextResponse.json({
            status: "success",
            redirect_url: invoice.invoice_url,
          });
        } else {
          return NextResponse.json({
            status: "error",
            message: "Failed to create payment invoice",
          });
        }
      } catch (error: any) {
        return NextResponse.json({
          status: "error",
          message: error.message || "Payment gateway error",
        });
      }
    }

    return NextResponse.json({
      status: "error",
      message: `Payment method "${paymentType}" handler not implemented yet`,
    });
  } catch (error) {
    console.error("Add funds error:", error);
    return NextResponse.json(
      { status: "error", message: "There was an error processing your request" },
      { status: 500 }
    );
  }
}
