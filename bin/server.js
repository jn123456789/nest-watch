var nest = require('unofficial-nest-api'),
  express = require('express'),
  mongoClient = require('mongodb').MongoClient;

function NestWatchException(message) {
  this.name = 'NestWatchException';
  this.message = message;
}

var app = express();

mongoClient.connect("mongodb://localhost:27017/nest-watch", function(err, db) {
  if (err) { throw new NestWatchException(err); }

  app.get('/', function(req, res){
    var collection = db.collection('test');
    var stream = collection.find().stream();

    var responseBuffer =
      '<html>' +
        '<head>' +
        '<title>Nest Device</title>' +
        '<style>td, th { text-align: left; }</style>' +
        '</head>' +
        '<body>' +
        '<table border="1" cellspacing="0" cellpadding="5">' +
        '<tr>' +
        '<th>Sample Time</th>' +
        '<th>Target Temperature</th>' +
        '<th>Actual Temperature</th>' +
        '</tr>';

    stream.on("data", function(sample) {
      var sharedData = sample['shared'];
      var deviceId = Object.keys(sharedData)[0];  // there could be multiple devices in practice, but just get the first for now
      var device = sharedData[deviceId];

      var sampleTime = new Date(sample.timestamp);
      var formattedSampleTime = sampleTime.toString();

      responseBuffer += '<tr>' +
        '<td>'+formattedSampleTime+'</td>' +
        '<td>'+nest.ctof(device.target_temperature)+' F</td>' +
        '<td>'+nest.ctof(device.current_temperature)+' F</td>' +
        '</tr>';
    });

    stream.on("end", function() {
      responseBuffer += '</table>';
      responseBuffer += '</body>';
      responseBuffer += '</html>';
      res.send(responseBuffer);
    });
  });

  app.listen(4000);
});

