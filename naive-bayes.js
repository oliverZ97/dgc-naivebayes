var bayes = require('bayes');
var bayesClass = bayes();
const fs = require("fs");
const striphtml = require("string-strip-html")

//csv => articleid, realCat, computedCat, Match

function parseJSONFile() {
    let filedir = fs.readdirSync("./data");
    filedir.forEach((file) => {
        let filestring = fs.readFileSync("./data/" + file);
        let fileobj = JSON.parse(filestring);
        //console.log(fileobj);
        extractDocuments(fileobj);
    })
    //saveModel()
}

function extractDocuments(jsonobj) {
    let documents = jsonobj.documents;
    let testset = extractTestData(documents)
    // documents.forEach(element => {
    //     let text = element.content;
    //     console.log(text);
    //     let stripText = striphtml(text);
    //     //teachModel(stripText, element.category)
    // });
}

function extractTestData(documents) {
    let testdata = JSON.stringify(documents.slice(0, 199));
    console.log(testdata);
    fs.writeFileSync("./data/test.json", testdata);

}

function teachModel(text, category) {
    bayesClass.learn(text, category);
}

function saveModel() {
    var model = bayesClass.toJson();
    console.log()
}
parseJSONFile()
