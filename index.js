const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

async function extractData() {
  var pageTrail = '';
  var data = await fetchLeads(pageTrail);
  var pageTrail = data.pageTrail;
  var num_results = data.numFound;

  var csv_data = null;

  if (data.hasOwnProperty('result')) {
    console.log(`Results found: ${num_results}`);
    csv_data = [...data.result];
    num_results = num_results - 1000;
  } else {
    console.log('Invalid credentials, check your TOKEN!');
    return;
  }

  while (num_results > 0) {
    data = await fetchLeads(pageTrail);
    pageTrail = data.pageTrail;
    csv_data = [...csv_data, ...data.result];
    console.log(`Remaining results: ${num_results}`);
    num_results = num_results - 1000;
  }

  if (csv_data.length > 0) {
    saveDataToCSV(csv_data);
  }
}

async function fetchLeads(pageTrail) {
  const url = 'https://app.instantly.ai/leadsy/api/v1/find';
  const headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'content-type': 'application/json;charset=UTF-8',
    'sec-ch-ua': '"Opera GX";v="99", "Chromium";v="113", "Not-A.Brand";v="24"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'x-auth-jwt': process.env.TOKEN,
    'x-from-instantly': 'true',
    Referer: 'https://app.instantly.ai/app/lead-finder',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  // filters
  const body = JSON.stringify({
    limit: 1000,
    pageTrail: pageTrail,
    country: ['United States'],
    keywordFilter: 'paving',
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  const data = await response.json();
  return data;
}

function saveDataToCSV(data) {
  console.log('Savind Data...');
  console.log(data.length);
  const csvWriter = createCsvWriter({
    path: 'data.csv',
    header: Object.keys(data[0]).map((field) => ({ id: field, title: field })),
  });

  csvWriter
    .writeRecords(data)
    .then(() => console.log('CSV file successfully written.'))
    .catch((err) => console.error('Error writing CSV file:', err));
}

extractData();
