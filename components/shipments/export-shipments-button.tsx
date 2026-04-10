"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
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
    <Button type="button" onClick={handleExport} variant="secondary" icon={<Download className="h-4 w-4" />}>
      Export Excel
    </Button>
  );
}
