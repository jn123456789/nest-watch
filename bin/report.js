var nest = require('unofficial-nest-api'),
  fs = require('fs'),
  readline = require('readline'),
  util = require('util');

var reader = readline.createInterface({
//  input: fs.createReadStream('/path/to/file'),
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

reader.on('line', function(line) {
  var sample = JSON.parse(line);
  var sharedData = sample['shared'];
  var deviceId = Object.keys(sharedData)[0];  // there could be multiple devices in practice, but just get the first for now
  var device = sharedData[deviceId];

  var requestTimestamp = new Date(sample.timestamp);
  var sampleTimestamp = new Date(device.$timestamp);

  console.log(util.format("%s    Current temperature %d F   Target Temperature %d F  (sample time: %s)",
    requestTimestamp,
    nest.ctof(device.current_temperature),
    nest.ctof(device.target_temperature),
    sampleTimestamp));
});
