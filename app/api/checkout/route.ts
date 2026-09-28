import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, namaSales, email, noWa } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID sales wajib disertakan." },
        { status: 400 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json(
        {
          error:
            "MIDTRANS_SERVER_KEY belum dikonfigurasi di file environment variables (.env.local).",
        },
        { status: 500 }
      );
    }

    // Tentukan URL API Midtrans (Sandbox vs Production)
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const snapApiUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    // Format order_id unik: SUBS-[potongan-id]-[timestamp]
    const cleanUserId = userId.replace(/-/g, "");
    const orderId = `SUBS-${cleanUserId.slice(0, 8)}-${Date.now()}`;

    // Header Basic Auth Midtrans (Server Key di-encode base64 dengan akhiran titik dua)
    const authString = Buffer.from(`${serverKey}:`).toString("base64");

    // Payload transaksi Snap Midtrans
    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: 50000, // Rp 50.000
      },
      item_details: [
        {
          id: "LANGGANAN-30-HARI",
          price: 50000,
          quantity: 1,
          name: "Langganan Web Sales 30 Hari",
        },
      ],
      customer_details: {
        first_name: namaSales || "Sales Agen",
        email: email || "sales@domain.com",
        phone: noWa || "",
      },
      // Simpan userId di custom_field1 agar dikirim kembali saat webhook dipanggil
      custom_field1: userId,
    };

    // Request ke Midtrans Snap API
    const response = await fetch(snapApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Midtrans API Error:", data);
      return NextResponse.json(
        {
          error: data.error_messages
            ? data.error_messages.join(", ")
            : "Gagal membuat transaksi di Midtrans.",
        },
        { status: response.status }
      );
    }

    // Kembalikan token transaksi dan redirect_url ke frontend
    return NextResponse.json({
      token: data.token,
      redirect_url: data.redirect_url,
      order_id: orderId,
    });
  } catch (error: unknown) {
    console.error("Checkout Route Error:", error);
    const msg =
      error instanceof Error ? error.message : "Terjadi kesalahan internal server.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
