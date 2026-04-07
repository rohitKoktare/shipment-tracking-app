"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import type { Database } from "@/types/database.types";

type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"];
type TrackingItemRow = Database["public"]["Tables"]["tracking_items"]["Row"];

type ExportShipmentButtonsProps = {
  shipment: ShipmentRow;
  trackingItems: TrackingItemRow[];
};

export function ExportShipmentButtons({
  shipment,
  trackingItems,
}: ExportShipmentButtonsProps) {
  function exportExcel() {
    const shipmentInfoSheet = XLSX.utils.json_to_sheet([
      {
        Name: shipment.name,
        Status: shipment.status,
        "Total Weight": shipment.total_weight ?? "",
        "Total Cost": shipment.total_cost ?? "",
        "Created Date": new Date(shipment.created_at).toLocaleDateString("en-IN"),
      },
    ]);

    const trackingItemsSheet = XLSX.utils.json_to_sheet(
      trackingItems.map((item) => ({
        "Tracking ID": item.tracking_id,
        Courier: item.courier,
        Weight: item.weight ?? "",
        Cost: item.cost ?? "",
        Status: item.status,
        Confirmed: item.is_confirmed_by_agent ? "Yes" : "No",
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, shipmentInfoSheet, "Shipment Info");
    XLSX.utils.book_append_sheet(workbook, trackingItemsSheet, "Tracking Items");
    XLSX.writeFile(workbook, `shipment-${shipment.id}.xlsx`);
  }

  function exportPdf() {
    const pdf = new jsPDF();
    let y = 20;

    pdf.setFontSize(18);
    pdf.text("Shipment Details", 14, y);
    y += 12;

    pdf.setFontSize(11);
    pdf.text(`Name: ${shipment.name}`, 14, y);
    y += 8;
    pdf.text(`Status: ${shipment.status}`, 14, y);
    y += 8;
    pdf.text(`Weight: ${shipment.total_weight ?? "-"}`, 14, y);
    y += 8;
    pdf.text(`Cost: ${shipment.total_cost ?? "-"}`, 14, y);
    y += 14;

    pdf.setFontSize(14);
    pdf.text("Tracking Items", 14, y);
    y += 10;
    pdf.setFontSize(11);

    if (trackingItems.length === 0) {
      pdf.text("No tracking items added.", 14, y);
    } else {
      trackingItems.forEach((item, index) => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }

        pdf.text(`${index + 1}. Tracking ID: ${item.tracking_id}`, 14, y);
        y += 7;
        pdf.text(`Courier: ${item.courier}`, 20, y);
        y += 7;
        pdf.text(`Weight: ${item.weight ?? "-"} | Status: ${item.status}`, 20, y);
        y += 7;
        pdf.text(`Confirmed: ${item.is_confirmed_by_agent ? "Yes" : "No"}`, 20, y);
        y += 10;
      });
    }

    pdf.save(`shipment-${shipment.id}.pdf`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={exportExcel}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export Excel
      </button>
      <button
        type="button"
        onClick={exportPdf}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <Download className="h-4 w-4" />
        Export PDF
      </button>
    </div>
  );
}
