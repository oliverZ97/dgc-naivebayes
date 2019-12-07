var bayes = require('bayes');
var bayesClass = bayes();
const fs = require("fs");
const striphtml = require("string-strip-html")
var documents = []

//csv => articleid, realCat, computedCat, Match

function parseJSONFile() {
    let filedir = fs.readdirSync("./data");
    filedir.forEach((file) => {
        let filestring = fs.readFileSync("./data/" + file);
        let fileobj = JSON.parse(filestring);
        //console.log(fileobj);
        let docs = extractDocuments(fileobj);
        docs.forEach((elem) => {
            documents.push(elem);
        })
    })
    console.log(documents.length)
    removeTestData();
    //saveModel()
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
    console.log(testData.length);
    writeTestDataToFile(testData)
}

function writeTestDataToFile(testData) {
    //data is an array
    let testdata = {
        documents: []
    }
    let data = JSON.stringify(testData);
    let postfix = getDateForFilename();
    fs.writeFileSync("./testset" + postfix + ".json", data)
    
}

function teachModel(text, category) {
    bayesClass.learn(text, category);
}

function saveModel() {
    var model = bayesClass.toJson();
    console.log()
}

function getDateForFilename() {
    var today = new Date();
    var date = today.getFullYear()+''+(today.getMonth()+1)+''+today.getDate();
    var time = today.getHours() + "" + today.getMinutes() + "" + today.getSeconds();
    var dateTime = date+time;
    console.log(dateTime)
    return dateTime
}
parseJSONFile()
