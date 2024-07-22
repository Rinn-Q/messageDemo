const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const request = require('request');
const app = express();

const PAGE_ACCESS_TOKEN = 'EAAQEZBGvcEBkBOxeZBPerGg6KC1M3phPLtNzZAnCyK7NWA6h9WM5ZA3Ra4FgH4QI1ijxiwLTxWxrvtW7ZABGXyggUZBqFEYVRZC0WoeFmcZBQCiUZC5d6NSZCcIagiZALtbfvFS4lauYJlhiGKZCJ3Ah9hwumh14BwrZBpd8e9RpTHUvUcxbcPzCIwk7xO7hsM50ZB4mfSVAZDZD';
const VERIFY_TOKEN = '2jSbyeRqT0gbju4wKCqE3EtaDhy_5WQKv9aKX26iPZqhPnD7t';

app.use(bodyParser.json());
app.use(cors());

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`Received GET webhook request: mode=${mode}, token=${token}, challenge=${challenge}`);

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Verification success');
    res.status(200).send(challenge);
  } else {
    console.log('Verification failed');
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

function handleMessage(sender_psid, received_message) {
  let response;

  if (received_message.text) {
    response = {
      'text': `You sent the message: "${received_message.text}".`
    };
  }

  callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
  let response;

  // Handle postback logic here

  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  const request_body = {
    'recipient': {
      'id': sender_psid
    },
    'message': response
  };

  request({
    'uri': 'https://graph.facebook.com/v20.0/me/messages',
    'qs': { 'access_token': PAGE_ACCESS_TOKEN },
    'method': 'POST',
    'json': request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('Message sent!');
    } else {
      console.error('Unable to send message:', err);
    }
  });
}

app.listen(process.env.PORT || 8080, () => {
  console.log('Server is running.');
});
