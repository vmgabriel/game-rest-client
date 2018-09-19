import express from "express";

let router = express.Router();

router.get('/:id', (req, res) => {
    res.render('index');
});

module.exports = router;
