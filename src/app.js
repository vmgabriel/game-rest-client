'use strict';

import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import sassMiddleware from 'node-sass-middleware';
import favicon from 'serve-favicon';
import Request from "request";

import rutaJuego from "./rutaJuego";

let app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

app.use(favicon(path.join(__dirname,'../public','img','favicon.ico')));

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// SASS
const pathSass = path.join(__dirname, '../public/sass');
const pathCss = path.join(__dirname, '../public/styles');
app.use(sassMiddleware({
    src: pathSass,
    dest: pathCss,
    debug: false,
    prefix: '/styles'
}));

app.use(express.static(path.join(__dirname, '../public')));

let router = express.Router();

router.get('/', (req, res) => {
    res.render('login');
});

router.post('/', (req, res) => {
    Request.post({
        "url": "http://localhost:3800/api/v0/sesion",
        "headers": { "content-type": "application/json",
                     "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.IwdaBxBHvBMLp6Ig4t4detTnQOiE2VN5CIF-09QQ-G0"},
        "form": req.body
    }, (err, salida, body) => {
        if (err != null) {
            res.status(500).json({"error": err});
        } else {
            let out = JSON.parse(body);
            if (out == null) {
                res.redirect("/error");
            } else {
                res.redirect("/app/"+out[0]._id);
            }
        }
    });
});


app.get('/new', (req, res) => {
    res.render("registro");
});

app.post('/new', (req, res) => {
    Request.post({
        "url": "http://localhost:3800/api/v0/jugadores",
        "headers": { "content-type": "application/json",
                     "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.IwdaBxBHvBMLp6Ig4t4detTnQOiE2VN5CIF-09QQ-G0"},
        "form": req.body
    }, (err, salida, body) => {
        if (err != null) {
            res.status(500).json({"error": err});
        } else {
            let out = JSON.parse(body);
            if (out == null) {
                res.redirect("/error");
            } else {
                res.redirect("/"+out._id);
            }
        }
    });
});

app.get("/cierresesion", (req, res) => {
    req.session.user_id = null;
    res.redirect("/");
});

router.get('/puntaje', (req, res) => {
    Request.get({
        "url": "http://localhost:3800/api/v0/puntajesaltos",
        "headers": { "content-type": "application/json",
                     "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.IwdaBxBHvBMLp6Ig4t4detTnQOiE2VN5CIF-09QQ-G0"}
    }, (err, salida, body) => {
        if (err) {
            res.status(500).json({"error": err});
        } else {
            res.render('puntajes', { jugadores: JSON.parse(body) });
        }
    });
});

router.get('/error',(req, res) => {
    res.render('internalS');
});

app.use(router);
app.use(rutaJuego);

module.exports = app;
