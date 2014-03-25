var util = require('util'),
  nest = require('unofficial-nest-api');

if (process.argv.length < 3) {
  console.log('Usage: ' + process.argv[1] + ' USERNAME PASSWORD');
  process.exit(1);
}

var username = process.argv[2];
var password = process.argv[3];

nest.login(username, password, function (err, data) {
  if (err) {
    console.log(err.message);
    process.exit(1);
    return;
  }

  nest.fetchStatus(function (data) {
    console.log(JSON.stringify(data));
  });
});
