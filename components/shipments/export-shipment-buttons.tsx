"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
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
        "Product Name": item.product_name ?? "",
        Courier: item.courier,
        Weight: item.weight ?? "",
        Cost: item.cost ?? "",
        Status: item.status,
        Comment: item.comment ?? "",
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
        pdf.text(`Product: ${item.product_name ?? "-"}`, 20, y);
        y += 7;
        pdf.text(`Courier: ${item.courier}`, 20, y);
        y += 7;
        pdf.text(`Weight: ${item.weight ?? "-"} | Cost: ${item.cost ?? "-"} | Status: ${item.status}`, 20, y);
        y += 7;
        pdf.text(`Comment: ${item.comment ?? "-"}`, 20, y);
        y += 7;
        pdf.text(`Confirmed: ${item.is_confirmed_by_agent ? "Yes" : "No"}`, 20, y);
        y += 10;
      });
    }

    pdf.save(`shipment-${shipment.id}.pdf`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={exportExcel} variant="secondary" icon={<FileSpreadsheet className="h-4 w-4" />}>
        Export Excel
      </Button>
      <Button type="button" onClick={exportPdf} variant="secondary" icon={<Download className="h-4 w-4" />}>
        Export PDF
      </Button>
    </div>
  );
}
