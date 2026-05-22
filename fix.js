const fs = require('fs');

const route = "const express = require('express');\nconst router = express.Router();\n\nrouter.get('/test', (req, res) => {\n  res.json({ success: true, message: 'Route working' });\n});\n\nmodule.exports = router;\n";

['auth','members','contributions','loans','reports'].forEach(name => {
  fs.writeFileSync('./routes/' + name + '.js', route, 'utf8');
  console.log('Created: routes/' + name + '.js');
});

console.log('All done!');