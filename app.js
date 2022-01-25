// Data to be used from csv's pushed to this git repo:
// https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/

// Daily figures in csv's in this format:
// https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_daily_reports/MM-DD-YYYY.csv

//CSV Fields:
// - FIPS 
// - Admin2
// - Province_State
// - Country_Region
// - Last Update
// - Lat
// - Long_
// - Confirmed
// - Deaths
// - Recovered
// - Active
// - Combined_Key
// - Incident Rate
// - Case_Fatality_Ratio

// We are only interested in:
// GET /confirmed-cases
// GET /deaths
// GET /active
// GET /recovered

// path  /active
// query ?country=Albania&date=2021-12-01

// set up server (localhost). We can try each get request by navigating to localhost:PORT/path?query so for example
// localhost:3000/deaths?date=2022-01-01

// 1. Implement with no query, just path. So we can see TOTAL numbers for each of the interested fields.
// 2. Add in some query string stuff for subsequent fields


const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const Papa = require('papaparse');

const port = 3000;

// create non-secure http server so we can easily access localhost
const server = http.createServer((req, res) => {
    const { method } = req;
    switch(method){
        case 'GET':
            return handleGetRequest(req,res);
        default:
            throw new Error(`Unsupported request method ${method}`);
    }

    res.end('Server is running!');
});

const handleGetRequest = (request,response) => {
    // Separate the request information here:
    const splitUrl = request.url.split('?');
    const path = splitUrl[0];
    const querystr = splitUrl[1];
    const query = querystring.parse(querystr);

    if (query['date'] === undefined){
        response.statusCode = 404;
        response.end('Must define date in query e.g. ?date=01-01-2022');
        return;
    }

    const options = {
      hostname: 'raw.githubusercontent.com',
      path: '/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/',
      method: 'GET',
      headers: {
        'Content-Type': 'text/csv'
      }
    }
    let index;

    switch (path){
        case '/confirmed-cases':
            index = 7;
            break;
        case '/deaths':
            index = 8;
            break;
        case '/active':
            index = 10;
            break;
        case '/recovered':
            index = 9;
            break;
        default:
            response.statusCode = 404;
            response.end('Must define a valid path e.g. /deaths');
            return;
        }

        // PRECONDITION: Need the date before making the request as each csv is named by date.
        options['path'] += query['date']+'.csv'

        const req = https.request(options, res => {
            let dataIn = '';
            res.on('data', (newData) => {
                dataIn += newData;
            });

            res.on('end',  () => {
                const parsedCSV = Papa.parse(dataIn)['data'];
                let total = 0;

                queryCountry = query['country'];

                for (let i=1; i < parsedCSV.length; i++){
                    let current = parseInt(parsedCSV[i][index]);
                    let country = parsedCSV[i][3];

                    // Some numbers are missing so we only add the valid ones.
                    // Also, only sum if there is no country specified, or if it IS the country specified.
                    if (!isNaN(current) && (queryCountry === undefined || queryCountry === country)){
                        total += current;
                    }
                }
                response.end(total.toString());
            });
        })
        req.end()
        console.log('Successfully responded.')

}

server.listen(port, () => {
    const { address, port } = server.address();
    console.log(`Server listening at ${address} on port ${port}`)
});
