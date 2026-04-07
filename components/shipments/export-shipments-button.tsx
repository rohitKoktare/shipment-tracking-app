"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import type { Database } from "@/types/database.types";

type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"];

type ExportShipmentsButtonProps = {
  shipments: ShipmentRow[];
};

export function ExportShipmentsButton({ shipments }: ExportShipmentsButtonProps) {
  function handleExport() {
    const worksheet = XLSX.utils.json_to_sheet(
      shipments.map((shipment) => ({
        "Shipment Name": shipment.name,
        Status: shipment.status,
        "Total Weight": shipment.total_weight ?? "",
        "Total Cost": shipment.total_cost ?? "",
        "Created Date": new Date(shipment.created_at).toLocaleDateString("en-IN"),
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shipments");
    XLSX.writeFile(workbook, "shipments.xlsx");
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      <Download className="h-4 w-4" />
      Export Excel
    </button>
  );
}
