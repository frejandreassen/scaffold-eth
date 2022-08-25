import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Select, InputNumber, Space, Input } from "antd";
import { AddressInput, EtherInput } from "../components";
import { ethers } from "ethers";
import { parseEther } from "@ethersproject/units";
const { Option } = Select;

const axios = require("axios");

export default function CreateTransaction({
  backendUrl,
  contractName,
  contractAddress,
  mainnetProvider,
  localProvider,
  price,
  readContracts,
  signer,
  nonce,
  signaturesRequired,
}) {
  const history = useHistory();

  const [methodName, setMethodName] = useState("addSigner")
  const [newSignaturesRequired, setNewSignaturesRequired] = useState(signaturesRequired)
  const [amount, setAmount] = useState("0");
  const [callData, setCallData] = useState("0x");
  const [address, setAddress] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const [hasEdited, setHasEdited] = useState() //we want the signaturesRequired to update from the contract _until_ they edit it

  useEffect(()=>{
    if(!hasEdited){
      setNewSignaturesRequired(signaturesRequired)
    }
  },[signaturesRequired])


  const inputStyle = {
    padding: 10,
  };

  const computeCallData = async () => {
    let arg = (methodName == "updateSignaturesRequired" ) ? newSignaturesRequired : address;
    if (arg && methodName) {
      let computedCallData = readContracts[contractName]?.interface?.encodeFunctionData(methodName, [address]);
      setCallData(computedCallData)
      setTo(readContracts[contractName].address)
    }
  }

  const createTransaction = async () => {
    try {
      setLoading(true)
      const newHash = await readContracts[contractName].getTransactionHash(
        nonce.toNumber(),
        to,
        parseEther("" + parseFloat(amount).toFixed(12)),
        callData,
      );

      console.log("New hash ", newHash)
      const signature = await signer?.signMessage(ethers.utils.arrayify(newHash));
      console.log("signature: ", signature);

      const recover = await readContracts[contractName].recover(newHash, signature);
      console.log("recover: ", recover);

      const isSigner = await readContracts[contractName].isSigner(recover);
      console.log("isSigner: ", isSigner);

      setTimeout(() => {
        setLoading(false);
      }, 1000);

      if (isSigner) {
        const res = await axios.post(backendUrl, {
          chainId: localProvider._network.chainId,
          address: readContracts[contractName]?.address,
          nonce: nonce.toNumber(),
          to: to,
          amount,
          data: callData,
          hash: newHash,
          signatures: [signature],
          signers: [recover],
        });

        console.log("RESULT", res.data);
        setTimeout(() => {
          history.push("/");
          setLoading(false);
        }, 1000);
      }
    } catch(error) {
      console.log("Error: ", error);
      setLoading(false);
    }
  };

  return (
    <div>

      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <div style={{ margin: 8 }}>
          <h2>Compute calldata</h2>
          <div style={{ margin: 8, padding: 8 }}>
            <Select value={methodName} style={{ width: "100%" }} onChange={setMethodName}>
              <Option key="addSigner">Add Signer</Option>
              <Option key="removeSigner">Remove Signer</Option>
              <Option key="updateSignaturesRequired">Update # of Signatures Required</Option>
            </Select>
          </div>
          
          <>
            <div style={inputStyle}>
              {(methodName != "updateSignaturesRequired") &&
                <AddressInput
                  autoFocus
                  ensProvider={mainnetProvider}
                  placeholder={"Address"}
                  value={address}
                  onChange={setAddress}
                />
              }
            </div>
            <div style={inputStyle}>
              {(methodName == "updateSignaturesRequired") &&
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="New # of signatures required"
                  value={newSignaturesRequired}
                  onChange={(value)=>{
                    setNewSignaturesRequired(value)
                    setHasEdited(true)
                  }}
                />
              }
            </div>
            <Space style={{ marginTop: 32 }}>
              <Button
                onClick={computeCallData}
                type="primary"
              >
                Compute
              </Button>
            </Space>
            
          </>
        </div>
      </div>

      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <div style={{ margin: 8 }}>
          <h2>Create meta transaction</h2>
          <>
            <div style={inputStyle}>
              <AddressInput
                autoFocus
                ensProvider={mainnetProvider}
                placeholder={"Address"}
                value={to}
                onChange={setTo}
              />
            </div>
            <div style={inputStyle}>
              <EtherInput
                price={price}
                mode="USD"
                value={amount}
                onChange={setAmount}
              />
            </div>
            <div style={inputStyle}>
              <Input
                value={callData}
                // readOnly={true}
                disabled
              />
            </div>
            <Space style={{ marginTop: 32 }}>
              <Button
                loading={loading}
                onClick={createTransaction}
                type="primary"
              >
                Create
              </Button>
            </Space>
            <p>Sign the transaction with your wallet to add your signature to the calldata hash. The signing is not an on-chain transaction (no gas!) View the meta transactions on the transactions tab.</p>
          </>
        
        </div>

      </div>
    </div>
  );
}