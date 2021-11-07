const http = require('http'),
      os = require('os'),
      url = require('url'),
      client = require('prom-client'),
      collectDefaultMetrics = client.collectDefaultMetrics;

// Create a Registry which registers the metrics
const Registry = client.Registry;
const register = new Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'my-nodejs-app'
})

console.log("Node v1 server starting...");

// Enable the collection of default metrics
collectDefaultMetrics({ register })

// Define the HTTP server
const server = http.createServer(async (req, res) => {
  // Retrieve route from request object
  const route = url.parse(req.url).pathname

  if (route === '/metrics') {
    console.log("Hit the /metrics end point...");
    // Return all metrics the Prometheus exposition format
    res.setHeader('Content-Type', register.contentType)
    res.end(await register.metrics())
  }
  else {
    console.log("Hit the / end point...");
    console.log("Request received from: " + req.connection.remoteAddress);
    res.writeHead(200);
    res.end("Node v1 running in a pod: " + os.hostname() + "\n");   
  }
})

// Start the HTTP server which exposes the metrics on http://localhost:8080/metrics
server.listen(8080)