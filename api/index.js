const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

const port = process.env.PORT || 3000;
const router = require('./routers');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', router);

// Serve frontend for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app; // For Vercel
