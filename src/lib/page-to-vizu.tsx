"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreatePDF } from "@/lib/create-pdf";
import type { Placa } from "@/lib/types";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import React from "react";

export interface PageToVizuProps {
  values: Placa;
  executeFetch: () => void;
  tamanho?: "grande" | "pequena";
}

export default function PageToVizu({
  values,
  executeFetch,
  tamanho = "grande",
}: PageToVizuProps) {
  const [name, setName] = React.useState<string>();
  const [currentPage, setCurrentPage] = React.useState(0);

  // preview acompanha o tamanho: grande = 6/pag (2 col), pequena = 12/pag (3 col)
  const itemsPerPage = tamanho === "pequena" ? 12 : 6;
  const gridColsClass = tamanho === "pequena" ? "grid-cols-3" : "grid-cols-2";
  const imgSize = tamanho === "pequena" ? 90 : 145;
  const textSizeClass = tamanho === "pequena" ? "text-[7px]" : "text-[9px]";

  const allPlates = (values.fields || []).flatMap((field) =>
    Array.from({ length: Math.max(1, Number(field.qtd) || 1) }).map(() => ({
      imgUrl: field.imgUrl || "",
      name: field.name || "Nome do Beneficiado",
      key: field.key || "Chave Pix",
      solicitante: field.solicitante || "Nome do Solicitante",
    })),
  );

  const totalPages = Math.max(1, Math.ceil(allPlates.length / itemsPerPage));

  // se mudar o tamanho/qtd e a pagina atual ficar fora do range, volta pra 0
  React.useEffect(() => {
    if (currentPage > totalPages - 1) setCurrentPage(0);
  }, [currentPage, totalPages]);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const platesToShow = allPlates.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };

  const handleUpdate = () => {
    executeFetch();
  };

  const handleCreatePdf = () => {
    CreatePDF(values, handleUpdate, name as string, tamanho);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>De um nome para a placa</CardTitle>
        <CardDescription>
          <Input
            value={name || ""}
            type="text"
            placeholder="Qual o nome da placa?"
            onChange={(e) => setName(e.target.value)}
          />
        </CardDescription>
      </CardHeader>
      <CardContent
        className={`w-[450px] h-[650px] bg-white grid ${gridColsClass} gap-4 justify-around py-4 content-start overflow-hidden`}
      >
        {platesToShow.map((plate, index) => (
          <div key={index} className="flex flex-col gap-0.5 w-full">
            <span className={`${textSizeClass} text-center`}>
              {plate.solicitante}
            </span>
            <div className="aspect-square border border-black flex flex-col py-2 items-center justify-center">
              {plate.imgUrl ? (
                <Image
                  src={plate.imgUrl}
                  alt="Plate"
                  width={imgSize}
                  height={imgSize}
                  unoptimized
                />
              ) : null}
              <div className="flex flex-col">
                <span className={`${textSizeClass} text-black`}>
                  Nome: {plate.name}
                </span>
                <span className={`${textSizeClass} text-black`}>
                  Chave: {plate.key}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex flex-row gap-6 justify-center items-center mt-6">
        <Button onClick={handlePreviousPage} disabled={currentPage === 0}>
          <ArrowLeft />
        </Button>
        <Button
          onClick={() => handleCreatePdf()}
          type="button"
          className="w-full"
          disabled={!name}
        >
          {name ? "Criar PDF" : "Insira o nome da placa"}
        </Button>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
        >
          <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}
