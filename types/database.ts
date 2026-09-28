export interface Profile {
  id: string;
  nama_sales: string | null;
  slug_url: string | null;
  no_wa: string | null;
  pixel_id: string | null;
  langganan_aktif_sampai: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  created_at: string;
  nama_pembeli: string;
  no_wa_pembeli: string;
  sales_id: string;
}
