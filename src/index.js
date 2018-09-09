'use strict';

import app from './app';

var http = require('http').Server(app);

const port = 3000;

app.listen(port, () => {
    console.log('Servidor de Node http://localhost:'+port);
});
