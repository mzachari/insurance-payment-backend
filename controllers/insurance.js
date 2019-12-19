const Insurance = require("../models/insurance");
const Farm = require("../models/farm");
const data = require("../middleware/data.json");
const async = require("async");
const fs = require("fs");
const path = require("path");
const createReadStream = require("fs").createReadStream;
const sleep = require("util").promisify(setTimeout);
const axios = require("axios");
const qs = require("qs");
const fetch = require("node-fetch");
const request = require("request");
var contractId = 0;

const authToken =
  "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6InBpVmxsb1FEU01LeGgxbTJ5Z3FHU1ZkZ0ZwQSIsImtpZCI6InBpVmxsb1FEU01LeGgxbTJ5Z3FHU1ZkZ0ZwQSJ9.eyJhdWQiOiI4MWE4NmRiZS1iMGRmLTQwNTgtODUzZS01MjM5MjdjY2NhZjYiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83ODg4MzJjZS04OGU1LTQ1N2QtODBhMi0yYzZkMmM4YzQzM2IvIiwiaWF0IjoxNTc2NzgwMjgzLCJuYmYiOjE1NzY3ODAyODMsImV4cCI6MTU3Njc4NDE4MywiYWlvIjoiQVZRQXEvOE5BQUFBV2NwVXIwOERnUUdjUXJoWER1VGF0cG1KWkh1cjgyWjZZSy9Xc2wzUFVveTkvclE4dy9mZVZnSmxabmgzVE9LN1owZTVVME41RENPUGFnTGFJTENHL1hPZHZaSUh3VWZvSXJPYmprMW8xSDg9IiwiYW1yIjpbInB3ZCJdLCJjX2hhc2giOiJHWU1ZNXgxRUcyY0NqaU9Jbmp5bndnIiwiZW1haWwiOiJ0aGUuZWxkZXIud2FuZC50ZWNoQGdtYWlsLmNvbSIsImZhbWlseV9uYW1lIjoiWmFjaGFyaWEiLCJnaXZlbl9uYW1lIjoiTWFyaWEiLCJpZHAiOiJsaXZlLmNvbSIsImlwYWRkciI6IjE1Ny40NS4yMTAuMTc1IiwibmFtZSI6Ik1hcmlhIFphY2hhcmlhIiwibm9uY2UiOiI2NGMzZDdjNC05MWUwLTRiZTAtYmVmNi1hNjAxM2Q3MGM4ZGQiLCJvaWQiOiIyY2E1NTgxYS05ZTM3LTQ1MzgtYjUxOC1jYjExZGFjMWJhMWEiLCJyb2xlcyI6WyJBZG1pbmlzdHJhdG9yIl0sInN1YiI6IlEyMkF5XzkyTGloM3FjZnJUcnNSS2ZQd3U2MDBBRWctT0tBOUxkUDVfM1kiLCJ0aWQiOiI3ODg4MzJjZS04OGU1LTQ1N2QtODBhMi0yYzZkMmM4YzQzM2IiLCJ1bmlxdWVfbmFtZSI6ImxpdmUuY29tI3RoZS5lbGRlci53YW5kLnRlY2hAZ21haWwuY29tIiwidXRpIjoiMi1jQldkbzNpVWlUYU9uTGFFUXhBQSIsInZlciI6IjEuMCJ9.kWoZM5yL6SqHrMOHED1bLkgpCEM8Ep7wyaW5nFFAvkifh0Tkh_es9306bLXytrWE56reB4FXgJeBuVQLe3z35NbCdXviTILiJKpjhAuCphbUMlsjumeaNvzYYy68FH6awgQ9KzAn4-2nWGkBMVCSHHRXpa1Y3YPc-UMpH-qT8RQlzxh-0jTpy47NvAxIl2z-eR9YIjKmrd9A94lJY9ghU0FEYcyP_Ksg9nteGqTIcy2jmaBAvzDPfTyxSOMKZkoHW3l_Codl7JqUYfI2n6jtncvIZqxdOA3u1RSByTV8dgdl143staOYs_sWMN66FoOMSTuGfPbhfXDXPMuzSqYDHQ";
const ComputerVisionClient = require("@azure/cognitiveservices-computervision")
  .ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

const AUTHORITY =
  "https://login.microsoftonline.com/theelderwandtechgmail.onmicrosoft.com";
const WORKBENCH_API_URL = "https://elderwand-7e32bo-api.azurewebsites.net";
const RESOURCE = "81a86dbe-b0df-4058-853e-523927cccaf6";
const CLIENT_APP_Id = "7ed6ca0e-da17-4e07-a088-80bfd50c377f";
const CLIENT_SECRET = "sropS+6zxXRZ0SICyfpZfATXJoR2ssdxS2hxP1IXL4I=";

let key = "d8b04ac164ca4e1faff9b59ff0a7687a";
let endpoint = "https://extractinsurancedetails.cognitiveservices.azure.com/";
if (!key) {
  throw new Error(
    "Set your environment variables for your subscription key and endpoint."
  );
}
let computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);

const acquireTokenWithClientCredentials = async (
  resource,
  clientId,
  clientSecret,
  authority
) => {
  const requestBody = {
    resource: resource,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials"
  };

  const response = await axios({
    method: "POST",
    url: `${authority}/oauth2/token`,
    data: qs.stringify(requestBody),
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  return response.data;
};

let retrievedData = {};

async function recognizeText(client, mode, url) {
  // To recognize text in a local image, replace client.recognizeText() with recognizeTextInStream() as shown:
  // result = await client.recognizeTextInStream(mode, () => createReadStream(localImagePath));
  let result = await client.recognizeText(mode, url);
  // Operation ID is last path segment of operationLocation (a URL)
  let operation = result.operationLocation.split("/").slice(-1)[0];

  // Wait for text recognition to complete
  // result.status is initially undefined, since it's the result of recognizeText
  while (result.status !== "Succeeded") {
    result = await client.getTextOperationResult(operation);
  }
  return result.recognitionResult;
}

async function cvtext(imagePath) {
  if (imagePath != null) {
    const printedText = imagePath;
    console.log("Recognizing printed text...", printedText.split("/").pop());
    //Handwritten ,Printed
    var printed = await recognizeText(
      computerVisionClient,
      "Handwritten",
      printedText
    );
    printRecText(printed);
  }
}

// async function computerVision() {
//   async.series(
//     [
//       async function() {
//         const printedText = "https://i.ibb.co/w6bDF9s/test.jpg";
//         console.log(
//           "Recognizing printed text...",
//           printedText.split("/").pop()
//         );
//         //Handwritten ,Printed
//         var printed = await recognizeText(
//           computerVisionClient,
//           "Handwritten",
//           printedText
//         );
//         printRecText(printed);
//       },
//       function() {
//         return new Promise(resolve => {
//           resolve();
//         });
//       }
//     ],
//     err => {
//       throw err;
//     }
//   );
// }

function printRecText(ocr) {
  var startingWord = "Signatory";
  var retrievedRecords = {};
  retrievedRecords[startingWord] = "";
  if (ocr.lines.length) {
    console.log("Recognized text:");
    for (let line of ocr.lines) {
      var isStartingWordPresent = false;
      for (let word of line.words) {
        if (isStartingWordPresent) {
          retrievedRecords[startingWord] =
            retrievedRecords[startingWord] + " " + word.text;
        }
        if (word.text == startingWord) {
          isStartingWordPresent = true;
        }
      }
    }
    retrievedRecords[startingWord] = retrievedRecords[startingWord]
      .replace(":", "")
      .trim();
    console.log(JSON.stringify(retrievedRecords));
  } else {
    console.log("No recognized text.");
  }
  //return retrievedRecords;
  var output = data.filter(function(el) {
    return el.farmer == retrievedRecords[startingWord];
  });
  console.log(output);
  if (output.length == 1) {
    retrievedData = output[0];
  } else {
    retrievedRecords = {};
  }
}

exports.createFarmerInsurance = (req, res, next) => {
  console.log("req", req.body);
  const url = req.protocol + "://" + req.get("host");
  const imgUrl =
    req.protocol +
    "://" +
    req.get("host") +
    "/insurance-plan-images/" +
    req.file.filename;
  cvtext(imgUrl).then(() => {
    console.log("retrieved data", retrievedData);
    if (isEmpty(retrievedData)) {
      const insurance = new Insurance({
        farmerId: req.userData.userId,
        isFormComplete: 1,
        imagePath: url + "/insurance-plan-images/" + req.file.filename
      });
    } else {
      const insurance = new Insurance({
        farmerId: req.userData.userId,
        isFormComplete: 1,
        premiumPercentage:
          (retrievedData.premiumRemitted / retrievedData.SumInsured) * 100,
        insurancePlanNumber: retrievedData.certificateNumber,
        insuranceStartDate: new Date(retrievedData.startingDate),
        insuranceEndDate: new Date(retrievedData.endDate),
        insuredAmount: retrievedData.SumInsured,
        imagePath: url + "/insurance-plan-images/" + req.file.filename,
        insuranceId: retrievedData.certificateNumber
      });
    }
    insurance
      .save()
      .then(result => {
        res.status(201).json({
          message: "Insurance add step1 completed successfully",
          insurance: {
            ...result,
            id: result._id
          }
        });
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({
          message: "Couldn't add new insurance!"
        });
      });
  });
};
exports.getAllFarmerInsurances = (req, res, next) => {
  insuranceQuery = Insurance.find({ farmerId: req.userData.userId })
    .then(results => {
      res.status(200).json({
        message: "Insurances fetched Successfully",
        insuranceList: results,
        insuranceCount: results.length
      });
    })
    .catch(err => {
      res.status(500).json({
        message: "Couldn't fetch Insurance list!"
      });
    });
};

exports.getFarmerInsurance = (req, res, next) => {
  Insurance.findById(req.params.id)
    .then(insurance => {
      if (insurance) {
        res.status(200).json(insurance);
      } else {
        res.status(404).json({
          message: "Insurance not found!"
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Couldn't fetch the Insurance!"
      });
    });
};

exports.editFarmerInsurance = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/insurance-plan-images/" + req.file.filename;
  }
  cvtext(imagePath).then(() => {
    let insurance;
    if (imagePath != null) {
      if (isEmpty(retrievedData)) {
        insurance = new Insurance({
          _id: req.params.id,
          farmerId: req.userData.userId,
          isFormComplete: 1,
          imagePath: imagePath
        });
      } else {
        insurance = new Insurance({
          _id: req.params.id,
          farmerId: req.userData.userId,
          isFormComplete: 1,
          premiumPercentage:
            (retrievedData.premiumRemitted / retrievedData.SumInsured) * 100,
          insurancePlanNumber: retrievedData.certificateNumber,
          insuranceStartDate: new Date(retrievedData.startingDate),
          insuranceEndDate: new Date(retrievedData.endDate),
          insuredAmount: retrievedData.SumInsured,
          imagePath: imagePath,
          insuranceId: retrievedData.certificateNumber
        });
      }
    }
    if (!req.file) {
      insurance = new Insurance({
        ...req.body,
        _id: req.params.id
      });
    }
    Insurance.updateOne(
      { _id: req.params.id, farmerId: req.userData.userId },
      insurance
    )
      .then(result => {
        if (result.n > 0) {
          res.status(200).json({
            message: "Update successful!",
            insurance: result
          });
        } else {
          res.status(401).json({
            message: "Not Authorized!"
          });
        }
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({
          message: "Couldn't update insurance!"
        });
      });
  });
};

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

exports.deleteFarmerInsurance = (req, res, next) => {
  // Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
  //   if (result.n > 0) {
  //     res.status(200).json({
  //       message: "Delete successful!",
  //       post: result
  //     });
  //   } else {
  //     res.status(401).json({
  //       message: "Not Authorized!"
  //     });
  //   }
  // }).catch((error) => {
  //   res.status(500).json({
  //     message: "Couldn't delete post!"
  //   })
  // });
};

exports.submitFarmerInsurance = (req, res, next) => {
  let insurance = new Insurance({
    ...req.body,
    _id: req.params.id
  });
  Insurance.updateOne(
    { _id: req.params.id, farmerId: req.userData.userId },
    insurance
  )
    .then(result => {
      if (result.n > 0) {
        // res.status(200).json({
        //   message: "Update successful!",
        //   insurance: result
        // });
      } else {
        res.status(401).json({
          message: "Not Authorized!"
        });
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: "Couldn't update insurance!"
      });
    });

  Insurance.findById(req.params.id).then(insurance => {
    Farm.findById(insurance.farmId).then(farm => {
      console.log(farm.polygonPoints);
      let farmRegion = farm.polygonPoints.coordinates.map(point => {
        return [point[0][0], point[1][0]];
      });
      console.log(farmRegion);
      var socket = require("socket.io-client")("http://localhost:8888", {
        query: "points=" + JSON.stringify(farmRegion)
      });

      socket.on("connect", function() {
        var triggered = false;
        console.log("connected to the socket at 8888");
        var precipitationValues = [];
        var movingSum = 0;
        socket.on("temperature", function(value) {
          console.log(value);
          var length = precipitationValues.length;
          if (length >= 10) {
            var poppedVal = precipitationValues.shift();
            movingSum -= poppedVal;
          }
          movingSum += value;
          precipitationValues.push(value);
        
          if (precipitationValues.length >= 10) {
            if (movingSum <= 5 && !triggered) {
              //drought call
              console.log("Drought!!");
              triggered = true;
              acquireTokenWithClientCredentials(
                RESOURCE,
                CLIENT_APP_Id,
                CLIENT_SECRET,
                AUTHORITY
              ).then(token => {
                // console.log("token", 'Bearer ' + token.access_token);
                const body = {
                  workflowActionParameters: [
                    {
                      name: "weatherCondition",
                      value: "0",
                      workflowFunctionParameterId: 72
                    }
                  ],
                  workflowFunctionID: 34
                };

                // console.log(authToken);
                var options = {
                  method: "POST",
                  url:
                    "https://elderwand-7e32bo-api.azurewebsites.net/api/v2/contracts/" +
                    contractId +
                    "/actions",
                  qs: {
                    workflowID: "9",
                    contractCodeId: "9",
                    connectionId: "1"
                  },
                  headers: {
                    "cache-control": "no-cache",
                    Connection: "keep-alive",
                    Host: "elderwand-7e32bo-api.azurewebsites.net",
                    Authorization: authToken,
                    "Content-Type": "application/json"
                  },
                  body: body,
                  json: true
                };

                request(options, function(error, response, body) {
                  // console.log(body,response);
                  if (error) throw new Error(error);

                  console.log(body);
                });
              });
            } else if (movingSum >= 200 && !triggered) {
              console.log("Flood!!");
              triggered = true;
              acquireTokenWithClientCredentials(
                RESOURCE,
                CLIENT_APP_Id,
                CLIENT_SECRET,
                AUTHORITY
              ).then(token => {
                // console.log("token", 'Bearer ' + token.access_token);
                const body = {
                  workflowActionParameters: [
                    {
                      name: "weatherCondition",
                      value: "1",
                      workflowFunctionParameterId: 72
                    }
                  ],
                  workflowFunctionID: 34
                };

                // console.log(authToken);
                var options = {
                  method: "POST",
                  url:
                    "https://elderwand-7e32bo-api.azurewebsites.net/api/v2/contracts/" +
                    contractId +
                    "/actions",
                  qs: {
                    workflowID: "9",
                    contractCodeId: "9",
                    connectionId: "1"
                  },
                  headers: {
                    "cache-control": "no-cache",
                    Connection: "keep-alive",
                    Host: "elderwand-7e32bo-api.azurewebsites.net",
                    Authorization: authToken,
                    "Content-Type": "application/json"
                  },
                  body: body,
                  json: true
                };

                request(options, function(error, response, body) {
                  // console.log(body,response);
                  if (error) throw new Error(error);

                  console.log(body);
                });
              });
            }
          }
        });
      });

      acquireTokenWithClientCredentials(
        RESOURCE,
        CLIENT_APP_Id,
        CLIENT_SECRET,
        AUTHORITY
      ).then(token => {
        // console.log("token", 'Bearer ' + token.access_token);
        const body = {
          workflowFunctionId: 33,
          workflowActionParameters: [
            {
              name: "owner",
              value: "0xcb5ad8e94e4072bbbe6db9436aa76d7e9efed059"
            },
            {
              name: "Farmer",
              value: "0xaa6a449ff41779b5da602a76d6f2696baa587471"
            },
            {
              name: "premiumPercent",
              value: insurance.premiumPercentage.toString()
            },
            {
              name: "insuredAmt",
              value: insurance.insuredAmount.toString()
            },
            {
              name: "insPlanNo",
              value: insurance.insurancePlanNumber
            },
            {
              name: "farmId",
              value: insurance.farmId
            },
            {
              name: "minPrecipitationRate",
              value: "5"
            },
            {
              name: "maxPrecipitationRate",
              value: "200"
            },
            {
              name: "cropName",
              value: farm.cropType
            }
          ]
        };

        // console.log(authToken);
        var options = {
          method: "POST",
          url:
            "https://elderwand-7e32bo-api.azurewebsites.net/api/v2/contracts",
          qs: { workflowID: "9", contractCodeId: "9", connectionId: "1" },
          headers: {
            "cache-control": "no-cache",
            Connection: "keep-alive",
            Host: "elderwand-7e32bo-api.azurewebsites.net",
            Authorization: authToken,
            "Content-Type": "application/json"
          },
          body: body,
          json: true
        };

        request(options, function(error, response, body) {
          // console.log(body,response);
          if (error) throw new Error(error);
          res.status(201).json({
            message: "Smart Contract Added"
          });
          contractId = body;
          console.log(body);
        });
      });
    });
  });
};
