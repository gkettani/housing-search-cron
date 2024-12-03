# Housing search cron
This experimental project automates periodic searches for housing listings and processes the results. This service is designed to scrape, fetch, or query housing data from online sources, process the information, and store it for later use or notification.

## Usage:

### Database
Run a query against a local D1 database
```sh
npx wrangler d1 execute prod-housing --local --file=./schema.sql
```
or
```sh
npx wrangler d1 execute prod-housing --local --command="SELECT * FROM links"
```

Deploy a database
````sh
npx wrangler d1 execute prod-d1-tutorial --remote --file=./schema.sql
```
or
```sh
npx wrangler d1 execute prod-d1-tutorial --remote --command="SELECT * FROM links"
```