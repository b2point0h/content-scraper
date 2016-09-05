"use strict";

// Node required modules
var request = require("request"); // Allows us to make HTTP calls
var cheerio = require("cheerio");
/*
- Cheerio allows us to traverse the DOM using jQuery syntax, I like that.
- We can write jQuery like syntax for traversing DOM elements easilly.
- I chose this package because it is actively maintained and is fast and flexible. 
*/
var json2csv = require("json2csv"); 
/*
- Converts the json object we create into a CSV. Nice!
- I chose this package because it has many releases and is actively maintained.
- It seems to be a very popular release, and it'll do exactl what we need.
*/
var moment = require("moment"); // Easy formatting of Date/Time stamp
var fs = require("fs"); // Allows us to write files

var errorHandler = function(error) { // Error Handling function
  console.log("The scraper had an issue with " + url + ". Either the site is down or your connection is bad.");
  var errorDate = new Date();
  var errorLog = "[" + errorDate + "] " + error.message + "\n"; // Create the formatted error message with date
  fs.appendFile("scrape-error.log", errorLog, function(err) { // Write the file
    if (err) throw err;
    console.log("There was an error. It has been logged to scrape-error.log");
  });
};

// Globals
var url = "http://shirts4mike.com";
var totalShirts = new Array(); // We create an empty array to push the shirts data to, for using in the json2csv convert
var shirtsToScrape = []; // The Set allows us to pass shirts we want to scrape, but won't create duplicates. Pretty awesome!
var linksSeen = []; // To log all the shirt links we've seen in total
var csvHeaders = ["Title", "Price", "ImageURL", "URL", "Time", ];

request(url, function (error, response, html) { // Initial request to the URL
  if (!error && response.statusCode == 200) { // If we get anything but a successful 200 HTTP code, log the error and stop the program
    var $ = cheerio.load(html);
      $("a[href*='shirt']").each(function() { // Find all URLs with the word shirt
        var href = $(this).attr("href");
        var fullPath = url + "/" + href;
        if (linksSeen.indexOf(fullPath) === -1) { // Add the full path of all links we've found on the homepage
          linksSeen.push(fullPath);
        }   
      });
      for (var i = 0; i < linksSeen.length; i++) { // Loop over the links we've found, if they are not a product page, scrape those,
        if (linksSeen[i].indexOf("?id=") > 0 ) { // otherwise add them to the shirts array
          shirtsToScrape.push(linksSeen[i]);
        } else {
          request(linksSeen[i], function(error, response, html) { // Scrape the links we've seen again if product pages found on
            if (!error && response.statusCode == 200) { // these pages, push to final shirts array
              var $ = cheerio.load(html);
              
                $("a[href*='shirt.php?id=']").each(function() {
                  var href = $(this).attr("href");
                  var fullPath = url + "/" + href;
                  
                  if (shirtsToScrape.indexOf(fullPath) === -1) {
                    shirtsToScrape.push(fullPath);  
                  }

                }); // Ends each loop
                  for (var s = 0; s < shirtsToScrape.length; s++) { // Loop over the array of Shirts we've found
                  request(shirtsToScrape[s], function (error, response, html) { // Scrape the final shirts array
                    if (!error && response.statusCode == 200) { 
                      var $ = cheerio.load(html);
                      var title = $("title").text();  // Grab all shirt data
                      var price = $(".price").text();
                      var img = $(".shirt-picture img").attr("src");
                      var shirts = {}; // Create empty JSON object with shirt data
                      shirts.Title = title;
                      shirts.Price = price;
                      shirts.ImageURL = url + img; // Log full path URL
                      shirts.URL = response.request.uri.href;
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
                            console.log("File saved");
                          });
                        });
                       // End check if all shirts grabbed
                     } else {
                      errorHandler(error);
                     }
                  });
                } // End single shirt scrape
            } else {
              errorHandler(error);
            }
        }); // Ends Second request
      }// Ends Else
    }// Ends For   
  } else {
    errorHandler(error);
  }
}); // End main page request    