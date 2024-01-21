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
const myPrivateKey = process.env.MY_PRIVATE_KEY;

if (!myAccountID || !myPrivateKey) {
    throw new Error("MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
}

const client = Client.forTestnet();
client.setOperator(myAccountID, myPrivateKey);

async function submitFirstMessage() {
    //1. CREATE YOUR 1ST TOPIC
    //create a new topic
    let txResponse = await new TopicCreateTransaction().execute(client);

    //grab the newly generated topic ID
    let receipt = await txResponse.getReceipt(client);
    let topicID = receipt.topicId;
    console.log(`Your topic ID is: ${topicID}`);

    //wait 5 seconds between consensus topic creation and subscription creation
    await new Promise((resolve) => setTimeout(()=> resolve(), 5000));

    //2. SUBSCRIBE TO A TOPIC
    new TopicMessageQuery().setTopicId(topicID)
                .subscribe(client, null, (message) => {
                    let messageAsString = Buffer.from(message.contents, "utf8").toString();
                    console.log(
                        `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
                    );
                });

    //3. SUBMIT A MESSAGE
    //send message to the topic
    let sendResponse = await new TopicMessageSubmitTransaction({
        topicId : topicID,
        message : "Hola !",
    }).execute(client);

    //get the receipt of the transaction
    const getReceipt = await sendResponse.getReceipt(client);

    //get the status of the transaction
    const transactionStatus = getReceipt.status;
    console.log("The message transaction status " + transactionStatus);
}

submitFirstMessage();