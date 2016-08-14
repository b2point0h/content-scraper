"use strict";

// Node required modules
var request = require("request"); // Allows us to make HTTP calls
var cheerio = require("cheerio"); // Allows us to traverse DOM using jQuery syntax
var json2csv = require("json2csv"); // Converts the json object we create into a CSV
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
var url = "http://shirts4mike.com/";
var totalShirts = new Array();
var csvHeaders = ["Title", "Price", "ImageURL", "URL", "Time", ];

request(url, function (error, response, html) { // Initial request to the URL
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
    var shirtsUrl = $(".shirts > a").attr("href"); // First, find the shirts page
    var shirtsPage = url + shirtsUrl; // set the actual shirt page url
    
      request(shirtsPage, function (error, response, html){ // Now that we have the shirts page, 
        if (!error) {
          var $ = cheerio.load(html);
          var completed = $(".products > li > a").length; // Calculate the length of the shirts list
          
          $(".products > li > a").each(function (index) { // Iterate over all the shirts we've found
            var singleShirt = (url + $(this).attr("href")); // Grab the single shirt URL
            request(singleShirt, function(error, response, html){ // On each individual shirt we've found, grab necessary info
              if (!error) {
                var $ = cheerio.load(html);
                var title = $("title").text(); 
                var price = $(".price").text();
                var img = $(".shirt-picture img").attr("src");
                var shirts = {}; // Create empty JSON object with shit data
                shirts.Title = title;
                shirts.Price = price;
                shirts.ImageURL = img;
                shirts.URL = singleShirt;
                shirts.Time = moment().format("MMMM Do YYYY, h:mm:ss a");
                totalShirts.push(shirts); // Push the shirts data to the totalShirts array
                
                if (totalShirts.length === completed) { // If all the shirts have been grabbed, grab the date time
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
                } // End check if all shirts grabbed
              } else {
                errorHandler(error);
              }
            }); // End singleShirt request
          }); // End Products each function
        } else {
          errorHandler(error);
        }
      }); // End shirtsPage request
    
  } else {
  	errorHandler(error);
  }
}); // End main page request