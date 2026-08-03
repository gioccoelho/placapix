// Decodifica o payload de um QR Pix ESTÁTICO (BR Code / EMV)
export type DadosPix = {
  nome: string;
  chave: string;
  cidade: string;
};

// troca _ por espaço, remove espaços duplicados e capitaliza (Nome Próprio)
function formatarNome(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parsePix(payload: string): DadosPix {
  const parseTLV = (str: string): Record<string, string> => {
    const campos: Record<string, string> = {};
    let i = 0;
    while (i + 4 <= str.length) {
      const id = str.substring(i, i + 2);
      const len = parseInt(str.substring(i + 2, i + 4), 10);
      if (isNaN(len)) break;
      campos[id] = str.substring(i + 4, i + 4 + len);
      i += 4 + len;
    }
    return campos;
  };

  const top = parseTLV(payload);
  const merchant = top["26"] ? parseTLV(top["26"]) : {};

  return {
    chave: merchant["01"] || "",          // subtag 01 da tag 26 = chave Pix
    nome: formatarNome(top["59"] || ""),  // tag 59 = nome do recebedor
    cidade: formatarNome(top["60"] || ""),// tag 60 = cidade
  };
}