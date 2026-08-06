const { MSICreator } = require("electron-wix-msi");
const path = require("path");

const APP_DIR = path.resolve(__dirname, "./dist/PlacaPix-win32-x64");
const OUT_DIR = path.resolve(__dirname, "./installer");

const msiCreator = new MSICreator({
  appDirectory: APP_DIR,
  outputDirectory: OUT_DIR,
  description: "PlacaPix Sicoob Uberaba",
  exe: "Placa Pix",              // nome do .exe (sem extensão)
  name: "PlacaPix",
  manufacturer: "Sicoob Uberaba",
  version: "1.0.0",
  ui: { chooseDirectory: true }, // deixa o usuário escolher a pasta
});

msiCreator.create().then(() => msiCreator.compile());
