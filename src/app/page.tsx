"use client";

import React from "react";
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
import { BadgeMinus, Eye, PlusCircle } from "lucide-react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import type { Placa } from "@/lib/types";
import PageToVizu from "./_components/page-to-vizu";
import { BrowserQRCodeReader } from "@zxing/browser";
import QRCode from "qrcode";
import { HistoricoDePlacas } from "./_components/history";
import { GetPlacasCriadas } from "./_actions";
import { parsePix } from "@/lib/parse-pix";
import { Dropzone } from "./_components/dropzone";

export type Placas = {
  placa: string;
  createdAt: Date;
  name: string;
};

export default function Home() {
  const { control, register, setValue } = useForm<Placa>({
    defaultValues: {
      fields: [
        {
          imgUrl: "",
          qrCodeText: "",
          name: "",
          key: "",
          qtd: 1,
          solicitante: "",
        },
      ],
    },
  });

  const [placas, setPlacas] = React.useState<Placas[]>([]);
  const [tamanho, setTamanho] = React.useState<"grande" | "pequena">("grande");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  // valores AO VIVO do formulario -> preview dinamico
  const watchedFields = useWatch({ control, name: "fields" });
  const livePlaca: Placa = { fields: watchedFields || [] };

  const handleFileChange = async (file: File, index: number) => {
    const reader = new FileReader();

    reader.onload = async () => {
      if (reader.result) {
        const imgUrl = reader.result.toString();
        setValue(`fields.${index}.imgUrl`, imgUrl);

        try {
          const codeReader = new BrowserQRCodeReader();
          const result = await codeReader.decodeFromImageUrl(imgUrl);

          if (result) {
            const qrCodeContent = result.getText();
            setValue(`fields.${index}.qrCodeText`, qrCodeContent);

            // auto-preenche nome e chave a partir do proprio QR
            const dados = parsePix(qrCodeContent);
            if (dados.nome) setValue(`fields.${index}.name`, dados.nome);
            if (dados.chave) setValue(`fields.${index}.key`, dados.chave);

            try {
              const generatedQRCode = await QRCode.toDataURL(qrCodeContent);
              setValue(`fields.${index}.imgUrl`, generatedQRCode);
            } catch (err) {
              console.error("Erro ao gerar QR Code:", err);
            }
          }
        } catch (error) {
          console.error("QR Code nao detectado:", error);
          setValue(
            `fields.${index}.qrCodeText`,
            "QR Code invalido ou nao encontrado.",
          );
        }
      }
    };

    reader.readAsDataURL(file);
  };

  const handleRemove = (index: number) => {
    remove(index);
  };

  const fetchPlacas = async () => {
    const res = await GetPlacasCriadas();
    setPlacas(res);
  };

  React.useEffect(() => {
    fetchPlacas();
  }, []);

  return (
    <div className="flex flex-row gap-6 items-center justify-center min-h-screen p-6">
      <Card>
        <CardHeader>
          <CardTitle>Placa Pix Sicoob Uberaba</CardTitle>
          <CardDescription>
            Arraste a imagem do QR (ou clique para selecionar). Nome e chave sao
            preenchidos automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 justify-around">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-row gap-3 items-center rounded-xl border p-3"
            >
              <Dropzone onFile={(file) => handleFileChange(file, index)} />

              <div className="flex flex-1 flex-col gap-2">
                <Input
                  type="text"
                  required
                  placeholder="Nome do Beneficiado"
                  {...register(`fields.${index}.name`)}
                />
                <Input
                  type="text"
                  required
                  placeholder="Chave Pix"
                  {...register(`fields.${index}.key`)}
                />
                <div className="flex flex-row gap-2">
                  <Input
                    className="max-w-24"
                    type="number"
                    required
                    min={1}
                    placeholder="Qtd"
                    defaultValue={1}
                    {...register(`fields.${index}.qtd`, {
                      valueAsNumber: true,
                      min: 1,
                    })}
                  />
                  <Input
                    type="text"
                    required
                    placeholder="Nome do Solicitante"
                    {...register(`fields.${index}.solicitante`)}
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemove(index)}
                    variant={"destructive"}
                    size="icon"
                  >
                    <BadgeMinus />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {/* Seletor de tamanho */}
          <div className="flex flex-row gap-2 w-full justify-center">
            <Button
              type="button"
              size="sm"
              variant={tamanho === "grande" ? "default" : "outline"}
              onClick={() => setTamanho("grande")}
            >
              Grande
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tamanho === "pequena" ? "default" : "outline"}
              onClick={() => setTamanho("pequena")}
            >
              Pequena
            </Button>
          </div>

          <div className="flex flex-row gap-2 w-full">
            <HistoricoDePlacas placas={placas} />
            <Button
              variant={"outline"}
              onClick={() =>
                append({
                  imgUrl: "",
                  qrCodeText: "",
                  name: "",
                  key: "",
                  qtd: 1,
                  solicitante: "",
                })
              }
              type="button"
              className="w-full"
            >
              <PlusCircle /> Adicionar campo
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Preview dinamico: atualiza sozinho ao mudar qtd/tamanho/dados */}
      <PageToVizu
        values={livePlaca}
        executeFetch={fetchPlacas}
        tamanho={tamanho}
      />
    </div>
  );
}
