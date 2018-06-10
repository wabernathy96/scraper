// Necessary dependencies
// Server
const express = require('express');
// ODM for mongoDB
const mongoose = require('mongoose');
// Views
const exphbs = require('express-handlebars');
// Middleware
const path = require('path');
const bodyParser = require('body-parser');
const method = require('method-override');
const logger = require('morgan');
// Scraping
const request = require('request');
const cheerio = require('cheerio');

// Require all models
let db = require('./models/index');

// Set Port
let PORT = process.env.PORT||9001;

// Initialize Express
let app = express();

// Configure middleware
// Use morgan logger for logging requests
app.use(logger('dev'));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static(__dirname + '/public'));
// Use method override for all put/delete routes
app.use(method('_method'));
// Use dotenv to configure server env
require('dotenv').config();

// Configure views
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Connect to the Mongo DB
let dbUrl = 'mongodb://localhost/scraper';

if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
}
else {
	mongoose.connect(dbUrl);
};

// Start server
app.listen(PORT,
  () => {
    console.log(`SERVER RUNNING ON PORT:${PORT}`)
  }
)

// Routes
// GET route for the home page
app.get('/',
  (req, res) => {
    db.Article.find({}) // Find all articles
    .sort(
      {
        created: -1 // Sort by created date, desc
      }
    )
    .then(
      (data) => {
        if(data.length === 0) { // If no data exists in db show placeholder view
          res.render('placeholder', {message:'There are no articles to display! Click the "Fresh Scrape" button to load some rooricious content!'});
        } else { // If there's data render it to home view
          res.render('home', { Article: data });
        }
      }
    )
    .catch( // If there's an error show it in json format
      (error) => {
        res.json(error);
      }
    );
  }
);

// GET route for scraping the NYT website's tech section
app.get('/scrape',
  (req, res) => {
    request('https://www.nytimes.com/section/technology',
      (error, response, html) => {
        let $ = cheerio.load(html);

        // used for deduplication
        let articleTitles = {};

        $('article.story.theme-summary').each(
          (i, element) => {

            // check if there is a duplicate
            let title = $(element).find('h2.headline').text().trim();
            if (!articleTitles[title]) {

              // Tell cheerio what specific elements to find
              let link = $(element).find('a').attr('href');
              let summary = $(element).find('p.summary').text().trim();
              let img = $(element).parent().find('figure.media').find('img').attr('src');

              let result = {};

              // Set properties of result obj to results of scrape
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

              // Create a new Article collection with results of scrape
              //let scrape = new db.Article(result);

              // Query db for existing titles equal to the titles of the scrape
              // If no data is returned from query, save results
              /*db.Article.create(result, 
                (error, x) => {
                  if (error) {res.json(error);}
                  console.log('x', x);
                }
              );*/
              

              articleTitles[title] = true;
              console.log('searching for title', title);
              db.Article.findOne({ title })
              .then (
                (data) => {
                  console.log('data after searching for title' + title, data);
                  if (!data) {
                    db.Article.create(result, 
                      (error) => {
                        console.log('created article with title', title);
                        if (error) res.json(error);
                      }
                    )
                    .catch((error) => res.json(error));
                  } else {
                    console.log('article already in db');
                  }
                }
              )
              .catch (
                (error) => {
                  res.json(error);
                }
              );
            }

          }
        );
        console.log('SCRAPE COMPLETE');
        res.redirect('/');  
      }
    );  
  }
);

// GET route to view saved articles
app.get('/saved',
  (req, res) => {
    db.Article.find({saved: true}) // Find articles where saved = true
    .sort (
      {
        created: -1 // Sort by date created, desc
      }
    )
    .then (
      (data) => {
        if (data.length === 0) { // If no articles are saved, render placeholder
          res.render('placeholder', {message: 'You have not saved any articles... Try clicking on an article then the "save article" button!'})
        } else {
          res.render('saved', { saved: data }); // Render saved page
        }
      }
    )
    .catch (
      (error) => {
        res.json(error);
      }
    );
  }
);

// POST route to save articles
app.post('/save/:id',
  (req,res) => {
    db.Article.findById(req.params.id) // Find articles by the id of the user req
    .then(
      (data) => {
        if (data.saved) { // If the article is already saved
          db.Article.findByIdAndUpdate(req.params.id,
            {$set:
              {
                saved: false, // Set Saved to false
                status: 'Save Article' // Set status of article
              }
            },
            {
              new: true // Make it a new entry
            },
            (err, data) => {
              res.redirect('/'); // Redirect back to home
            }
          );
        } else {
          db.Article.findByIdAndUpdate(req.params.id,
            {$set:
              {
                saved: true, // If article is not saved, set saved = true
                status: 'Article Saved' // Set article status
              }
            },
            {
              new: true // Make it a new entry
            },
            (err, data) => {
              res.redirect('/saved'); // Redirect back to saved articles
            }
          );
        }
      }
    )
    .catch(
      (error) => {
        res.json(error);
      }
    );
  }
);

// PUT route to update articles to unsaved

// POST route to save/update note to article

// GET route to view notes saved to article




