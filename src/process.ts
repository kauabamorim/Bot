import axios from "axios";
import { PDFExtract } from "pdf.js-extract";

export const botDetrans = async () => {
  let token,
    expiration,
    plate,
    encodedPortalAccess = "";

  try {
    const response = await axios.post(
      "https://servicos.dnit.gov.br/auth-sior/renavam",
      {
        placa: "OZG7778",
        renavam: "1011222229",
      }
    );

    token = response.data.token;
    expiration = response.data.expiration;
    plate = response.data.placa;

    const portalAccess = {
      token,
      plate,
      expiration,
    };

    // Convertendo o objeto para uma string JSON
    const portalAccessJSON = JSON.stringify(portalAccess);
    encodedPortalAccess = encodeURIComponent(portalAccessJSON);

  } catch (error) {
    console.log(error);
  }

  try {
    const response = await axios.get(
      "https://servicos.dnit.gov.br/services-sior/portal-multas/infracoes",
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    const infractions = response.data.infracoes;
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
  } catch (error) {
    console.error(error);
  }

  const pdfExtract = new PDFExtract();

  try {
    const response = await axios.get(
      "https://servicos.dnit.gov.br/services-sior/gru/infracao/emitir?codigo=Dc2vDN0Kv-qeRFV_HHSj6Q==&auto=S029956158&nomeUsuario=OZG7778%20(Portal%20Multas)&token=eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiItMSIsIlVzZXJOYW1lIjoiIiwiRW1haWwiOiIiLCJCaXJ0aGRhdGUiOiIiLCJQbGFjYSI6Ik9aRzc3NzgiLCJSZW5hdmFtIjoiMTAxMTIyMjIyOSIsIlVzZXJUeXBlIjoiUG9ydGFsUGxhY2EiLCJDcGZDbnBqIjoiIiwiWC1DbGllbnRJZCI6Ik9aRzc3NzgtMTAxMTIyMjIyOSIsImV4cCI6MTY5MDM1NjQ3OSwiaXNzIjoiUG9ydGFsTXVsdGFzRE5JVCJ9.CVSQQXaHfz_6FTYnXIzvVISfUzunt2KtkQScmkMq8ow",
      {
        responseType: "arraybuffer",
        headers: {
          portalAccess: encodedPortalAccess,
        },
      }
    );

    const pdfData = response.data;
    const extractedData = await pdfExtract.extractBuffer(pdfData, {
      firstPage: 0,
    });
    console.log(extractedData);
  } catch (error) {
    console.log(error);
  }

};
