const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Root route
app.get("/", (req, res) => {
  res.send("Messenger Bot is running ✅");
});

// Verify webhook (Facebook will ping this once)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "your_verify_token_here";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified!");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Receive messages
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const event = entry.messaging[0];
      const senderId = event.sender.id;

      if (event.message && event.message.text) {
        const receivedMessage = event.message.text;
        console.log("📩 Message received:", receivedMessage);
        // Simple reply
        sendMessage(senderId, "You said: " + receivedMessage);
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Function to send message back to user
const fetch = require("node-fetch");
function sendMessage(senderPsid, response) {
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  const requestBody = {
    recipient: { id: senderPsid },
    message: { text: response },
  };

  fetch(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  })
    .then((res) => res.json())
    .then((data) => console.log("✅ Message sent:", data))
    .catch((err) => console.error("❌ Error:", err));
}

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
