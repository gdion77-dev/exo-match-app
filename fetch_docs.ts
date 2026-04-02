import axios from 'axios';

async function fetchDocs() {
  const res = await axios.get('http://s1sites.s1cloud.net/s1docs/goapi/docs/goapi.json');
  
  console.log("List Customer details:", JSON.stringify(res.data.paths['/s1services/list/customer'], null, 2));
}

fetchDocs();
