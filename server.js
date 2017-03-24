const express = require('express');
const mongo = require('mongodb').MongoClient;

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUrl = process.env.MLAB_IMAGES_URI;
// const mongoUrl = 'mongodb://linas:0001@ds137530.mlab.com:37530/images';

app.get('/', (req, res) => res.send('Send function working'));

app.get('/search/:query', (req, res) => {
    const query = req.params.query;
    const doc = { test1: 'testing', test2: query };

  mongo.connect(mongoUrl, (err, db) => {
    if (err) console.log(`Error connecting to MongoDB: ${err}`);
    console.log('Connected successfuly to MongoDB');

  //
    const insertFunction = (db, callback) => {
      db.collection('images').insert(doc, (err, data) => {
        if (err) console.log('Error encountere: ' + err);
        console.log(data + ' successfuly inserted into mLab');
      });
      res.status(200).send(doc);
    };

    insertFunction(db, () => db.close());
  });
});

app.listen(PORT, () => console.log(`Connected to port ${PORT}`));
