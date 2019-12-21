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
  "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6InBpVmxsb1FEU01LeGgxbTJ5Z3FHU1ZkZ0ZwQSIsImtpZCI6InBpVmxsb1FEU01LeGgxbTJ5Z3FHU1ZkZ0ZwQSJ9.eyJhdWQiOiI4MWE4NmRiZS1iMGRmLTQwNTgtODUzZS01MjM5MjdjY2NhZjYiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83ODg4MzJjZS04OGU1LTQ1N2QtODBhMi0yYzZkMmM4YzQzM2IvIiwiaWF0IjoxNTc2NzgzNTg0LCJuYmYiOjE1NzY3ODM1ODQsImV4cCI6MTU3Njc4NzQ4NCwiYWlvIjoiQVZRQXEvOE5BQUFBcWFXS09RM0diSVExdXp5bFhEY09wcFN4UHNmdFJXVGRVZC8rSmI1SVByUTJtc29vOTJDQlhvK1JwTDNWVUZnK2pxK2JSM1ppVXB5WWZzczRjN04vK3ZYb3poYXNaMmNuS1Q0MnppZ3lYNlE9IiwiYW1yIjpbInB3ZCJdLCJlbWFpbCI6InRoZS5lbGRlci53YW5kLnRlY2hAZ21haWwuY29tIiwiZmFtaWx5X25hbWUiOiJaYWNoYXJpYSIsImdpdmVuX25hbWUiOiJNYXJpYSIsImlkcCI6ImxpdmUuY29tIiwiaXBhZGRyIjoiMTU3LjQ1LjIxMC4xNzUiLCJuYW1lIjoiTWFyaWEgWmFjaGFyaWEiLCJub25jZSI6ImEwN2NlOTJkLTI4NmMtNDYzMy04NmUyLTA3Zjk5ZTBmOWUwMiIsIm9pZCI6IjJjYTU1ODFhLTllMzctNDUzOC1iNTE4LWNiMTFkYWMxYmExYSIsInJvbGVzIjpbIkFkbWluaXN0cmF0b3IiXSwic3ViIjoiUTIyQXlfOTJMaWgzcWNmclRyc1JLZlB3dTYwMEFFZy1PS0E5TGRQNV8zWSIsInRpZCI6Ijc4ODgzMmNlLTg4ZTUtNDU3ZC04MGEyLTJjNmQyYzhjNDMzYiIsInVuaXF1ZV9uYW1lIjoibGl2ZS5jb20jdGhlLmVsZGVyLndhbmQudGVjaEBnbWFpbC5jb20iLCJ1dGkiOiJrN0cxVEVWRXlFNlNla3RieWdvdEFBIiwidmVyIjoiMS4wIn0.xYnwT4N4YLBHSOSFU2sa69mAp8NDHSMUHF_XP9DFUCqiYjNpl0rmGxKw6RevScpixKG9SROtbUjbZM3nIukDOwftvbseHX6p341z8dWTmtBDETZUaPONyYzvKGQt_n9ca1A6ReVJlNv0uTy90NVTFJc5t7azdLtPg2TYeZH57T6k_DGosVKvS-L5yoXDvHVyIHDPiDZyIDB5oCkVGcuqU-Ur1tf9chWgaYE3a_48Eahyb48m9Qvy-RRivmtZq7yLB4VZByA5p0W5TqfSQtWm2iaNLaNit-fPjmI_51S94PcxCFzTg-plg1tt6KRz4ysZM96YWLI2MgY50v9ttsVVMw";
const ComputerVisionClient = require("@azure/cognitiveservices-computervision")
  .ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

const AUTHORITY =
  "https://login.microsoftonline.com/788832ce-88e5-457d-80a2-2c6d2c8c433b";
const WORKBENCH_API_URL = "https://elderwand-7e32bo-api.azurewebsites.net";
const RESOURCE = "81a86dbe-b0df-4058-853e-523927cccaf6";
const CLIENT_APP_Id = "d8f438f3-2ef9-4069-8930-4d54f34fc083";
const CLIENT_SECRET = "TD4NPh57KOGSMaCmO0lRiw=JGX/zc-[k";

let key = "c91186fe89e84bd0a1f97a17d625d450";
let endpoint = "https://elderwandocr.cognitiveservices.azure.com/";
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
  console.log("reached here", imagePath);
  if (imagePath != null) {
    const printedText = "http://13.68.181.244:3000/insurance-plan-images/insurance-plan-doc-1576909315092.jpg";
    console.log("Recognizing printed text...", printedText.split("/").pop());
    //Handwritten ,Printed
    try {
    var printed = await recognizeText(
      computerVisionClient,
      "Handwritten",
      printedText
    );
    }
    catch(error) {
      console.log("error!!", error);
    }
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
    var insurance;
    console.log("retrieved data", retrievedData);
    if (isEmpty(retrievedData)) {
      insurance = new Insurance({
        farmerId: req.userData.userId,
        isFormComplete: 1,
        imagePath: url + "/insurance-plan-images/" + req.file.filename
      });
    } else {
      insurance = new Insurance({
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
                console.log("token", 'Bearer ' + token.access_token);
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
         console.log("token", 'Bearer ' + token.access_token);
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
