const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const PDF = require('./generatePDF');
const {getPCList, exitFunction} = require('./ProvisionedConcurrency');
const {getRCList} = require('./ReservedConcurrency');
const {writeToS3} = require('./writeToS3');
const RETRY_COUNT = 3; 
const RETRY_WAIT = 30000;

async function listFunctions(){
    let hasMoreFunctions = true; 
    let next_marker;
    let FunctionNamesList = [];
    
    while(hasMoreFunctions){
        let params = {};
        if(next_marker) params.Marker = next_marker;
        
        try{
            let data = await lambda.listFunctions(params).promise();
            data.Functions.map(functionInfo => FunctionNamesList.push(functionInfo.FunctionName));
            
            if(data.Functions.length == 50){
                hasMoreFunctions = true;
                next_marker = data.NextMarker; 
            }
            else{
                hasMoreFunctions = false;
            }
        }
        catch(err){
            throw err;
        }
    }    
    
    return new Promise((resolve, reject) => {
        (FunctionNamesList.length > 0)? 
            resolve(FunctionNamesList):
            reject("No Functions available in this region");
    });
}

const wait = ms => new Promise((resolve) => setTimeout(resolve, ms));

exports.handler = async (event) => {
     let p = 0, r =0;
    let result = await listFunctions();
    console.log("# of FUNCTIONS - ", result.length);
    
    // Retrying 3 times with a delay of 30 seconds between the calls 
    do{
        let config_retry = await getPCList(result);
        
        if(config_retry[1].size > 0){
            // Copy the retry list to the result array 
            await wait(RETRY_WAIT);
            
            result = [];
            result = [...config_retry[1]];
            ++p;
        }
        else{
            console.log("PC LIST IS ", config_retry[0]);
            break;
        }
    }while(p < RETRY_COUNT);
    
        
    await PDF.generatePDF();
    await writeToS3();
    await exitFunction(); 
    
    // Reserved Concurrency in progress 
    
    // Retrying 3 times with a delay of 30 seconds between the calls 
    do{
        let config_retry = await getRCList(result);
        
        if(config_retry[1].size > 0){
            // Copy the retry list to the result array 
            await wait(RETRY_WAIT);
            
            result = [];
            result = [...config_retry[1]];
            ++r;
        }
        else{
            console.log("RC List is ", config_retry[0]);
            break;
        }
    }while(r < RETRY_COUNT);
    
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};