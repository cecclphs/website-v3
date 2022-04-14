const functions = require("firebase-functions");
const { db } = require("./admin");

module.exports = {
    ...require("./users.js"),
    ...require("./inventory.js"),
    ...require("./finance.js"),
}