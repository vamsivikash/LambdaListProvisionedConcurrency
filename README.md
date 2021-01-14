# List AWS Lambda Functions with Provisioned and Reserved Concurrency

This is a simple AWS Lambda function written in Javascript to get the list of functions with Provisioned and Reserved Concurrency. Check out my [Medium post!](https://vamsi-vikash.medium.com/list-aws-lambda-functions-with-provisioned-concurrency-reserved-concurrency-c047953ec09d) for a brief explanation.

## Getting Started

After downloading/Cloning the project, we need to install all the dependencies. The code is written to run on AWS Lambda and does not include any AWS SDK dependencies. This is a lightweight application and uses just two modules "fs" and "AWS SDK V3". We can even skip the fs module if you are not writing the output to a file. Once we have all the dependencies, zip the files together and upload it to AWS Lambda.

```
cd LambdaListProvisionedConcurrency/
npm install
zip -r lambdaPC *

```

For the script to run, the function's execution role needs the GET and READ permissions:

NOTE: 

```
{
            "Sid": "123",
            "Effect": "Allow",
            "Action": [
                "lambda:ListFunctions",
                "lambda:ListVersionsByFunction",
                "lambda:GetLayerVersion",
                "lambda:GetEventSourceMapping",
                "lambda:GetFunction",
                "lambda:ListAliases",
                "lambda:GetAccountSettings",
                "lambda:GetFunctionConfiguration",
                "lambda:GetLayerVersionPolicy",
                "lambda:GetFunctionCodeSigningConfig",
                "lambda:ListFunctionEventInvokeConfigs",
                "lambda:ListProvisionedConcurrencyConfigs",
                "lambda:GetProvisionedConcurrencyConfig",
                "lambda:ListFunctionsByCodeSigningConfig",
                "lambda:GetFunctionConcurrency",
                "lambda:ListTags",
                "lambda:GetFunctionEventInvokeConfig",
                "lambda:ListEventSourceMappings",
                "lambda:ListLayerVersions",
                "lambda:ListLayers",
                "lambda:GetCodeSigningConfig",
                "lambda:ListCodeSigningConfigs",
                "lambda:GetAlias",
                "lambda:GetPolicy"
            ],
            "Resource": "*"
        },

```

### References: 

SDK V3 Examples - https://github.com/awsdocs/aws-doc-sdk-examples

