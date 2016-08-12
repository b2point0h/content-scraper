"use strict";

// Content scraper application. Runs once a day

// Scraped info should be stored in a CSV with today's date in proper format '2016-08-12.csv'

// Use third party npm package to scrape the content, explain why I chose it. *Store content in JSON format*

// Scraper should visit input URL like 'shirts4mike.com', and follow links to all t-shirts

// Scraper should get, 'price', 'title', 'url', 'image url'

// Use third party NPM package to create the CSV file (ideally from JSON), explain why I chose it

// CSV column headers should be in this order, 'Title', 'Price', 'ImageURL', 'URL', 'Time'.
// Time should be current datetime ( var date = new Date(); )

// If site is down (http code is anything but 200), error message should console.log(error)

// If data file for today exists, overwrite the file


// * EXTRA CREDIT * //

// 1. Add ESLint to the application. Should be able to run npm run lint to check code

// 2. When an error occurs, log it to scraper-error.log. It should append the error to bottom of the file with a timestamp and error