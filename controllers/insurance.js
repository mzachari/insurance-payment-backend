const Insurance = require("../models/insurance");

const data = require("../middleware/data.json");
const async = require("async");
const fs = require("fs");
const path = require("path");
const createReadStream = require("fs").createReadStream;
const sleep = require("util").promisify(setTimeout);
const ComputerVisionClient = require("@azure/cognitiveservices-computervision")
  .ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

let key = "cec09bc0343d44af8ad167469126f30f";
let endpoint = "https://ocrengine.cognitiveservices.azure.com/";
if (!key) {
  throw new Error(
    "Set your environment variables for your subscription key and endpoint."
  );
}
let computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);

let retrievedData = {}

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
  const printedText = imagePath;
  console.log(
    "Recognizing printed text...",
    printedText.split("/").pop()
  );
  //Handwritten ,Printed
  var printed = await recognizeText(
    computerVisionClient,
    "Handwritten",
    printedText
  );
  printRecText(printed);
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
  var output = data.filter(function (el){
    return el.farmer == retrievedRecords[startingWord]
  })
  console.log(output);
  if(output.length==1){
    retrievedData=output[0];
  }
  else{
    retrievedRecords={}
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
  cvtext(imgUrl).then( () => {
    console.log("retrieved data", retrievedData);
    const insurance = new Insurance({
      farmerId: req.userData.userId,
      isFormComplete: 1,
      premiumPercentage: retrievedData.premiumRemitted/retrievedData.SumInsured *100,
      insurancePlanNumber: retrievedData.certificateNumber,
      insuranceStartDate: new Date(retrievedData.startingDate),
      insuranceEndDate: new Date(retrievedData.endDate),
      insuredAmount: retrievedData.SumInsured,
      imagePath: url + "/insurance-plan-images/" + req.file.filename,
      insuranceId: retrievedData.certificateNumber
    });
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
  insuranceQuery = Insurance.find()
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
  Insurance.findById(req.params.id).then(insurance => {
    if (insurance) {
      res.status(200).json(insurance);
    } else {
      res.status(404).json({
        message: 'Insurance not found!'
      })
    }
  })
    .catch((error) => {
      res.status(500).json({
        message: "Couldn't fetch the Insurance!"
      })
    });
};

exports.editFarmerInsurance = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/insurance-plan-images/" + req.file.filename;
  }
  cvtext().then( () => {
    console.log("retrieved data", retrievedData);
    let insurance = new Insurance({
      _id: req.params.id,
      farmerId: req.userData.userId,
      isFormComplete: 1,
      premiumPercentage: retrievedData.premiumRemitted/retrievedData.SumInsured *100,
      insurancePlanNumber: retrievedData.certificateNumber,
      insuranceStartDate: new Date(retrievedData.startingDate),
      insuranceEndDate: new Date(retrievedData.endDate),
      insuredAmount: retrievedData.SumInsured,
      imagePath: imagePath,
      insuranceId: retrievedData.certificateNumber
    });
    if(!req.file) {
        insurance = new Insurance({
          ...req.body,
          _id: req.params.id
        });
    }
  Insurance.updateOne({ _id: req.params.id}, insurance).then(result => {
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
  }).catch((error) => {
    console.log(error);
    res.status(500).json({
      message: "Couldn't update insurance!"
    })
  });
});
};

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
