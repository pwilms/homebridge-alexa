var alexaTranslator = require('../lib/alexaTranslator.js');
var Validator = require('is-my-json-valid');
// var debug = require('debug')('parse');
var alexaSchema = require('../lib/alexa_smart_home_message_schema.json');
var checkAlexaMessage = Validator(alexaSchema, {
  verbose: true
});

var fs = require('fs');

var endPoints = [{
  host: "test",
  port: "12345",
  HBname: "Testing",
  accessories: JSON.parse(fs.readFileSync(process.argv[2]).toString())
}];

var message = {
  "directive": {
    "header": {
      "namespace": "Alexa.Discovery",
      "name": "Discover",
      "payloadVersion": "3",
      "messageId": "1bd5d003-31b9-476f-ad03-71d471922820"
    },
    "payload": {
      "scope": {
        "type": "BearerToken",
        "token": "access-token-from-skill"
      }
    }
  }
};

var speakers = [{
    "manufacturer": "Yamaha",
    "name": "Front"
  },
  {
    "manufacturer": "Yamaha",
    "name": "Rear"
  },
  {
    "manufacturer": "HTTP-IRBlaster",
    "name": "Panasonic"
  }
];

var filter = "";

var response = alexaTranslator.endPoints(message, endPoints, {
  "events": true,
  "speakers": speakers
});

var eventDevices = alexaTranslator.hapEndPoints();

var status = checkAlexaMessage(response);
if (!status) {
  console.log("WARNING - Bad message", checkAlexaMessage.errors);
  console.log("---------------------------- Response -------------------------------");
  console.log(JSON.stringify(response));
  console.log("------------------------------------------------------------");
} else {
  console.log("Alexa Message Validation Passed!");
}

console.log("\n-----------------------------------------------------------\n");
console.log(JSON.stringify(response, null, 4));
console.log("\n-----------------------------------------------------------\n");
// console.log(eventDevices);

for (var key in eventDevices) {
  console.log(key);
  // console.log(eventDevices[key].endpointID);
  if (!findById(response, eventDevices[key].endpointID)) {
    console.log("Fail");
  }
  console.log(findById(response, eventDevices[key].endpointID));
  // console.log(eventDevices.find(eventDevices[key].endpointID));
}

function findById(o, id) {
  // Early return
  // console.log('o.id', o.id);
  if (o.endpointId === id) {
    return o;
  }
  var result, p;
  for (p in o) {
    // console.log(p);
    if (o.hasOwnProperty(p) && typeof o[p] === 'object') {
      result = findById(o[p], id);
      if (result) {
        return result;
      }
    }
  }
  return result;
}

console.log("\n-----------------------------------------------------------\n");
