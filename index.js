const express = require("express");
const body_parser = require("body-parser");
const app = express().use(body_parser.json());
const axios = require("axios");
const { config } = require("dotenv");
require("dotenv").config();
app.listen(8000 || process.env.PORT, () => {
  console.log("Webhook listining");
});
const token = process.env.TOKEN;
const myToken = process.env.MYTOKEN;
// to verify callback url frm whatsapp product dashboard API
app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];
  if (mode && token) {
    if (mode === "subscribe" && token === myToken) {
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
  }
});

// post req to reply from API  to end user messages
app.post("/webhook", (req, res) => {
  let body_param = req.body;
  console.log(JSON.stringify(body_param, null, 2));
  if (body_param.object) {
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0].value.messages &&
      body_param.entry[0].changes[0].value.messages[0]
    ) {
      let phn_no_id =
        body_param.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body_param.entry[0].changes[0].value.messages[0].from;
      let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;
      console.log("Data fetched : ", body_param, from, msg_body);
      axios({
        method: "POST",
        url:
          "https://graph.facebook.com/v13.0/" +
          phn_no_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: "Web hook testing, your message is : " + msg_body,
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

// check if API is running
app.get("/", (req, res) => {
  res.status(200).send("Whatsapp webhook test");
});
