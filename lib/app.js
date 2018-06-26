'use strict';

const AWS = require('aws-sdk');
const ec2 = new AWS.EC2();
const dynamodb = new AWS.DynamoDB();
const uuidv4 = require('uuid/v4');

module.exports = async(region, instanceid, state, time) => {


    //Busca o StackId da instancia inciada pelo cloudformation
    var params = {
        Filters: [{
            Name: "resource-id",
            Values: [
                instanceid
            ]
        }]
    };

    var result = await ec2.describeTags(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            throw err;
        }
        else {
            //console.log(data); // successful response
        }
    }).promise();

    //console.log(result);

    var tags = result.Tags;
    var stackId = null;

    for (var i = 0; i < tags.length; i++) {
        if (tags[i].Key === 'aws:cloudformation:stack-id') {
            stackId = tags[i].Value;
        }
    }

    if (stackId == null) {
        throw 'Não encontrei o Stackid para a instance-id :' + instanceid;
    }

    //persist on DynamoDB 
    var paramsDynamo = {
        Item: {
            "uuid": {
                S: uuidv4()
            },
            "stackId": {
                S: stackId
            },
            "state": {
                S: state
            },
            "time": {
                S: time
            }
        },
        ReturnConsumedCapacity: "TOTAL",
        TableName: "ec2-state-change-data"
    };
    var resultDynamo = await dynamodb.putItem(paramsDynamo, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred  
            throw err;
        }
        else {
            console.log(data); // successful response
        }
    }).promise();


    return  "StackID: " + stackId + " State:" + state + " on " + time;

};
