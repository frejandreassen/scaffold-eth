
# 🏗 scaffold-eth | 🏰 BuidlGuidl

  

## 🚩 Challenge X: 📜✍ Multisig Wallet  📜✍
  

> 🧪 Multisigs are smart contracts with built in voting super powers. A tool for on chain **democracy** or increased security. With the use of a 2/3 multisig signed by your own accounts, you can safely loose the private keys to up to one of your accounts without loosing your good night's sleep. 

> 🪄 This challenge also includes some off-chain magic - as we are exploring ways to interact with the multisig and utilize your private key signing power without incurring expensive gas fees. The creation and signing of all Multisig proposals will be handled off-chain - but you will use your Wallet to add your signature using your private keys.

> 🎯Build a `MetMultiSig.sol` contract that adds and remove `signers`  and updates the number of `signaturesRequired` in order to execute transactions with the `execute()` function. 

> 🤑 In order  to save on gas fees for the contract signers, we will be using off-chain `Meta transactions`. We use the function `getTransactionHash` to compute the proposed transaction information into a hash that we can sign using Metamask or other wallet. We store the transaction information in a separate database where we keep track of all signatures.  The signatures are validated with the `recover()` function at time of on-chain transaction execution. Read more on meta transactions [here](https://medium.com/@austin_48503/ethereum-meta-transactions-90ccf0859e84).

> 🌟 The final deliverable is a 2/3 multisig with two of your own addresses and the buidlguidl multisig as the third signer. (buidlguidl.eth is like your backup recovery). You should be able to propose basic transactions like adding signers, removing signers and updating the number of signatures required. You should be able to sign the transactions and only execute the transaction when at least the required number of signatures have been achieved. 

> 💬 Meet other builders working on this challenge and get help in the [Challenge X Telegram]()!

### Checkpoint 0: 📦 install 📚
```
git clone git clone https://github.com/frejandreassen/scaffold-eth meta-multi-sig 
cd meta-multi-sig
git checkout meta-multi-sig
yarn install
```