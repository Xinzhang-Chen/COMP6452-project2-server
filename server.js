const { Web3 } = require('web3');
const express = require('express');
const mongoose = require('mongoose');
const emailInstance = require('./utils/email');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
require('dotenv').config();

// MongoDB Atlas connection URI
const mongoURI = process.env.MONGO_URI;

// MongoDB Schema and Model
const contractSchema = new mongoose.Schema({
  newContract: String,
  dueTime: Number,
  email: String,
});

const Contract = mongoose.model('Contract', contractSchema);

// Connect to MongoDB Atlas
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Web3 connection to the blockchain network
const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.BLOCKCHAIN_RPC_URL));

// Contract ABI and address
const contractABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'ManagerABI.json'), 'utf8'));
const contractAddress = process.env.CONTRACT_ADDRESS;

// Variables to store the contract and accounts
let contract;
let accounts;

// Function to initialize the contract and accounts
async function initializeContract() {
  try {
    await web3.eth.net.isListening();
    console.log('Connected to the network');

    // Get the contract instance and accounts
    contract = new web3.eth.Contract(contractABI, contractAddress);
    accounts = await web3.eth.getAccounts();
    listenForEvents();
  } catch (err) {
    console.error('Failed to connect:', err);
  }
}

// Function to set up event listeners for the contract activated event
function setUpContractActivated(contract) {
  contract.events.ContractActivated({ fromBlock: 'latest' }).on('data', async (event) => {
    const dueTime = Number(event.returnValues.deadline);
    const email = event.returnValues.email;
    try {
      console.log('New contract deployed:', event.returnValues.borrowContractAddress);
      // Save to MongoDB
      await Contract.create({
        newContract: event.returnValues.borrowContractAddress,
        dueTime,
        email,
      });

      const mailOptions = {
        from: 'Defi APP',
        to: email,
        subject: 'Your borrow contract is activated and the fund is ready',
        text: `Hi there, your contract ${event.returnValues.borrowContractAddress} is activated and the fund is ready. please pull from the contract contract`,
      };

      emailInstance.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        }
        console.log('Email sent:', info);
      });

      console.log('Saved to MongoDB');
    } catch (error) {
      console.error('Error saving to MongoDB:', error);
    }
  });
}

function setUpContractFunded(contract) {
  contract.events.ContractFunded({ fromBlock: 'latest' }).on('data', async (event) => {
    const contractAddress = event.returnValues.contractAddress;

    // MongoDB find the email address for this specific contractAddress
    const emailAddress = await Contract.findOne({ newContract: contractAddress });

    const mailOptions = {
      from: 'Defi APP',
      to: emailAddress,
      subject: 'Your borrow contract is activated and the fund is ready',
      text: `Hi there, your contract ${contractAddress} is activated and the fund is ready. please pull from the contract contract`,
    };
    emailInstance.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      }
      console.log('Email sent:', info);
    });
  });
}

function listenForEvents() {
  console.log('Start to listen for events');
  if (contract && contract.events) {
    setUpContractActivated(contract);
    // setUpContractFunded(contract);
  } else {
    console.error('Error: contract not initialized');
  }
}

async function updateContractStatus(contractToUpdate) {
  try {
    const gasEstimate = await contract.methods.deactivateContract(contractToUpdate).estimateGas({ from: accounts[0] });

    const result = await contract.methods.deactivateContract(contractToUpdate).send({
      from: accounts[0],
      gas: gasEstimate,
    });
    return result;
  } catch (error) {
    console.error("Failed to update contract's flag:", error);
    throw error;
  }
}

async function checkDueTime() {
  console.log('Checking due time');
  const currentTime = Date.now();

  try {
    // Get all the contracts that are due from MongoDB
    const dueContracts = await Contract.find({ dueTime: { $lte: currentTime } });

    // For each due contract, call the updateFlag function
    for (const contract of dueContracts) {
      console.log('Contract is due:', contract);
      // Change the contract status to inactive
      try {
        await updateContractStatus(contract.newContract);
        // Remove the due contract from the database
        await Contract.deleteOne({ _id: contract._id });
      } catch (error) {
        console.error('Error calling updateContractFlag:', error);
      }
    }
  } catch (error) {
    console.error('Error checking due contracts:', error);
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  initializeContract();
  setInterval(checkDueTime, 3000);
});
