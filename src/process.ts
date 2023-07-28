import axios from "axios";
import { PDFExtract } from "pdf.js-extract";
interface PortalAccessData {
  token: string;
  plate: string;
  expiration: string;
}

const getAccessToken = async (placa: string, renavam: string) => {
  try {
    const response = await axios.post(
      "https://servicos.dnit.gov.br/auth-sior/renavam",
      {
        placa: placa,
        renavam: renavam,
      }
    );

    const { token, expiration, placa: plate } = response.data;
    return { token, expiration, plate } as PortalAccessData;

  } catch (error) {
    console.error("Erro ao obter o token:", error);
    throw error;
  }
};

const getInfractionData = async (token: string) => {
  try {
    const response = await axios.get(
      "https://servicos.dnit.gov.br/services-sior/portal-multas/infracoes",
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    for (const index of response.data.infracoes) {
    }

    return response.data.infracoes;

  } catch (error) {
    console.error("Erro ao obter os dados de infração:", error);
    throw error;
  }
};

const getPdfData = async (token: string, portalAccess: string, code: string, plate: string, auto: string) => {

  const URL_PDF = `https://servicos.dnit.gov.br/services-sior/gru/infracao/emitir?codigo=${code}&auto=${auto}&nomeUsuario=${plate}%20(Portal%20Multas)&token=${token}`;
  
  try {
    const response = await axios.get(
      URL_PDF, 
      {
        responseType: "arraybuffer",
        headers: {
          authorization: `Bearer ${token}`,
          cookie: portalAccess,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao obter os dados do PDF:", error);
    throw error;
  }
};

const convertToEncodedPortalAccess = (portalAccessData: PortalAccessData) => {
  const portalAccessJSON = JSON.stringify(portalAccessData);
  return encodeURIComponent(portalAccessJSON);
};

export const botDetrans = async () => {
  
  try {
    const { token, expiration, plate } = await getAccessToken("NEI9014", "538846933");

    const portalAccessData: PortalAccessData = { token, plate, expiration };
    const encodedPortalAccess = convertToEncodedPortalAccess(portalAccessData);

    const infractions = await getInfractionData(token);

    let auto = "";
    let code = "";
    
    for (const infraction of infractions) {
      auto = infraction.numeroAuto;
      code = infraction.codigoProcessoEncrypted;
    
      console.log("Auto de Infração:", auto);
      console.log("Descrição:", infraction.enquadramento);
      console.log("Veículo:", infraction.veiculoPlacaUF);
      console.log("Situação:", infraction.situacaoFase);
      console.log("Data e Hora:", infraction.dataHora);
      console.log("Amparo e Gravidade:", infraction.gravidade);
      console.log("Local:", infraction.local);
      console.log("Município:", infraction.municipio);
      console.log("Valor Original:", Number(infraction.valorMultaOriginal.replace(/\s*R\$\s*/, "").replace(/,/, "")));
    }

    const pdfExtract = new PDFExtract();
    const pdfData = await getPdfData(token, encodedPortalAccess, code, plate, auto);
    const extractedData = await pdfExtract.extractBuffer(pdfData, {
      firstPage: 0,
    });


    const amountCharged = Number(extractedData.pages[0].content.filter((_ , i) => {
      const index = extractedData.pages[0].content.findIndex((pdf) => pdf.str === "(=) Valor Cobrado")
      return index + 2 === i;
    })[0].str.replace(/,/, ""));
    
    const barcode = extractedData.pages[0].content.filter((_, i) => {
      const index = extractedData.pages[0].content.findIndex((t) => t.y === 547.044653688 && t.str.replace(/\D/g, ''));
      return index + 2 === i;
  })[0].str;

    console.log("Valor Cobrado:",amountCharged);
    console.log("Barcode:",barcode);
  } catch (error) {
    console.error("Ocorreu um erro:", error);
  }
};

botDetrans();
