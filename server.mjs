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
  if (req.body.filename == null || typeof req.body.filename == undefined) {
    console.log('Empty filename');
    return res.status(429).send('Empty file');
  }
  if (req.body.uuid == null || typeof req.body.uuid == undefined) {
    console.log('Empty UUID');
    return res.status(429).send('Empty UUID');
  }
  try {
    handler(req.body.filename,req.body.uuid,req.body.userId)
    return res.send('ok');
  } catch (error) {
    response
      .status(500)
      .send('something wrong try again!')
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});