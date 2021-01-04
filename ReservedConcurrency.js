const AWS = require('aws-sdk');
const lambda = new AWS.Lambda(); 

function getReservedConcurrency(functionName){
    let RC_result;
    return new Promise((resolve, reject) => {
        let concur_params = {
            FunctionName: functionName
        };
        lambda.getFunctionConcurrency(concur_params, function(err, data) {
           if (err){
             console.log(err, err.stack);
             RC_result = {
                 "data": null,
                 "retry": true
             };
             resolve(err);
           }  
           else{
               // Function has a Reserved Concurrency:
               if(data){
                   RC_result = {
                       "data": data.ReservedConcurrentExecutions
                   };
                   resolve(RC_result);
               }
               // No Reserved Concurrency
               else{
                   RC_result = {
                       "data":null
                   };
                   resolve(RC_result);
               }
           }
        });
    });
}

async function getRCList(result){
    let RCList = [];
    let RCRetryList = new Set();
    
    await Promise.all(result.map( async(functionName) => {
        let reserve = await getReservedConcurrency(functionName);
        if(reserve.data != null){
            RCList.push({
                "Function Name ": functionName,
                "Reserved Concurrency ": reserve.data
            });
        }
        else if(reserve.retry){
            RCRetryList.add(functionName);
        }
    }));
    
    return [RCList, RCRetryList];
}

module.exports.getRCList = getRCList;