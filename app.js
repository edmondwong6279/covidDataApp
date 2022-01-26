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

const Papa = require('papaparse');
const express = require('express');
// npm i node-fetch@2
const fetch = require('node-fetch');

const port = 3000;

// TODO implement a cache
let cache;

// creates an Express application
const server = express();

server.get('/deaths',          (req,res)=>handle(8, req,res));
server.get('/confirmed-cases', (req,res)=>handle(7, req,res));
server.get('/active',          (req,res)=>handle(10,req,res));
server.get('/recovered',       (req,res)=>handle(9, req,res));

const summariser = async (req,res,date,id) => {
    const fullUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/" + req.query.date + '.csv';
    const res1 = await fetch(fullUrl);
    const res2 = await res1.text();
    const parsedCSV = Papa.parse(res2)['data'];
    queryCountry = req.query.country;

    const reducer = (prev,curr) => {
        current = parseInt(curr[id]);
        if ((queryCountry === undefined || queryCountry === curr[3]) && !isNaN(current)) {
            prev += current;
        }
        return prev;
    };

    // initial value of 0
    const total = parsedCSV.reduce(reducer,0);
    res.send(total.toString());
    console.log('Successfully responded.')
    return;
}

const handle = (id, req, res) => {
    console.log('GET method requested');
    if (req.query.date === undefined) {
        console.log('NO DATE PROVIDED ')
        res.statusCode = 404;
        res.send('Must define date in query e.g. ?date=01-01-2022');
    } else {
        summariser(req,res, req.query.date, id);
    }
}

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
