const mongoose = require("mongoose");

let isValid = function (value) {
  if (typeof value === "undefined" || typeof value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

let isValidrequestBody = function (requestBody) {
  return Object.keys(requestBody).length !== 0;
};
let isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};

module.exports = {
  isValid,
  isValidObjectId,
  isValidrequestBody,
};
