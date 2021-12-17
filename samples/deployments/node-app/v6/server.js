const http = require('http'),
      os = require('os'),
      url = require('url'),
      client = require('prom-client'),
      collectDefaultMetrics = client.collectDefaultMetrics;

function getTimeStamp() {
  var dt = new Date().toISOString().
    replace(/T/, ' ').      // replace T with a space
    replace(/\..+/, '')     // delete the dot and everything after
    return "[" + dt + "] ";
}

var fs = require("fs");
fs.mkdir('./logs', { recursive: true }, (err) => {
  if (err) throw err;
});

const output = fs.createWriteStream('./logs/stdout.log', { flags: 'a' });
const errorOutput = fs.createWriteStream('./logs/stderr.log', { flags: 'a' });
// custom simple logger
const logger = new console.Console(output, errorOutput);

// Create a Registry which registers the metrics
const Registry = client.Registry;
const register = new Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'my-nodejs-app'
})

// console.log is for Kubernetes & logger.log is for Persistent Volume log file
console.log(getTimeStamp() + "Node v6 server starting...");
logger.log(getTimeStamp() + "Node v6 server starting...");

// Enable the collection of default metrics
collectDefaultMetrics({ register })

// Define the HTTP server
const server = http.createServer(async (req, res) => {
  // Retrieve route from request object
  //const route = url.parse(req.url).pathname // url.parse is deprecated
  const route = req.url;

  if (route === '/metrics') {
    console.log(getTimeStamp() + "Hit the /metrics end point...");
    logger.log(getTimeStamp() + "Hit the /metrics end point...");
    // Return all metrics the Prometheus exposition format
    res.setHeader('Content-Type', register.contentType)
    res.end(await register.metrics())
  }
  else {
    console.log(getTimeStamp() + "Hit the / end point...");
    logger.log(getTimeStamp() + "Hit the / end point...");
    // console.log("Request received from: " + req.connection.remoteAddress); // req.connection is deprecated
    console.log(getTimeStamp() + "Request received from: " + req.socket.remoteAddress + " (" + req.headers.host + ")");
    logger.log(getTimeStamp() + "Request received from: " + req.socket.remoteAddress + " (" + req.headers.host + ")");
    res.writeHead(200);
    res.end(getTimeStamp() + "Node v6 running in a pod: " + os.hostname() + " running on " + os.platform() + " [" + os.type() + "] (" + os.arch() + ")\n");   
  }
})

// Start the HTTP server which exposes the metrics on http://localhost:8080/metrics
server.listen(8080)