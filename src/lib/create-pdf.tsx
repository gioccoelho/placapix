import { PDFDocument, rgb } from "pdf-lib";
import type { Placa } from "./types";
import { SavePdfBase64 } from "@/app/_actions";

export async function CreatePDF(
  values: Placa,
  onCreate: () => void,
  name: string,
) {
  const pdfDoc = await PDFDocument.create();

  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;

  const squareSize = 240;
  const margin = 10; // Margem interna para espaçamento
  const padding = 20;

  const columns = 2;
  const rows = 3;
  const itemsPerPage = columns * rows;

  const horizontalSpace =
    (A4_WIDTH - columns * squareSize - padding * (columns - 1)) / 2;

  const topStart = A4_HEIGHT - 20; // Margem superior ajustada

  // Expandir os campos com base na quantidade (qtd)
  const allFields = values.fields.flatMap((field) =>
    Array.from({ length: field.qtd }).map(() => field),
  );

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
      const y = topStart - row * (squareSize + padding); // Começa no topo e ajusta cada linha

      // Desenhar o quadrado
      page.drawRectangle({
        x: x,
        y: y - squareSize,
        width: squareSize,
        height: squareSize,
        borderColor: rgb(0, 0, 0),
        borderWidth: 3,
      });

      // QR Code ajustado (tamanho menor para criar espaço para textos)
      const qrCodeSize = squareSize * 0.8; // 80% do tamanho do quadrado

      if (field.imgUrl) {
        const qrImageBytes = await fetch(field.imgUrl).then((res) =>
          res.arrayBuffer(),
        );
        const qrImage = await pdfDoc.embedPng(qrImageBytes);

        // Centralizar o QR Code dentro do quadrado
        page.drawImage(qrImage, {
          x: x + (squareSize - qrCodeSize) / 2,
          y: y - margin - qrCodeSize, // Posicionado no topo do quadrado
          width: qrCodeSize,
          height: qrCodeSize,
        });
      }

      // Textos centralizados
      const textSize = 10; // Tamanho do texto para ambos
      const textYPosition = y - squareSize + margin + 35; // Posição base para textos

      if (field.solicitante) {
        page.drawText(`Solicitante: ${field.solicitante}`, {
          x: x + squareSize / 20,
          y: y + 5, // Acima do QR code com espaçamento de 0.5
          size: textSize,
          color: rgb(0, 0, 0),
        });
      }

      // Desenhar o nome
      if (field.name) {
        page.drawText(`Nome: ${field.name}`, {
          x: x + squareSize / 20,
          y: textYPosition - 15,
          size: textSize,
          color: rgb(0, 0, 0),
        });
      }

      // Desenhar a chave
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

  // Salvar o PDF como um Uint8Array
  const pdfBytes = await pdfDoc.save();

  let binaryString = "";
  for (let i = 0; i < pdfBytes.length; i++) {
    binaryString += String.fromCharCode(pdfBytes[i]);
  }
  const pdfBase64 = btoa(binaryString);

  // Agora salve o PDF em Base64 no banco de dados usando o Prisma
  const save = await SavePdfBase64(pdfBase64, name); // Salvar a string Base64

  if (save) {
    onCreate();
  }

  // ==========================================
  // CORREÇÃO DO ERRO DE TIPO AQUI:
  // ==========================================
  // Reconvertemos a string binária em um Array comum aceito pelo TypeScript do Next 15
  const byteNumbers = new Array(pdfBytes.length);
  for (let i = 0; i < pdfBytes.length; i++) {
    byteNumbers[i] = pdfBytes[i];
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Agora passamos o byteArray purificado sem SharedArrayBuffer
  const blob = new Blob([byteArray], { type: "application/pdf" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "example_a4.pdf";
  link.click();

  URL.revokeObjectURL(link.href);

  return blob;
}
