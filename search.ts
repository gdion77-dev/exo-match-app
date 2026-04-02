import axios from 'axios';

async function search() {
  try {
    const res = await axios.get('https://raw.githubusercontent.com/search?q=RgWsPublic2+gsis');
    console.log(res.data);
  } catch(e: any) {
    console.log("Error", e.response?.status);
  }
}
search();
