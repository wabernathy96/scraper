const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

// Scraping packages
const request = require('request');
const cheerio = require('cheerio');

// Require all models
let db = require('./models/index');

let PORT = process.env.PORT||9001;

// Initialize Express
let app = express();

// Configure middleware
// Use morgan logger for logging requests
app.use(logger('dev'));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static('public'));

require('dotenv').config();

// Connect to the Mongo DB
let dbUrl = 'mongodb://localhost/scraper';

if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
}
else {
	mongoose.connect(dbUrl);
};

app.listen(PORT,
  () => {
    console.log(`SERVER RUNNING ON PORT:${PORT}`)
  }
)

// Routes
// A GET route for scraping the NYT website
app.get('/scrape',
  (req, res) => {
    request('https://www.nytimes.com/section/technology',
      (error, response, html) => {
        let $ = cheerio.load(html);

        let result = {};

        $('div.story-body').each(
          (i, element) => {

            // Tell cheerio what specific elements to find
            let link = $(element).find('a').attr('href');
            let title = $(element).find('h2.headline').text().trim();
            let summary = $(element).find('p.summary').text().trim();
            let img = $(element).parent().find('figure.media').find('img').attr('src');

            result.link = link;
            result.title = title;

            if(summary) {
              result.summary = summary;
            }

            if (img) {
              result.img = img;
            } else {
              result.img = $(element).find('div.wide-thumb').find('img').attr('src');
            }

            let scrape = new db.Article(result);

            db.Article.find({ title: result.title },
              (err, data) => {
                if (data.length === 0) {
                  scrape.save(
                    (err, data) => {
                      if (err) throw err;
                    }
                  )
                }
              }
            );
          }
        );
        console.log(`SCRAPE COMPLETE`);
        res.redirect('/');  
      }
    );  
  }
);

