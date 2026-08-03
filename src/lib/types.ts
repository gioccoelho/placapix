export interface Placa {
  fields: Values[];
}

interface Values {
  imgUrl: string;
  name: string;
  key: string;
  qtd: number;
  solicitante: string;
}
