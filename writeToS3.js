const AWS = require('aws-sdk');
const fs = require('fs');

function loadConfig(){
    return new Promise((resolve, reject) => {
        fs.readFile('/var/task/config.json', 'utf8' , (err, data) => {
          if (err) {
            reject("Error reading configuration file", err);
          }
          resolve(JSON.parse(data));
        });
    });
}


function writeToS3(){
    return new Promise(async(resolve, reject ) => {
        await loadConfig().then((data) =>{
            const S3 = new AWS.S3({region: data.S3_Region});
            
            fs.readFile("/tmp/" + data.S3_Filename, 'utf-8', function (err, content) {
                if (err) {
                    console.log("Error while reading the PC List from /tmp ", err);
                    reject(err);
                }
                
                let params = {
                  Bucket: data.S3_Bucket_Name,
                  Key: data.S3_Filename,
                  Body: content
                };
                
                S3.putObject(params, function(err, data) {
                  if (err){
                    console.log(err, err.stack); // an error occurred
                    reject(err);
                  } 
                  else{
                      console.log(data);           // successful response
                      resolve(data);
                  }     
                });
            });
        });
    });
}

module.exports.writeToS3 = writeToS3;