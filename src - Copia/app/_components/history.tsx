"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { List } from "lucide-react";
import React from "react";
import type { Placas } from "../page";
import { PDFDocument } from "pdf-lib";

interface Props {
  placas: Placas[];
}

export function HistoricoDePlacas({ placas }: Props) {
  const handleDownload = async (placa: string) => {
    try {
      const byteArray = Uint8Array.from(atob(placa), (char) =>
        char.charCodeAt(0),
      );

      const pdfDoc = await PDFDocument.load(byteArray);
      const pdfBlob = await pdfDoc.save();

      // CORREÇÃO: Cria uma nova visualização Uint8Array purificada
      // ou força o array nativo para o TypeScript não reclamar do SharedArrayBuffer
      const cleanUint8Array = new Uint8Array(Array.from(pdfBlob));

      const pdfUrl = URL.createObjectURL(
        new Blob([cleanUint8Array], { type: "application/pdf" }),
      );

      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `placa_${new Date().toISOString()}.pdf`;
      link.click();

      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <List /> Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        {placas.length > 0 ? (
          placas.map((placa) => (
            <div key={placa.placa} className="flex flex-col gap-2 w-full">
              <Button
                className="w-full mt-2"
                onClick={() => handleDownload(placa.placa)}
              >
                Placa: {placa.name} Criado em:{" "}
                {placa.createdAt.toLocaleString()}
              </Button>
            </div>
          ))
        ) : (
          <span>Não encontramos nenhuma placa...</span>
        )}
      </DialogContent>
    </Dialog>
  );
}
