const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });

exports.getClientIP = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    const xForwardedFor = req.headers["x-forwarded-for"];
    const ip =
      xForwardedFor?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";

    res.status(200).json({ ip });
  });
});
