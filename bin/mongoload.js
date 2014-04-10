var fs = require('fs'),
  readline = require('readline'),
  mongoClient = require('mongodb').MongoClient;

function NestWatchException(message) {
  this.name = 'NestWatchException';
  this.message = message;
}

var input;
if (process.argv.length == 2) {
  input = process.stdin;
} else if (process.argv.length == 3) {
  // NOTE: not working; causes a strange error later ("TypeError: Cannot call method 'write' of undefined")
  input = fs.createReadStream(process.argv[2]);
} else {
  console.log("usage error:", process.argv);
  process.exit(1);
}

var pendingInput = 1, pendingInsertCount = 0;

mongoClient.connect("mongodb://localhost:27017/nest-watch", function(err, db) {
  if (err) { throw new NestWatchException(err); }

  var collection = db.collection('test');

  collection.drop(function(err, result) {
    if (err && err.toString() != 'MongoError: ns not found') { throw new NestWatchException(err); }

    var reader = readline.createInterface({ input: input, output: process.stdout, terminal: false });

    reader.on('line', function(line) {
      line = line.replace(/\$timestamp/g, '__timestamp__');
      line = line.replace(/\$version/g, '__version__');
      var data = JSON.parse(line);

      // temporary measure for initial import: prune the sample rate down from once
      // per minute to once per ten minutes.
      if (new Date(data.timestamp).getMinutes() % 10 != 0) return;

      pendingInsertCount++;
      collection.insert(data, function(err, result) {
        if (err) { throw new NestWatchException(err); }
        pendingInsertCount--;
        if (pendingInsertCount == 0 && !pendingInput) {
          db.close();
        }
      })
    });

    reader.on('close', function() {
      pendingInput = 0;
      if (pendingInsertCount == 0) {
        db.close();
      }
    });
  });
});
