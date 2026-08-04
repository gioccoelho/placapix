"use client";

import React from "react";
import { UploadCloud, FileCheck2, X } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
  onClear?: () => void;
}

export function Dropzone({ onFile, onClear }: Props) {
  const [dragging, setDragging] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handle = (file?: File | null) => {
    if (file) {
      setFileName(file.name);
      onFile(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // nao abre o seletor ao clicar no X
    setFileName(null);
    if (inputRef.current) inputRef.current.value = ""; // permite re-selecionar o mesmo arquivo
    onClear?.();
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files?.[0]);
      }}
      className={`relative flex flex-col items-center justify-center gap-1 px-3 py-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors min-w-[150px] ${
        dragging
          ? "border-primary bg-primary/10"
          : fileName
            ? "border-green-500/60 bg-green-500/5"
            : "border-muted-foreground/30 hover:border-primary/50"
      }`}
    >
      {fileName && (
        <button
          type="button"
          onClick={handleClear}
          title="Limpar arquivo"
          className="absolute top-1 right-1 rounded-full p-0.5 text-muted-foreground hover:bg-red-500 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {fileName ? (
        <>
          <FileCheck2 className="h-5 w-5 text-green-600" />
          <span className="text-[11px] text-center text-green-700 line-clamp-2">
            {fileName}
          </span>
        </>
      ) : (
        <>
          <UploadCloud className="h-5 w-5 text-muted-foreground" />
          <span className="text-[11px] text-center text-muted-foreground leading-tight">
            Arraste o PDF/imagem
            <br />
            ou clique para selecionar
          </span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </div>
  );
}
