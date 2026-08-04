"use client";

import React from "react";
import { UploadCloud, FileCheck2 } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
}

export function Dropzone({ onFile }: Props) {
  const [dragging, setDragging] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handle = (file?: File | null) => {
    if (file) {
      setFileName(file.name);
      onFile(file);
    }
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
      className={`flex flex-col items-center justify-center gap-1 px-3 py-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors min-w-[150px] ${
        dragging
          ? "border-primary bg-primary/10"
          : fileName
            ? "border-green-500/60 bg-green-500/5"
            : "border-muted-foreground/30 hover:border-primary/50"
      }`}
    >
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
            Arraste o arquivo
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
