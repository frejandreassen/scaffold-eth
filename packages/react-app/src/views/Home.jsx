import { List } from "antd";
import { useContractReader } from "eth-hooks";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { ethers } from "ethers";
import React from "react";
import { Link } from "react-router-dom";
import { Address, Balance, Events } from "../components";


/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ contractName, readContracts, localProvider, mainnetProvider, price }) {
  // you can also use hooks locally in your component of choice
  const signaturesRequired = useContractReader(readContracts, contractName, "signaturesRequired");
  const signers = useContractReader(readContracts, contractName, "getSigners");

  
  return (
    <div style={{padding: 16, width: 800, margin: "64px auto 64px auto"  }}>
      <h1>Multi Sig Contract</h1>
      <div>
        <Address address={readContracts[contractName]?.address}/>
      </div>
      <div>
        <Balance address={readContracts[contractName]?.address} provider={localProvider} price={price}/>
      </div>
      <div style={{border: "1px solid #cccccc", padding: 16, width: 400,  margin: "16px auto 16px auto"}}>
        {!signaturesRequired ? (<p>loading...</p>) : (<p><h2># Signatures required: </h2>{signaturesRequired.toNumber()}</p>)}
      </div>
      <div style={{border: "1px solid #cccccc", padding: 16, width: 400, margin: "16px auto 16px auto"}}>
        <h2>Signers - {signers ? (signers.length) : ('...')}</h2>
        <List 
          dataSource={signers}
          renderItem={item => (
            <List.Item>
              <div style={{margin: "auto"}}>
                <Address  fontSize={12} address={item} />
              </div>
            </List.Item>
          )}
        />
      </div>
      <div>
        <Events 
          contracts={readContracts}
          contractName={contractName}
          eventName="Signer"
          localProvider={localProvider}
          mainnetProvider={mainnetProvider}
          startBlock={1}
        />
      </div>
      <div>
        <Events 
          contracts={readContracts}
          contractName={contractName}
          eventName="SignaturesRequired"
          localProvider={localProvider}
          mainnetProvider={mainnetProvider}
          startBlock={1}
        />
      </div>
      <div>
        <Events 
          contracts={readContracts}
          contractName={contractName}
          eventName="Withdraw"
          localProvider={localProvider}
          mainnetProvider={mainnetProvider}
          startBlock={1}
        />
      </div>
      <div>
        <Events 
          contracts={readContracts}
          contractName={contractName}
          eventName="Deposit"
          localProvider={localProvider}
          mainnetProvider={mainnetProvider}
          startBlock={1}
        />
      </div>
    </div>
  );
}

export default Home;
