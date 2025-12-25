const express = require('express');
const router = express.Router();
const path = require('path');

const viewsDir = path.join(__dirname, '../views');

router.get('/', (req, res) => {
    res.sendFile(path.join(viewsDir, 'index.html'));
});

router.get('/ddos', (req, res) => {
    res.sendFile(path.join(viewsDir, 'ddos.html'));
});

router.get('/risks', (req, res) => {
    res.sendFile(path.join(viewsDir, 'risks.html'));
});

router.get('/decision', (req, res) => {
    res.sendFile(path.join(viewsDir, 'decision.html'));
});


router.get('/navbar.html', (req, res) => {
    res.sendFile(path.join(viewsDir, 'navbar.html'));
});

module.exports = router;
