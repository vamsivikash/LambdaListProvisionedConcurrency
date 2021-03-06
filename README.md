# List AWS Lambda Functions with Provisioned and Reserved Concurrency

This is a simple AWS Lambda function written in Javascript to get the list of functions with Provisioned and Reserved Concurrency. Check out my [Medium post!](https://vamsi-vikash.medium.com/list-aws-lambda-functions-with-provisioned-concurrency-reserved-concurrency-c047953ec09d) for a brief explanation.

## Getting Started

After downloading/Cloning the project, we need to install all the dependencies. The code is written to run on AWS Lambda and does not include any AWS SDK dependencies. This is a lightweight application and uses just two modules "fs" and "AWS SDK V3". We can even skip the fs module if you are not writing the output to a file. Once we have all the dependencies, zip the files together and upload it to AWS Lambda.

You can deploy the script quickly and easily using SAM

## Option 1 - SAM Deploy

```
cd LambdaListProvisionedConcurrency/
sam build
sam depoy --guided
```

Enter a name for the Deployment stack and the region where you would like to check for the list of functions with PC. The SAM template will add the necessary permissinos needed for the lambda function along with packaging the code. Once successfully deployed, look out for the function with the name "ListFuctionsWithPC" and invoke the function, you should be able to see the PC functions list in the Cloudwatch logs. 

## Option 2 - Traditional Deployment

```
cd LambdaListProvisionedConcurrency/
npm install
zip -r lambdaPC *

```

For the script to run, the function's execution role needs the GET and READ permissions:

NOTE: Additional permissions are required to write to CloudWatch logs

```
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "lambda:ListProvisionedConcurrencyConfigs",
                "lambda:ListFunctions",
                "lambda:GetFunctionConcurrency"
            ],
            "Resource": "*"
        }
```

### Configuration

Memory: 512 MB
Timeout: 3 minutes

### References: 

SDK V3 Examples - https://github.com/awsdocs/aws-doc-sdk-examples

