const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);
const localChainId = "31337";

describe("MultiSig", function () {
  let multiSig;
  let signerOne, signerTwo;
  let nonce=0;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("MetaMultiSig", function () {
    it("Should deploy MetaMultiSig", async function () {
      const MetaMultiSig = await ethers.getContractFactory("MetaMultiSig");
      [signerOne, signerTwo] = await ethers.getSigners();
      multiSig = await MetaMultiSig.deploy(localChainId, [signerOne.address], 1);
    });
    it("First signer should equal signerOne address", async function () {
      const signers = await multiSig.getSigners();
      expect(signers[0]).to.equal(signerOne.address);
      expect( await multiSig.isSigner(signerOne.address)).to.equal(true)
    });
    it("signerTwo should not be registered as signer", async function () {
      expect( await multiSig.isSigner(signerTwo.address)).to.equal(false)
    });
    it("Signatures required should equal 1", async function () {
      const signaturesRequired = await multiSig.signaturesRequired();
      expect(signaturesRequired.toNumber()).to.equal(1);
    });
    it("Should generate a signature and recover the address", async function () {
      const hash = await multiSig.getTransactionHash(nonce, signerOne.address, ethers.utils.parseEther("0.0"), '0x')
      const signature = await signerOne.signMessage(ethers.utils.arrayify(hash));
      const recover = await multiSig.recover(hash, signature);
      expect(recover).to.equal(signerOne.address);
    });
    it("Should add signerTwo to multiSig", async function () {
      const callData = multiSig.interface.encodeFunctionData("addSigner", [signerTwo.address])
      const hash = await multiSig.getTransactionHash(nonce, multiSig.address, 0, callData)
      const signature = await signerOne.signMessage(ethers.utils.arrayify(hash));
      const result = await multiSig.execute(multiSig.address, 0, callData, [signature]);
      nonce++;
      // console.log(result)
      expect( await multiSig.isSigner(signerTwo.address)).to.equal(true)
    });
    it("Should update signaturesRequired to 2", async function () {
      const callData = multiSig.interface.encodeFunctionData("updateSignaturesRequired", [2])
      const hash = await multiSig.getTransactionHash(nonce, multiSig.address, 0, callData)
      const signature = await signerOne.signMessage(ethers.utils.arrayify(hash));
      const result = await multiSig.execute(multiSig.address, 0, callData, [signature]);
      nonce++;
      // console.log(result)
      const signaturesRequired = await multiSig.signaturesRequired()
      expect( signaturesRequired.toNumber()).to.equal(2);
    });
    it("Should fail to remove signerTwo from multisig due to unsufficient number of signatures", async function () {
      const callData = multiSig.interface.encodeFunctionData("removeSigner", [signerTwo.address])
      const hash = await multiSig.getTransactionHash(nonce, multiSig.address, 0, callData)
      const signature = await signerOne.signMessage(ethers.utils.arrayify(hash));
      try{
        const result = await multiSig.execute(multiSig.address, 0, callData, [signature]);
      } catch(error) {
        console.log(error.message)
      }
      // console.log(result)
      expect( await multiSig.isSigner(signerTwo.address)).to.equal(true)
    });
    it("Should fail to remove signerTwo from multisig due to duplicate signings", async function () {
      const callData = multiSig.interface.encodeFunctionData("removeSigner", [signerTwo.address])
      const hash = await multiSig.getTransactionHash(nonce, multiSig.address, 0, callData)
      const signature = await signerOne.signMessage(ethers.utils.arrayify(hash));
      const signatureDuplicate = await signerOne.signMessage(ethers.utils.arrayify(hash));
      try{
        const result = await multiSig.execute(multiSig.address, 0, callData, [signature, signatureDuplicate]);
      } catch(error) {
        console.log(error.message)
      }
      // console.log(result)
      expect( await multiSig.isSigner(signerTwo.address)).to.equal(true)
    });
    it("Should remove signerTwo from multisig", async function () {
      const callData = multiSig.interface.encodeFunctionData("removeSigner", [signerTwo.address])
      const hash = await multiSig.getTransactionHash(nonce, multiSig.address, 0, callData)
      const signature = await signerOne.signMessage(ethers.utils.arrayify(hash));
      const signatureTwo = await signerTwo.signMessage(ethers.utils.arrayify(hash));
      //Sort signatures
      const signatures = (signerOne.address < signerTwo.address) ? [signature, signatureTwo] : [signatureTwo, signature];
      try{
        const result = await multiSig.execute(multiSig.address, 0, callData, signatures);
        nonce++;
      } catch(error) {
        console.log(error.message)
      }
      // console.log(result)
      expect( await multiSig.isSigner(signerTwo.address)).to.equal(false)
    });

    // describe("setPurpose()", function () {
    //   it("Should be able to set a new purpose", async function () {
    //     const newPurpose = "Test Purpose";

    //     await myContract.setPurpose(newPurpose);
    //     expect(await myContract.purpose()).to.equal(newPurpose);
    //   });

    //   it("Should emit a SetPurpose event ", async function () {
    //     const [owner] = await ethers.getSigners();

    //     const newPurpose = "Another Test Purpose";

    //     expect(await myContract.setPurpose(newPurpose))
    //       .to.emit(myContract, "SetPurpose")
    //       .withArgs(owner.address, newPurpose);
    //   });
    // });
  });
});
