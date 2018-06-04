"use strict";

// Node required modules
var request = require("request"); 
var cheerio = require("cheerio");
var converter = require("json-2-csv"); 
var moment = require("moment"); 
var fs = require("fs"); 

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
var totalShirts = new Array();
var shirtsToScrape = []; 
var linksSeen = []; 
var csvHeaders = ["Title", "Price", "ImageURL", "URL", "Time", ];


const requestPromise = function(url) {
  return new Promise(function(resolve, reject) {
      request(url, function(error, response, html) {

          if(error) return reject(error);
          if(!error && response.statusCode == 200){
              return resolve(html);
          }
      });
  });
}

firstScrape(url)
  .then(filterLinks)
  .then(secondScrape)
  .then(thirdScrape)
  .then(writeToFile)
  .catch(function(error) {
    // Handle any error from any request here
    console.log(error);
});


function firstScrape(url) {

  return requestPromise(url)
  .then(function(html) {
    var $ = cheerio.load(html);
    $("a[href*='shirt']").each(function() { // Find all URLs with the word shirt
      var href = $(this).attr("href");
      var fullPath = url + "/" + href;
      if (linksSeen.indexOf(fullPath) === -1) { // Add the full path of all links we've found on the homepage
        linksSeen.push(fullPath);
      }   
    });
    return (linksSeen);
  })
  .catch(function(error) {
    console.log("First scrape failed");
    errorHandler(error)
  });        
}

function filterLinks(linksSeen) {
  var productPages = [];
  for (var i = 0; i < linksSeen.length; i++) { // Loop over the links we've found, if they are not a product page, scrape those,
    if (linksSeen[i].indexOf("?id=") > 0 ) { // otherwise add them to the shirts array
      productPages.push(linksSeen[i]);
    } else {
      shirtsToScrape.push(linksSeen[i]);
    }
    return {productPages: productPages, shirtsToScrape: shirtsToScrape};
  }
}

function secondScrape(filterObj) {
  var productPages = filterObj.productPages;
  var shirtsForScrape = filterObj.shirtsToScrape;
  var promiseArray = [];

  for(var j = 0; j < shirtsForScrape.length; j++){
    promiseArray.push(requestPromise(shirtsForScrape[j]));
    var promises = Promise.all(promiseArray);
  }

  return(promises)
    .then(function(promises){
      for (var k = 0; k < promises.length; k++) {
        var $ = cheerio.load(promises[k]);
              
        $("a[href*='shirt.php?id=']").each(function() {
          var href = $(this).attr("href");
          var fullPath = url + "/" + href;
          
          if (productPages.indexOf(fullPath) === -1) {
            productPages.push(fullPath);  
          }

        }); // Ends each loop
      } // End For
      return productPages;
    })
    .catch(function(error){
      console.log("Second scrape failed");
      errorHandler(error);
    });
}

function thirdScrape(productPages) {
  var promiseArray = [];

  for (var l = 0; l < productPages.length; l++) {
      promiseArray.push(requestPromise(productPages[l]));
      var promises = Promise.all(promiseArray);
  }

  return(promises)
    .then(function(promises) {
      for (var m = 0; m < promises.length; m++) {
        var $ = cheerio.load(promises[m]),
            title = $("title").text(),  
            price = $(".price").text(),
            img = $(".shirt-picture img").attr("src"),
            shirts = {}; // Create empty JSON object with shirt data
        shirts.Title = title;
        shirts.Price = price;
        shirts.ImageURL = url + img; // Log full path URL
        shirts.URL = productPages[m];
        shirts.Time = moment().format("MMMM Do YYYY, h:mm:ss a");
        totalShirts.push(shirts);
      }
      return totalShirts;
    })
    .catch(function(error){
      Console.log("Third scrape failed")
      errorHandler(error)
    });
}


function writeToFile(shirtsData){
  // Create data folder if it doesn't exist
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }
  // Use json-2-csv module to convert JSON
  converter.json2csv(shirtsData, function(error, csv) {
    if (error) {
      console.log("Error at the file writing step");
      errorHandler(error);
    } else {
      console.log("Writing to csv file.");
      var newcsvname = "./data/" + scraperDate() + ".csv";
      fs.writeFile(newcsvname, csv, function(error) {
        if (error) {
          errorHandler(error);
        }
      });
    }
  });
} 

function scraperDate() {
  var d = new Date();
  var year = d.getFullYear();
  var month = (d.getMonth() + 1);
  var day = d.getDate();
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }

  return [year, month, day].join('-');
} // ends scraperDate    