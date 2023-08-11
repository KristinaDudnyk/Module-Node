const PORT = 4000;

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const fs = require("fs");
const uniqid = require("uniqid");

app.use(cors());
app.use(morgan("dev"));

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// helper functions

function getConvertedDataFromBookingsJSON() {
  const rawData = fs.readFileSync("./bookings.json");
  const objData = JSON.parse(rawData);
  return objData;
}

function writeUpdateDataToJsonFile(data) {
  const jsonFile = "./bookings.json";
  const newData = JSON.stringify(data);
  fs.writeFile(jsonFile, newData, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("File written successfully.");
    }
  });
}

///////////////////
app.get("/", function (request, response) {
  response.send("Hotel booking server is up.");
});

app.get("/bookings", (req, res) => {
  return res.status(200).send(getConvertedDataFromBookingsJSON());
});

app.get("/bookings/:id", (req, res) => {
  const requestedId = parseInt(req.params.id);
  const objData = getConvertedDataFromBookingsJSON();

  const foundObjByID = objData.find((person) => person.id === requestedId);

  if (!foundObjByID) {
    return res.status(404).send(`Message with ${requestedId} was not found`);
  }

  return res.status(200).send(foundObjByID);
});

app.delete("/bookings/:id", (req, res) => {
  const requestedId = parseInt(req.params.id);
  const objData = getConvertedDataFromBookingsJSON();

  const indexOfObj = objData.findIndex((obj) => obj.id === requestedId);
  console.log(indexOfObj);

  if (!indexOfObj || indexOfObj < 0) {
    return res.status(404).send(`Message with ${requestedId} was not found`);
  }

  const deletedMessage = objData[indexOfObj];
  objData.splice(indexOfObj, 1);
  writeUpdateDataToJsonFile(objData);
  return res.status(201).send(deletedMessage);
});

app.post("/bookings", (req, res) => {
  const {
    title,
    firstName,
    surname,
    email,
    roomId,
    checkInDate,
    checkOutDate,
  } = req.body;

  if (
    !title &&
    !firstName &&
    !surname &&
    !email &&
    !roomId &&
    !checkInDate &&
    !checkOutDate
  ) {
    res.status(400).json({ error: "One or several filds wasn't filed" });
  }

  const objData = getConvertedDataFromBookingsJSON();

  objData.push({
    id: uniqid(),
    title: title,
    firstName: firstName,
    surname: surname,
    email: email,
    roomId: roomId,
    checkInDate: checkInDate,
    checkOutDate: checkOutDate,
  });

  writeUpdateDataToJsonFile(objData);
  return res.status(201).send(objData);
});

const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
