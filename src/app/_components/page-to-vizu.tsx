"use client ";

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
}

export default function PageToVizu({ values, executeFetch }: PageToVizuProps) {
  const [name, setName] = React.useState<string>();
  const [currentPage, setCurrentPage] = React.useState(0);
  const itemsPerPage = 6;

  const allPlates = values.fields.flatMap((field) =>
    Array.from({ length: field.qtd }).map(() => ({
      imgUrl: field.imgUrl || "",
      name: field.name || "Nome do Beneficiado",
      key: field.key || "Chave Pix",
      solicitante: field.solicitante || "Nome do Solicitante",
    }))
  );

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const platesToShow = allPlates.slice(startIndex, endIndex);

  const totalPages = Math.ceil(allPlates.length / itemsPerPage);

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
    CreatePDF(values, handleUpdate, name as string);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dê um nome para a placa</CardTitle>
        <CardDescription>
          <Input
            value={name}
            type="text"
            placeholder="Qual o nome da placa?"
            onChange={(e) => setName(e.target.value)}
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="w-[450px] h-[650px] bg-white grid grid-cols-2 gap-4 justify-around py-4">
        {platesToShow.map((plate, index) => (
          <div key={index} className="flex flex-col gap-0.5 w-full">
            <span className="text-[8px] text-center">{plate.solicitante}</span>
            <div className="aspect-square border border-black flex flex-col py-2 items-center justify-center">
              <Image src={plate.imgUrl} alt="Plate" width={145} height={145} />
              <div className="flex flex-col">
                <span className="text-[9px] text-black">
                  Nome: {plate.name}
                </span>
                <span className="text-[9px] text-black">
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
