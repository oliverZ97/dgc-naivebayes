/*******************************************************************************************************/
/*******************************************************************************************************/
/*
*author: Oliver Ziemann
*description: This is a simple naive-bayes classifier written in node.js. It uses the npm-package bayes. 
*
*
*It classifies texts from articles. To work, every article object needs the following properties:
*
*article.externalId - the unique id of each article
*article.category - the real category of the Article. This is the comparative value to see if the 
*                   classification was successful
*article.content - the text of the article
*
*You can choose between train a model with data or classify articles with the model. 
*When you train the model, all json files inside the ./data Folder get read in. 10% of the articles 
*of each file get extracted to use them as testset. They get written in the testset.json file. 
*The Rest is used to train the model. After the model is trained, the model is written in the model.json file. 
*
*To classify a testset you need to run the training function at least one time. 
*Otherwise you dont have a testset to classify nor a model to classify with.
*
*To train the model type "npm start"
*To classify a testset type "npm start true"
*
*Hope you have fun!
*Happy Coding.
*/
/*******************************************************************************************************/
/*******************************************************************************************************/
const fs = require("fs");
const striphtml = require("string-strip-html")
var bayes = require('bayes');
var bayesClass = bayes();
var documents = []
/*******************************************************************************************************/
/*
*description: this function is the entrypoint of the script. If called via the terminal it starts the 
*classifyTestSet function iy true is typed after the script call like "npm run start true". 
*Otherwise it starts the other path.
*@param: 
*@return: 
*/
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
/*******************************************************************************************************/
//https://www.npmjs.com/package/bayes
//https://www.npmjs.com/package/string-strip-html
/*
*description: this function gets the model by reading model.json. The model is used to categorize each 
*article of the testset.json by using the naive bayes classifier. The naive Bayes classifier needs the 
*whole article text which is found in the property article.content. Before it gets categorized html tags gets removed. 
*A string for each article is build, containing the id, the real category, the classified category and 
*an indicator if the classififcation was correct. The string is pushed into an array.
*@param: 
*@return: 
*/
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
/*******************************************************************************************************/
/*
*description: this function writes a .csv file containing one line for each element in resultData.
*@param: resultData{array} - contains one string per article which was classified. 
*        The string contains information about the classification.
*@return: 
*/
function writeResultDataToCSV(resultData){
    let csv = "";
    resultData.forEach((elem) => {
        csv += elem + "\n"
    })
    fs.writeFileSync("../results/nb_resultData.csv", csv);
    console.log("Successfully write results in resultData.csv!")
}
/*******************************************************************************************************/
/*
*description: this function starts the path of train a model for the naive bayes classifier. 
*It reads each file in the ../data directory and parses them to json objects. 
*All article objects inside the files get extracted and pushed into a global array called "documents".
*@param: 
*@return: 
*/
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
    teachModel();
}
/*******************************************************************************************************/
/*
*description: extract the value of the property documents of the given jsonobj and returns it.
*@param: jsonobj {object} - an object containing an amount of documents which is needed but also more 
*                           data which is not relevant for any other step of the whole classifier.
*@return: docs {array} - an array containing all article objects needed in the next steps.
*/
function extractDocuments(jsonobj) {
    let docs = jsonobj.documents;
    return docs;
}
/*******************************************************************************************************/
/*
*description: this function remove a tenth of the data and save them in a new array called testData. 
*The testData consists of a quarter each of one of the categories. The objects which are used in the 
*testData get removed from the global documents array
*@param: 
*@return: 
*/
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
/*******************************************************************************************************/
/*
*description: this function writes the testData into a .json file.
*@param: testData {array} - containing article objects which build the data to test the algorithms.
*@return: 
*/
function writeTestDataToFile(testData) {
    let data = JSON.stringify(testData);
    fs.writeFileSync("../results/testset.json", data)
}
/*******************************************************************************************************/
/*
*description: after the testData is removed the remaining article objects build the trainingset. 
*They are also written down to file of type .json.
*@param: 
*@return: 
*/
function writeTrainingDataToFile() {
    let data = JSON.stringify(documents);
    fs.writeFileSync("../results/trainingset.json", data)
}
/*******************************************************************************************************/
//https://www.npmjs.com/package/bayes
//https://www.npmjs.com/package/string-strip-html
/*
*description: this function is to start train a model. The model is trained by a function of the npm package bayes. 
*It is trained by giving an article and his category to the method. Repeating this action multiple times with many 
*articles will train the model to a reliable level. If the model is trained it is written down to a file.
*@param: 
*@return: 
*/
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
/*******************************************************************************************************/
/*
*description: this function saves a trained model to a .json file to use it for categorize unknown articles.
*@param: 
*@return: 
*/
function saveModel() {
    var model = bayesClass.toJson();
    fs.writeFileSync("./model.json", model)
}
/*******************************************************************************************************/
startClassifier();