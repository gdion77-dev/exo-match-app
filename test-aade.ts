import axios from 'axios';

async function test() {
  try {
    const response = await axios.post(
      'https://www1.gsis.gr/wsaade/RgWsPublic2/RgWsPublic2',
      '<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/"><env:Body></env:Body></env:Envelope>',
      { 
        headers: { 
          'Content-Type': 'text/xml;charset=UTF-8',
        } 
      }
    );
    console.log("STATUS:", response.status);
    console.log("DATA:", response.data.substring(0, 200));
  } catch (e: any) {
    console.log("ERROR STATUS:", e.response?.status);
    console.log("ERROR DATA:", e.response?.data?.substring(0, 200));
  }
}
test();
