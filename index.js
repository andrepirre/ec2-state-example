'use strict';

const app = require("./lib/app.js");


exports.handler = async(event, context, callback) => {

    try {
        console.log(process.env.AWS_REGION);
        
        const result = await app(event.region, event.detail['instance-id'], event.detail.state, event.time);

        callback(null, result);
    }
    catch (err) {
        callback(err.message);
    }

};
