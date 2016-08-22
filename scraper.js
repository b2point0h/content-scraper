"use strict";

// Node required modules
var request = require("request"); // Allows us to make HTTP calls
var cheerio = require("cheerio"); // Allows us to traverse DOM using jQuery syntax. I chose this package because cheerio allows us to write jQuery like syntax for traversing DOM elements easilly.
var json2csv = require("json2csv"); // Converts the json object we create into a CSV. I chose this package because it has many releases and is actively maintained.
var moment = require("moment"); // Easy formatting of Date/Time stamp
var fs = require("fs"); // Allows us to write files

var errorHandler = function(error) { // Error Handling function
  // console.log("The scraper had an issue with " + url + ". Either the site is down or your connection is bad.");
  var errorDate = new Date();
  var errorLog = "[" + errorDate + "] " + error.message + "\n"; // Create the formatted error message with date
  fs.appendFile("scrape-error.log", errorLog, function(err) { // Write the file
    if (err) throw err;
    // console.log("There was an error. It has been logged to scrape-error.log");
  });
};

// Globals
var url = "http://shirts4mike.com/";
var totalShirts = new Array(); // We create an empty array to push the shirts data to, for using in the json2csv convert
var shirtsToScrape = new Set(); // The Set allows us to pass shirts we want to scrape, but won't create duplicates. Pretty awesome!
var shirtsSeen = []; // To log all the shirt links we've seen in total
var csvHeaders = ["Title", "Price", "ImageURL", "URL", "Time", ];

request(url, function (error, response, html) { // Initial request to the URL
  if (!error && response.statusCode == 200) { // If we get anything but a successful 200 HTTP code, log the error and stop the program
    var $ = cheerio.load(html);
      $("a[href*=shirt]").each(function() { // Find all URLs with the word shirt
        shirtsToScrape.add($(this).attr("href")); // Add those URLS to the shirtsToScrape Set
        if (shirtsSeen.indexOf($(this).attr("href")) === -1) {
          shirtsSeen.push($(this).attr("href"));
        }   
      });
    request(url + shirtsSeen[0], function(error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
          $("a[href*=shirt]").each(function() {
            shirtsToScrape.add($(this).attr("href"));
            shirtsToScrape.delete("shirts.php");
            if (shirtsSeen.indexOf($(this).attr("href")) === -1) {
              shirtsSeen.push($(this).attr("href"));
            }
          });
          shirtsToScrape.forEach(function(singleUrl) { // Loop over the set of Shirts we've found
            var singleShirt = url + singleUrl; // Create a link to request each shirt to be scraped
            request(singleShirt, function (error, response, html) { 
              if (!error && response.statusCode == 200) { 
                var $ = cheerio.load(html);
                var title = $("title").text();  // Grab all shirt data
                var price = $(".price").text();
                var img = $(".shirt-picture img").attr("src");
                var shirts = {}; // Create empty JSON object with shirt data
                shirts.Title = title;
                shirts.Price = price;
                shirts.ImageURL = img;
                shirts.URL = singleShirt;
                shirts.Time = moment().format("MMMM Do YYYY, h:mm:ss a"); // Create the timestamp
                totalShirts.push(shirts); // Push the shirts data to the totalShirts array
                 // If all the shirts have been grabbed, grab the date time
                  var time = moment().format("YYYY[-]MM[-]DD");
                  var dir = "./data"; // Create the data directory
                  if(!fs.existsSync(dir)) { // If the directory does not exist, create it
                    fs.mkdirSync(dir);
                  }
                  json2csv({ data: totalShirts, fields: csvHeaders }, function(err, csv) { // Create csv with array of data &
                    fs.writeFile( dir + "/" + time + ".csv", csv, function(err) { // csv headers we defined
                      if (err) throw err;
                      // console.log("File saved");
                    });
                  });
                 // End check if all shirts grabbed
               } else {
                errorHandler(error);
               }
            });
          }); // End single shirt scrape
      } else {
        errorHandler(error);
      }
    }); // End each loop request   
  } else {
    errorHandler(error);
  }
}); // End main page request    