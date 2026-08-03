// Sem banco: guarda as placas no localStorage (persiste no disco do Electron)

// Formato entregue aos componentes (createdAt como Date)
export type PlacaCriada = {
  id: string;
  placa: string;   // o PDF em base64
  name: string;
  createdAt: Date;
};

// Formato guardado no localStorage (createdAt como string, pois JSON não tem Date)
type PlacaStored = {
  id: string;
  placa: string;
  name: string;
  createdAt: string;
};

const STORAGE_KEY = "placasCriadas";

function readAll(): PlacaStored[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeAll(placas: PlacaStored[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(placas));
}

export const SavePdfBase64 = (pdf: string, name: string): PlacaCriada => {
  const placas = readAll();
  const stored: PlacaStored = {
    id: crypto.randomUUID(),
    placa: pdf,
    name: name,
    createdAt: new Date().toISOString(),
  };
  placas.push(stored);
  writeAll(placas);

  // devolve com Date pro componente
  return { ...stored, createdAt: new Date(stored.createdAt) };
};

export const GetPlacasCriadas = (): PlacaCriada[] => {
  const date = new Date();
  const fourDaysAgo = new Date(date);
  fourDaysAgo.setDate(date.getDate() - 4);

  // filtra os com mais de 4 dias
  const placas = readAll().filter(
    (p) => new Date(p.createdAt) >= fourDaysAgo
  );

  writeAll(placas); // salva já limpo (continua string no storage)

  // entrega com createdAt como Date
  return placas.map((p) => ({ ...p, createdAt: new Date(p.createdAt) }));
};