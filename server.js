const express = require('express');
const path = require('path');
const Google = require('google-images');
const mongo = require('mongodb').MongoClient;

// google image search setup
const CSE_ID = process.env.CSE_ID;
const API_KEY = process.env.API_KEY;
const client = new Google(CSE_ID, API_KEY);

// server setup
const app = express();
const PORT = process.env.PORT || 3000;
const mongoUrl = process.env.MLAB_IMAGES_URI;

// prettyfy json respons in the browser
app.set('json spaces', 2);

// create static server
app.use(express.static(path.join(__dirname)));

// home page
// app.get('/test', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// search page
app.get('/search/:query', (req, res) => {
  const query = req.params.query;
  const offset = req.query.offset || 1;
  const time = new Date().toISOString();

  // add search query and time to mLab;
  mongo.connect(mongoUrl, (err, db) => {
    if (err) throw err;
    db.collection('images').insert({ search: query, time: time });
    db.close();
  });

  // call Google Custom Search client
  client.search(query, { page: offset })
    .then(images => {
      // filter function to show neccesary results
      const filter = (i) => {
        return {
          url: images[i].url,
          snippet: images[i].description,
          thumbnail: images[i].thumbnail.url,
          context: images[i].parentPage
        };
      };

      // itarate through search result and filter them
      const result = () => [...Array(10)].map((c, i) => filter(i));

      // send to browser
      res.json(result());
    });
});

// latest search page
app.get('/latest', (req, res) => {
  const findDoc = (db, callback) => {
    db.collection('images')
    // find all documents, but do not show _id
    .find({}, { _id: 0 })
    // sort by descending timestamp
    .sort({ time: -1 })
    // show only last 10 search results
    .limit(10)
    // send result to browser
    .toArray((err, docs) => {
      if (err) throw err;
      res.json(docs);
      callback(docs);
    });
  };

  mongo.connect(mongoUrl, (err, db) => {
    if (err) throw err;
    console.log('connected to mongo mlab');
    findDoc(db, () => db.close());
  });
});

app.listen(PORT, () => console.log(`Connected to port ${PORT}`));
