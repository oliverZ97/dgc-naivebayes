const fs = require("fs");
const striphtml = require("string-strip-html")
var bayes = require('bayes');
var bayesClass = bayes();
var documents = []

function startClassifier() {
    let option = process.argv[2];
    if(option) {
        console.log("Start classifying the Testset!")
        classifyTestSet()
    } else {
        console.log("Start train the Model with Articles and create a Testset")
        parseJSONFile()
    }
}

function classifyTestSet() {
    let model = fs.readFileSync("./model.json");
    bayesClass = bayes.fromJson(model);
    let testSet = JSON.parse(fs.readFileSync("../results/testset.json"))
    let resultData = []
    testSet.forEach((article) => {
        if(article.content === undefined) {
            console.log("undefined text at article " + article.externalId);
        } else {
            let strippedText = striphtml(article.content);
            let result = bayesClass.categorize(strippedText);
            let correct = false;
            if(result === article.category) {
                correct = true;
            }
            let resultString = article.externalId + "," + article.category + "," + result + "," + correct;
            resultData.push(resultString);
        }
    })
    writeResultDataToCSV(resultData);
}

function writeResultDataToCSV(resultData){
    let csv = "";
    resultData.forEach((elem) => {
        csv += elem + "\n"
    })
    fs.writeFileSync("../results/nb_resultData.csv", csv);
    console.log("Successfully write results in resultData.csv!")
}

function parseJSONFile() {
    let filedir = fs.readdirSync("../data");
    filedir.forEach((file) => {
        let filestring = fs.readFileSync("../data/" + file);
        let fileobj = JSON.parse(filestring);
        let docs = extractDocuments(fileobj);
        docs.forEach((elem) => {
            documents.push(elem);
        })
    })
    removeTestData();
    writeTrainingDataToFile();
    //teachModel();
}

function extractDocuments(jsonobj) {
    let docs = jsonobj.documents;
    return docs;
}

function removeTestData() {
    let length = documents.length;
    let nr = documents.length/10;
    let nrOfCategory = nr/4;
    let set_one = documents.splice(0, nrOfCategory);
    let set_two = documents.splice(length/4, nrOfCategory)
    let set_three = documents.splice((length/4)*2, nrOfCategory)
    let set_four = documents.splice((length/4)*3, nrOfCategory)
    let testData = set_one.concat(set_two).concat(set_three).concat(set_four);
    writeTestDataToFile(testData)
}

function writeTestDataToFile(testData) {
    let data = JSON.stringify(testData);
    fs.writeFileSync("../results/testset.json", data)
}

function writeTrainingDataToFile() {
    let data = JSON.stringify(documents);
    fs.writeFileSync("../results/trainingset.json", data)
}

function teachModel() {
    documents.forEach((article) => {
        if(article.content === undefined) {
            console.log("undefined text at article " + article.externalId)
        } else {
            let strippedText = striphtml(article.content);
            bayesClass.learn(strippedText, article.category);
        }
    })
    saveModel()
}

function saveModel() {
    var model = bayesClass.toJson();
    fs.writeFileSync("./model.json", model)
}

startClassifier();