import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React from "react";
import { Link } from "react-router-dom";
import { Address, Balance } from "../components";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ contractName, readContracts }) {
  // you can also use hooks locally in your component of choice
  const signaturesRequired = useContractReader(readContracts, contractName, "signaturesRequired");

  return (
    <div style={{padding: 16, width: 400, margin: "64px auto 64px auto"  }}>
      <h1>Multi Sig Contract</h1>
      <div>
        <Address address={readContracts[contractName]?.address}/>
      </div>
      <div>
        <Balance address={readContracts[contractName]?.address}/>
      </div>
      <div>
        <p><b># Signers: </b>{}</p>
      </div>
    </div>
  );
}

export default Home;
