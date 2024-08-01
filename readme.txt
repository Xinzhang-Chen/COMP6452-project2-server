This is the customized server for the project.

- It will add event listeners to the blockchain to listen for the events emitted by the smart contract.
- It will store the data in the mongoDB Atlas database and send a email to the user when the event is emitted.

- Guide to setup the server:
  1. cd into the server folder
  2. Run `npm install` to install the dependencies
  3. Make a ".env" file in the root directory of the server folder and add the following:
    - EMAILUSER=<username for the email provider>
    - EMAILPASS=<password for the email provider>
    - MONGO_URI=<mongoDB Atlas connection URI>
    - BLOCKCHAIN_RPC_URL=<blockchain RPC URL>
    - CONTRACT_ADDRESS=<The deployed "Manager" contract address>
  
  For the first 2, guide to get credentials: https://medium.com/@y.mehnati_49486/how-to-send-an-email-from-your-gmail-account-with-nodemailer-837bf09a7628
  MONGO_URI: https://www.mongodb.com/docs/v6.2/reference/connection-string/
  BLOCKCHAIN_RPC_URL: During testing, we use Ganache. So it set to "ws://localhost:8545", but for the other network, it will be the RPC URL of the blockchain.
  CONTRACT_ADDRESS: The address of the deployed "Manager" contract.

  4. Run `npm start` to start the server.


