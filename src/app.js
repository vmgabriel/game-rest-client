'use strict';

import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import sassMiddleware from 'node-sass-middleware';

let app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, '../public')));

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// SASS
const pathSass = path.join(__dirname, '../public/sass');
const pathCss = path.join(__dirname, '../public/styles');
app.use(sassMiddleware({
    src: pathSass,
    dest: pathCss,
    debug: true,
    outputStyle: 'compressed',
    prefix: '/styles'
}));

let router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

app.use(router);

module.exports = app;
