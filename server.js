const http = require('http');

http.createServer((request, response) => {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end('Hello Node! \n');

  }).listen(8080);
console.log('My test server is running on Port 8080.');