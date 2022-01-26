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

// set up server (localhost). We can try each get request by navigating to localhost:PORT/path?query so for examples
// localhost:3000/deaths?date=2022-01-01

// TODO:
//  1. Fetch and parse the CSV once at the start instead of every api request:
//      a. Cache a large object and store them everytime we get some resource?
//      b. Each get method will need to check if the full path+query is already in the cache.

const https = require('https');
const Papa = require('papaparse');
const express = require('express');
// npm i node-fetch@2
const fetch = require('node-fetch');

const port = 3000;

// TODO implement a cache
let cache;

// creates an Express application
const server = express();

// http methods are per method instead of in the .createServer method
// We should use regular expressions to make sure our path is valid and it includes a date in the query
server.get(/\b(deaths|confirmed-cases|active|recovered)\b/,(req,res) => {
    // This regex seems to let through paths like /deaths/active. However, we deal with this in
    // the switch statement below.
    console.log('GET method requested');
    if (req.query.date === undefined) {
        console.log('NO DATE PROVIDED ')
        res.statusCode = 404;
        res.end('Must define date in query e.g. ?date=01-01-2022');
        return;
    }

    let index;

    switch (req._parsedUrl.pathname){
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
            res.statusCode = 404;
            res.send('Must define a valid path e.g. /deaths');
            return;
        }

    const fullUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/" + req.query.date + '.csv';
    // TODO is this the correct way to use the fetch api? Can't just assign it as data and then deal with it after
    // as fetch returns a promise, and we cannot await because we are dealing with everything inside .get which is
    // not an async function.
    fetch(fullUrl).then(
        res1 => res1.text()).then(
        res2 => {
            data = res2;
            const parsedCSV = Papa.parse(data)['data'];
            let total = 0;
            queryCountry = req.query.country;

            const reducer = (prev,curr) => {
                current = parseInt(curr[index]);
                if ((queryCountry === undefined || queryCountry === curr[3]) && !isNaN(current)) {
                    total += current;
                }
            };
            parsedCSV.reduce(reducer);
            res.send(total.toString());
            console.log('Successfully responded.')
        })
})

server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});
