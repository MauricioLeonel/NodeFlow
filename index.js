const express = require('express')
const app = express()

 app.use(express.json())
 app.use(express.urlencoded({extended:true}))

// Dialogflow library
const dialogflow = require('@google-cloud/dialogflow');
const { v4: uuidv4 } = require('uuid');
const sessionId = uuidv4();
const projectId = '';
let queries=[];
let sessiones={};
const languageCode = '';


const sessionClient = new dialogflow.SessionsClient();

async function detectIntent(
  projectId,
  sessionId,
  query,
  contexts,
  languageCode
) {
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

async function executeQueries(projectId, sessionId, queries, languageCode) {
  let context;
  let intentResponse;
  for (const query of queries) {
    try {
      intentResponse = await detectIntent(
        projectId,
        sessionId,
        query,
        context,
        languageCode
      );
      console.log('Detected intent');
      // console.log(
      //   `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
      // );
      context = intentResponse.queryResult.outputContexts;
      // console.log(intentResponse)
      // console.log(intentResponse.queryResult.fulfillmentMessages)
      return intentResponse.queryResult.fulfillmentText
    } catch (error) {
      console.log(error);
    }
  }
}


app.post('/telegram',async (req,res)=>{
  // console.log(req.body.text,'body')
  const {text,idUser} = req.body
  queries.push(text)
  if(!sessiones.hasOwnProperty(idUser)){
    sessiones = {...sessiones,[idUser]:uuidv4()}
  }
  
  const result = await executeQueries(projectId, sessiones[idUser], queries, languageCode);
  queries.pop()
  res.send(result)
})


app.listen(3001,()=>{
  console.log('todo oki')
})