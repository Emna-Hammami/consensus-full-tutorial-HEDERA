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

async function submitPrivateMessage() {
    //create a new topic
    let txResponse = await new TopicCreateTransaction()
            .setSubmitKey(myPrivateKey.publicKey).execute(client);

    //grab the newly generated topic ID
    let receipt = await txResponse.getReceipt(client);
    let topicID = receipt.topicId;
    console.log(`Your topic ID is : ${topicID}`);

    //wait 5 sec between consensus topic creation and subscription creation
    await new Promise((resolve) => setTimeout(()=> resolve(), 5000));

    //subscribe to the topic
    new TopicMessageQuery().setTopicId(topicID)
            .subscribe(client, null, (message) => {
                let messageAsString = Buffer.from(message.contents, "utf8").toString();
                console.log(
                    `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
                );
            });

    //send message to private topic
    let submitMsgTx = await new TopicMessageSubmitTransaction({
        topicId: topicID, message: "Submitkey set !",
    }).freezeWith(client).sign(myPrivateKey);

    let submitMsgTxSubmit = await submitMsgTx.execute(client);

    //get the receipt of the transaction
    let getReceipt = await submitMsgTxSubmit.getReceipt(client);

    //get the status of the transaction
    const transactionStatus = getReceipt.status;
    console.log(`The message transaction status: `+ transactionStatus);

}

submitPrivateMessage();