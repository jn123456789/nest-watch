var mongoClient = require('mongodb').MongoClient;

function NestWatchException(message) {
  this.name = 'NestWatchException';
  this.message = message;
}

mongoClient.connect("mongodb://localhost:27017/nest-watch", function(err, db) {
  if (err) { throw new NestWatchException(err); }

  var collection = db.collection('test');
  var stream = collection.find().stream();

  stream.on("data", function(item) {
    delete item['_id'];
    var line = JSON.stringify(item);
    line = line.replace(/__timestamp__/g, '$timestamp');
    line = line.replace(/__version__/g, '$version');
    console.log(line);
  });

  stream.on("end", function() {
    db.close();
  });
});


