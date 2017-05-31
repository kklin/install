const version = require("./package.json").version;
const os = require('os');
const fs = require('fs');
const https = require('https');

function main() {
  const platform = os.platform();
  switch(platform) {
    case 'darwin':
    case 'linux':
      break;
    default:
      throw `Unrecognized operating system ${platform}. Bailing.`
  }

  const url = `https://github.com/quilt/quilt/releases/download/${version}` +
        `/quilt_${platform}`;
  https.get(url, writeFile).on('error', logError('HTTP GET'));
}

function writeFile(resp) {
  if (resp.statusCode >= 400) {
    throw 'Binary not found. Please contact Quilt at dev@quilt.io.'
  }

  // Follow redirects.
  if (resp.headers['location']) {
    https.get(resp.headers['location'], writeFile).
      on('error', logError('HTTP GET'));
    return
  }

  var outFile = fs.createWriteStream('quilt');
  resp.pipe(outFile).on('error', logError('Write file'));
  outFile.on('finish', function() {
    outFile.close();
  });
}

function logError(description) {
  return function(err) {
    console.log(description + ": " + err);
    process.exit(1);
  }
}

main();
