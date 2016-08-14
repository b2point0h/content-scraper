Website Scraping Application
================================

## Requirements

- [X] Create a scraper.js. This should be the file run every day.

- [X] The scraper should generate a folder called data if it doesn’t exist.

- [X] The information from the site should be stored in a CSV file with today’s day e.g. 2016-01-29.csv.

- [X] Use a third party npm package to scrape content from the site. You should be able to explain why you chose that package.

- [X] The scraper should be able to visit the website http://shirts4mike.com and follow links to all t-shirts.

- [X] The scraper should get the price, title, url and image url from the product page and save it in the CSV.

- [X] Use a third party npm package to create an CSV file. You should be able to explain why you chose that package.

- [X] The column headers should be in in this order Title, Price, ImageURL, URL and Time. Time should be the current date time of when the scrape happened. If they aren’t in this order the can’t be entered into the database of the price comparison site.

- [X] If the site is down, an error message describing the issue should appear in the console. This is to be tested by disabling wifi on your device.

- [X] If the data file for today already exists it should overwrite the file.

- [X] Code should be well documented.


## Extra Credit

- [X] Use a linting tool like ESLint to check your code for syntax errors and to ensure general code quality. You should be able to run npm run lint to check your code.

- [X] When an error occurs log it to a file scraper-error.log . It should append to the bottom of the file with a time stamp and error e.g. [Tue Feb 16 2016 10:02:12 GMT-0800 (PST)] <error message>