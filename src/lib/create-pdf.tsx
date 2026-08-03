import { PDFDocument, rgb } from "pdf-lib";
import type { Placa } from "./types";
import { SavePdfBase64 } from "@/app/_actions";

export async function CreatePDF(
  values: Placa,
  onCreate: () => void,
  name: string,
  size: "grande" | "pequena" = "grande",
) {
  const pdfDoc = await PDFDocument.create();

  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;

  // presets de tamanho
  const PRESETS = {
    grande: { squareSize: 240, columns: 2, rows: 3 }, // QR 192pt (original)
    pequena: { squareSize: 168.75, columns: 3, rows: 4 }, // QR 135pt (igual ao exemplo)
  };
  const { squareSize, columns, rows } = PRESETS[size];

  const margin = 10;
  const padding = 20;
  const itemsPerPage = columns * rows;

  const horizontalSpace =
    (A4_WIDTH - columns * squareSize - padding * (columns - 1)) / 2;

  const topStart = A4_HEIGHT - 20;

  // qtd sempre no minimo 1
  const allFields = values.fields.flatMap((field) => {
    const qtd = Math.max(1, Number(field.qtd) || 1);
    return Array.from({ length: qtd }).map(() => field);
  });

  for (
    let pageIndex = 0;
    pageIndex < Math.ceil(allFields.length / itemsPerPage);
    pageIndex++
  ) {
    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

    for (let i = 0; i < itemsPerPage; i++) {
      const index = pageIndex * itemsPerPage + i;
      if (index >= allFields.length) break;

      const field = allFields[index];
      const row = Math.floor(i / columns);
      const col = i % columns;

      const x = horizontalSpace + col * (squareSize + padding);
      const y = topStart - row * (squareSize + padding);

      // Desenhar o quadrado
      page.drawRectangle({
        x: x,
        y: y - squareSize,
        width: squareSize,
        height: squareSize,
        borderColor: rgb(0, 0, 0),
        borderWidth: 3,
      });

      // QR Code (80% do quadrado)
      const qrCodeSize = squareSize * 0.8;

      if (field.imgUrl) {
        const qrImageBytes = await fetch(field.imgUrl).then((res) =>
          res.arrayBuffer(),
        );
        const qrImage = await pdfDoc.embedPng(qrImageBytes);

        page.drawImage(qrImage, {
          x: x + (squareSize - qrCodeSize) / 2,
          y: y - margin - qrCodeSize,
          width: qrCodeSize,
          height: qrCodeSize,
        });
      }

      // Textos
      const textSize = 10;
      const textYPosition = y - squareSize + margin + 35;

      if (field.solicitante) {
        page.drawText(`Solicitante: ${field.solicitante}`, {
          x: x + squareSize / 20,
          y: y + 5,
          size: textSize,
          color: rgb(0, 0, 0),
        });
      }

      if (field.name) {
        page.drawText(`Nome: ${field.name}`, {
          x: x + squareSize / 20,
          y: textYPosition - 15,
          size: textSize,
          color: rgb(0, 0, 0),
        });
      }

      if (field.key) {
        page.drawText(`Chave: ${field.key}`, {
          x: x + squareSize / 20,
          y: textYPosition - 30,
          size: textSize,
          color: rgb(0, 0, 0),
        });
      }
    }
  }

  // Salvar o PDF como Uint8Array
  const pdfBytes = await pdfDoc.save();

  // Converter para base64 e salvar no historico
  let binaryString = "";
  for (let i = 0; i < pdfBytes.length; i++) {
    binaryString += String.fromCharCode(pdfBytes[i]);
  }
  const pdfBase64 = btoa(binaryString);

  const save = await SavePdfBase64(pdfBase64, name);

  if (save) {
    onCreate();
  }

  // Download
  const byteNumbers = new Array(pdfBytes.length);
  for (let i = 0; i < pdfBytes.length; i++) {
    byteNumbers[i] = pdfBytes[i];
  }
  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], { type: "application/pdf" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "example_a4.pdf";
  link.click();

  URL.revokeObjectURL(link.href);

  return blob;
}
