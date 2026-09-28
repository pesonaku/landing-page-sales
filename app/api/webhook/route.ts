import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      custom_field1,
    } = payload;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("Webhook Error: MIDTRANS_SERVER_KEY belum diset.");
      return NextResponse.json(
        { error: "Server key belum dikonfigurasi." },
        { status: 500 }
      );
    }

    // 1. Verifikasi Signature Key Midtrans (SHA512)
    // Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
    const stringToSign = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const calculatedSignature = crypto
      .createHash("sha512")
      .update(stringToSign)
      .digest("hex");

    if (calculatedSignature !== signature_key) {
      console.warn("Webhook Ditolak: Signature key Midtrans tidak valid.", {
        order_id,
        calculatedSignature,
        receivedSignature: signature_key,
      });
      return NextResponse.json(
        { error: "Invalid signature key." },
        { status: 403 }
      );
    }

    console.log(
      `Midtrans Webhook Diterima: Order ID ${order_id}, Status: ${transaction_status}, Fraud: ${fraud_status}`
    );

    // 2. Cek apakah status pembayaran sukses
    const isPaymentSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    if (!isPaymentSuccess) {
      return NextResponse.json({
        status: "ignored",
        message: `Status transaksi '${transaction_status}' belum lunas/sukses.`,
      });
    }

    // 3. Dapatkan User ID Sales dari custom_field1
    const userId = custom_field1;
    if (!userId) {
      console.warn("User ID tidak ditemukan di custom_field1 webhook.");
      return NextResponse.json(
        { error: "User ID (custom_field1) tidak ditemukan pada payload transaksi." },
        { status: 400 }
      );
    }

    // 4. Hubungkan ke Supabase menggunakan Service Role Key (Bypass RLS)
    // Ambil data profil sales saat ini untuk mengecek masa aktif sebelumnya
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("langganan_aktif_sampai")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Gagal membaca profil dari Supabase:", fetchError.message);
      return NextResponse.json(
        { error: `Database fetch error: ${fetchError.message}` },
        { status: 500 }
      );
    }

    // 5. Hitung tanggal perpanjangan +30 hari
    const now = new Date();
    let baseDate = now;

    // Jika akun masih memiliki masa aktif yang berlaku di masa depan,
    // perpanjangan +30 hari dihitung dari tanggal kedaluwarsa tersebut (tidak hangus)
    if (profile?.langganan_aktif_sampai) {
      const currentExpiry = new Date(profile.langganan_aktif_sampai);
      if (currentExpiry > now) {
        baseDate = currentExpiry;
      }
    }

    // Tambah 30 hari (30 * 24 * 60 * 60 * 1000 milidetik)
    const newExpiryDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 6. Update tabel profiles di Supabase
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        langganan_aktif_sampai: newExpiryDate.toISOString(),
        is_active: true, // Pastikan link sales berstatus aktif
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Gagal mengupdate profil di Supabase:", updateError.message);
      return NextResponse.json(
        { error: `Database update error: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log(
      `Sukses: Langganan sales ${userId} berhasil diperpanjang sampai ${newExpiryDate.toISOString()}`
    );

    return NextResponse.json({
      status: "success",
      message: "Pembayaran sukses diverifikasi. Langganan diperpanjang +30 hari.",
      user_id: userId,
      langganan_aktif_sampai: newExpiryDate.toISOString(),
    });
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    const msg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
