const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
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
        let PC_Data = await getPCList(result);
        
        if(PC_Data[1].size > 0){
            // Copy the retry list to the result array 
            await wait(RETRY_WAIT);
            
            result = [];
            result = [...PC_Data[1]];
            ++p;
        }
        else{
            console.log("PC LIST IS ", PC_Data[0]);
            break;
        }
    }while(p < RETRY_COUNT);
    
    // Reserved Concurrency 
    
    // Retrying 3 times with a delay of 30 seconds between the calls 
    do{
        let RC_Data = await getRCList(result);
        
        if(RC_Data[1].size > 0){
            // Copy the retry list to the result array 
            await wait(RETRY_WAIT);
            
            result = [];
            result = [...RC_Data[1]];
            ++r;
        }
        else{
            console.log("RC List is ", RC_Data[0]);
            break;
        }
    }while(r < RETRY_COUNT);
    
    await exitFunction(); 

    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};