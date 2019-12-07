This is a simple naive-bayes classifier written in node.js. It uses the npm-package bayes. 
https://www.npmjs.com/package/bayes

It classifies texts from articles. To work, every article object needs the following properties:

article.externalId - the unique id of each article
article.category - the real category of the Article. This is the comparative value to see if the classification was                       successful
article.content - the text of the article

You can choose between train a model with data or classify articles with the model. When you train the model, all json files inside the ./data Folder get read in. 10% of the articles of each file get extracted to use them as testset. They get written in the testset.json file. The Rest is used to train the model. After the model is trained, the model is written in the model.json file. 

To classify a testset you need to run the training function at least one time. Otherwise you dont have a testset to classify nor a model to classify with.

To train the model type "npm start false"
To classify a testset type "npm start true"

Hope you have fun!
Happy Coding.