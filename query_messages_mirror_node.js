const {
    AccountId,
    PrivateKey,
    Client,
    TopicCreateTransaction,
    TopicMessageQuery,
    TopicMessageSubmitTransaction
} = require("@hashgraph/sdk");
require('dotenv').config();

const myAccountID = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY); // Initialize myPrivateKey as a PrivateKey object

if (!myAccountID || !myPrivateKey) {
    throw new Error("MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
}

const client = Client.forTestnet();
client.setOperator(myAccountID, myPrivateKey);

async function queryMessagesMirrorNode() {
    //create a new public topic
    let txResponse = await new TopicCreateTransaction().execute(client);

    //grab the newly generated topic ID
    let receipt = await txResponse.getReceipt(client);
    let topicId = receipt.topicId;
    console.log(`Your topic ID is: ${topicId}`);

    //submit messages
    await new TopicMessageSubmitTransaction({
        topicId: topicId, message: "Tom",
    }).execute(client);
    await new TopicMessageSubmitTransaction({
        topicId: topicId, message: "Jerry",
    }).execute(client);
    await new TopicMessageSubmitTransaction({
        topicId: topicId, message: "Mr.Bean",
    }).execute(client);

}

queryMessagesMirrorNode();

/*
Query the Hedera Mirror Node API
https://testnet.mirrornode.hedera.com/api/v1/topics/<topicID>/messages

Retrieve a specific message by sequence number
https://testnet.mirrornode.hedera.com/api/v1/topics/<topicID>/messages?sequencenumber=2

Advanced filtering methods for HCS messages
https://testnet.mirrornode.hedera.com/api/v1/topics/<topicID>/messages?sequencenumber=gte:2
 */