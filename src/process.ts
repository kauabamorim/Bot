import axios from "axios";

export const botDetrans = async () => {
  let token = "";
  
  try {
    const response = await axios.post(
      "https://servicos.dnit.gov.br/auth-sior/renavam",
      {
        placa: "OZG7778",
        renavam: "1011222229",
      }
    );

    token = response.data.token;

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
};