const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response data:');
    console.log(data);
  });
});

req.on('error', (error) => {
  console.error('Error testing server:', error);
});

req.end(); 