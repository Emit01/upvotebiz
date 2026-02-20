const API_URL = "https://api.nowpayments.io/v1/";

export interface NowPaymentsInvoice {
  id: string;
  invoice_url: string;
  order_id: string;
  [key: string]: any;
}

export interface NowPaymentsPaymentInfo {
  payment_status: string;
  [key: string]: any;
}

export async function createInvoice(
  apiKey: string,
  params: {
    amount: number;
    orderId: string;
    description: string;
    ipnCallbackUrl: string;
    successUrl: string;
    cancelUrl: string;
    isFixedRate?: boolean;
  }
): Promise<NowPaymentsInvoice> {
  const body = {
    price_amount: params.amount.toFixed(2),
    price_currency: "usd",
    order_id: params.orderId,
    order_description: params.description,
    is_fixed_rate: params.isFixedRate ?? false,
    ipn_callback_url: params.ipnCallbackUrl,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  };

  const response = await fetch(`${API_URL}invoice`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `NOWPayments API error: ${response.status}`
    );
  }

  return response.json();
}

export async function getPaymentInfo(
  apiKey: string,
  paymentId: string
): Promise<{ status: string; data?: NowPaymentsPaymentInfo; message?: string }> {
  const response = await fetch(`${API_URL}payment/${paymentId}`, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
    },
  });

  const data = await response.json();

  if (data.statusCode === 404) {
    return { status: "error", message: "Payment not found" };
  }

  return { status: "success", data };
}
