const express = require('express');
const mongo = require('mongodb');
const path = require('path');
const shortid = require('shortid');
const validUrl = require('valid-url');
const config = require('./config.js');
const MongoClient = mongo.MongoClient;
let app = express();

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

let mLab = "mongodb://CandiW:jesus123@ds151941.mlab.com:51941/candiw-url-shortener"

function myApp(port){
app.use('/',express.static(path.join(__dirname,'/public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/new/:url(*)',function(req,res){
  let local = req.get('host'); + "/";

  MongoClient.connect(mLab,function(err,db){
  if(err){
    console.log(mLab);
    console.log("Error: " + err);
  }
  else {
    console.log("Connected to: " + port);
  }

  let collection = db.collection('links');
  let params = req.params.url;

  function newLink(db,callback){

  collection.findOne({ "url": url }, { shorturl: 1, _id: 0 }, function (err, doc) {
    if (doc != null) {
      res.json({ originalurl: url, shorturl: local + doc.shorturl });
    }
    else {

   if(validUrl.isUri(params)){

    let shortCode = shortid.generate();
    let newUrl = { url: params, shorturl: shortCode };
    collection.insert([newUrl]);
    res.json({ originalurl: params, shorturl: local + shortCode });

   }
   else {
    res.json({error: "Invalid url."});
   }
    
  }

  newLink(db,function(){
    db.close();
  });
  
});
  }
});
});


app.get('/:shorturl', function (req, res, next) {

  MongoClient.connect(mLab, function (err, db) {
    if (err) {
      console.log("Error: " + err);
    } else {
      console.log("Connected.")

      let collection = db.collection('links');
      let params = req.params.shorturl;

      function findLink(db, callback) {

        collection.findOne({"shorturl": params},{url: 1, _id: 0},function(err,doc){
          if(doc !== null){
            res.redirect(doc);
          }
          else {
            res.json({error: "No corresponding shortlink found."});
          }
        });

      };

      findLink(db, function () {
        db.close();
      });

    };
  });
});

app.listen(port);

}

myApp(process.env.PORT || 3000);