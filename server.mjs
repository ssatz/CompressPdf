'use strict';
import express from 'express';
import morgan from 'morgan'
import { handler } from './app/compress.mjs';

// Constants
const PORT = 6499;
const HOST = '0.0.0.0';

// App
const app = express();
morgan('combined');
app.use(express.json());

app.post('/compress', (req, res) => {
  if (filename == null || typeof filename == undefined) {
    console.log('Empty filename');
    return res.status(429).send('Empty file');
  }
  try {
    handler(req.body.filename)
    return res.send('ok');
  } catch (error) {
    response
      .status(500)
      .send(error.message)
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});