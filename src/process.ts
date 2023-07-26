import axios from "axios";
import { PDFExtract } from "pdf.js-extract";

interface PortalAccessData {
  token: string;
  plate: string;
  expiration: string;
}

const getAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://servicos.dnit.gov.br/auth-sior/renavam",
      {
        placa: "OZG7778",
        renavam: "1011222229",
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

    return response.data.infracoes;
  } catch (error) {
    console.error("Erro ao obter os dados de infração:", error);
    throw error;
  }
};

const getPdfData = async (token: string, portalAccess: string) => {
  try {
    const response = await axios.get(
      "", 
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
    const { token, expiration, plate } = await getAccessToken();

    const portalAccessData: PortalAccessData = { token, plate, expiration };
    const encodedPortalAccess = convertToEncodedPortalAccess(portalAccessData);

    const infractions = await getInfractionData(token);
    const firstInfraction = infractions[0];

    console.log("Auto de Infração:", firstInfraction.numeroAuto);
    console.log("Descrição:", firstInfraction.enquadramento);
    console.log("Veículo:", firstInfraction.veiculoPlacaUF);
    console.log("Situação:", firstInfraction.situacaoFase);
    console.log("Data e Hora:", firstInfraction.dataHora);
    console.log("Amparo e Gravidade:", firstInfraction.gravidade);
    console.log("Local:", firstInfraction.local);
    console.log("Município:", firstInfraction.municipio);
    console.log("Valor Original:", firstInfraction.valorMultaOriginal);

    const pdfExtract = new PDFExtract();
    const pdfData = await getPdfData(token, encodedPortalAccess);
    const extractedData = await pdfExtract.extractBuffer(pdfData, {
      firstPage: 0,
    });

    const contentPDF = extractedData.pages[0].content;
    console.log(contentPDF)

  } catch (error) {
    console.error("Ocorreu um erro:", error);
  }
};
