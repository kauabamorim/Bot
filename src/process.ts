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
    console.log(token);

  } catch (error) {
    console.log(error);
  }
};
