const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const {getPCList, exitFunction} = require('./ProvisionedConcurrency');
const {getRCList} = require('./ReservedConcurrency');
const RETRY_COUNT = 3; 
const RETRY_WAIT = 30000;
const { LambdaClient, ListFunctionsCommand } = require("@aws-sdk/client-lambda");

// List functions using AWS SDK V2

// async function listFunctions(){
//     let hasMoreFunctions = true; 
//     let next_marker;
//     let FunctionNamesList = [];
    
//     while(hasMoreFunctions){
//         let params = {};
//         if(next_marker) params.Marker = next_marker;
        
//         try{
//             let data = await lambda.listFunctions(params).promise();
//             data.Functions.map(functionInfo => FunctionNamesList.push(functionInfo.FunctionName));
            
//             if(data.Functions.length == 50){
//                 hasMoreFunctions = true;
//                 next_marker = data.NextMarker; 
//             }
//             else{
//                 hasMoreFunctions = false;
//             }
//         }
//         catch(err){
//             throw err;
//         }
//     }    
    
//     return new Promise((resolve, reject) => {
//         (FunctionNamesList.length > 0)? 
//             resolve(FunctionNamesList):
//             reject("No Functions available in this region");
//     });
// }


// List Functions using AWS SDK V3

function listFunctions(){
    let FunctionNamesList = [];
    let next_marker;
    
    return new Promise( (resolve, reject) => {
        (async() => {
            const client = new LambdaClient();
            let params = {};
            const command = new ListFunctionsCommand(params);
            do{
                try{
                    const results = await client.send(command);
                    results.Functions.map((functionInfo) => {
                        FunctionNamesList.push(functionInfo.FunctionName);
                    });
                    if(results.NextMarker){
                        params.Marker = results.NextMarker;
                        next_marker = true;    
                    }
                    else
                        next_marker = false;
                }
                catch(err){
                    console.error(err);
                    reject(err);
                }    
            }while(next_marker);
            resolve(FunctionNamesList);
        })();
    });
}

const wait = ms => new Promise((resolve) => setTimeout(resolve, ms));

exports.handler = async (event) => {
    let p_cnt = 0, r_cnt =0;
    let result = await listFunctions();
    console.log("# of FUNCTIONS - ", result.length);
    
    console.log("\n#########\n PC LIST \n#########\n");
    // Retrying 3 times with a delay of 30 seconds between the calls 
    do{
        let PC_Data = await getPCList(result);
        if(PC_Data[0].length > 0){
            console.log(PC_Data[0]);
        }

        if(PC_Data[1].size > 0){
            // Copy the retry list to the result array 
            await wait(RETRY_WAIT);
            
            result = [];
            result = [...PC_Data[1]];
            ++p_cnt;
        }
        else{
            break;
        }
    }while(p_cnt < RETRY_COUNT);
    
    // Reserved Concurrency 
    console.log("\n#########\n RC LIST \n#########\n");
    // Retrying 3 times with a delay of 30 seconds between the calls 
    do{
        let RC_Data = await getRCList(result);
        if(RC_Data[0].length > 0){
            console.log(RC_Data[0]);
        }
        
        if(RC_Data[1].size > 0){
            // Wait for 30 seconds before retry 
            await wait(RETRY_WAIT);
            result = [];
            result = [...RC_Data[1]];
            ++r_cnt;
        }
        else{
            break;
        }
    }while(r_cnt < RETRY_COUNT);
    
    await exitFunction(); 

    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};