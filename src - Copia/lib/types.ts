export type Field = {
  imgUrl: string;
  qrCodeText: string;
  name: string;
  key: string;
  qtd: number;
  solicitante: string;
};

export type Placa = {
  fields: Field[];
};