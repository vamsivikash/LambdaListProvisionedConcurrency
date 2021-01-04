const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const fs = require('fs');
const FILENAME = "Summary.txt";
const writeStream = fs.createWriteStream('/tmp/'+FILENAME);
let func_cnt = 0; 


function getProvisionedConcurrencyConfig(functionName){
    let result = undefined;
    return new Promise((resolve, reject) => {
        
        let provision_params = {
            FunctionName: functionName
        };
        
        // List the Provisioned Concurrency for the Function 
        
        lambda.listProvisionedConcurrencyConfigs(provision_params, function(err, data){
            if(err){
                console.log("ERROR - FUNCTION NAME ", functionName);
                result = {
                    "data":null,
                    "retry":true
                };
                resolve(result);
            }
            else{
                let info = ++func_cnt + ". Function: " + functionName;
                console.log(info);
                if(data.ProvisionedConcurrencyConfigs.length > 0){
                    result= {
                        "data": data.ProvisionedConcurrencyConfigs
                    };
                    writeStream.write("\n#########################\n\n");
                    writeStream.write(info+ " has the config " + JSON.stringify(data.ProvisionedConcurrencyConfigs) + "\n");
                    writeStream.write("\n#########################\n");
                    resolve(result);
                }
                else{
                    result = {
                        "data": null
                    };
                    writeStream.write("\n No PC Config in  "+ info);
                    resolve(result);
                }
            }
        });
    }); 
}

async function getPCList(result){
    
    let PCList = [];
    let PCRetryList = new Set();
    
    await Promise.all(result.map( async(functionName) => {
        await getProvisionedConcurrencyConfig(functionName)
        .then((config) => {
            if(config.data != null){
                PCList.push({
                    "Function Name ": functionName,
                    "Config ":JSON.stringify(config.data)
                });
            }
            else if(config.retry){
                PCRetryList.add(functionName);
            }
        });
    }));
    writeStream.end();
    return [PCList, PCRetryList];
}

function exitFunction(){
    func_cnt = 0; 
}

module.exports.getPCList = getPCList; 
module.exports.exitFunction = exitFunction;