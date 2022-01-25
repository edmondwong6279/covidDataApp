### Covid-19 Data API

An API that implements these endpoints:

```
GET /confirmed-cases
GET /deaths
GET /active
GET /recovered
```

And returns the relevant statistic for the specified country code and date if available. e.g. This request

```
GET /active?country=Albania&date=2021-12-01
```

would return the active case count for the Albania on Dec 1st 2021.

Use data from this [repo](https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data) or another source if you find one.
