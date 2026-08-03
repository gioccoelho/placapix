// Histórico das placas no IndexedDB (aguenta centenas de MB, sem servidor)
export type PlacaCriada = {
  id: string;
  placa: string; // PDF em base64
  name: string;
  createdAt: Date;
};

const DB_NAME = "placapix";
const STORE = "placasCriadas";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("sem window");
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const SavePdfBase64 = async (
  pdf: string,
  name: string
): Promise<PlacaCriada> => {
  const db = await openDB();
  const registro = {
    id: crypto.randomUUID(),
    placa: pdf,
    name,
    createdAt: new Date().toISOString(),
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(registro);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return { ...registro, createdAt: new Date(registro.createdAt) };
};

export const GetPlacasCriadas = async (): Promise<PlacaCriada[]> => {
  const db = await openDB();

  const todas: any[] = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  const date = new Date();
  const fourDaysAgo = new Date(date);
  fourDaysAgo.setDate(date.getDate() - 4);

  const validas = todas.filter((p) => new Date(p.createdAt) >= fourDaysAgo);
  const vencidas = todas.filter((p) => new Date(p.createdAt) < fourDaysAgo);

  if (vencidas.length > 0) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      vencidas.forEach((p) => store.delete(p.id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  return validas.map((p) => ({ ...p, createdAt: new Date(p.createdAt) }));
};