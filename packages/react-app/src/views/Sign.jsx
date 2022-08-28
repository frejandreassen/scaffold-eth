import React, { useCallback, useEffect, useState } from "react";
import { Button, List, Table, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { ConsoleSqlOutlined, SyncOutlined } from "@ant-design/icons";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { Address, AddressInput, Balance, Blockie, TransactionListItem } from "../components";
import { usePoller } from "eth-hooks";

const axios = require("axios");

const DEBUG = false;

export default function Sign({
  backendUrl,
  contractName,
  signaturesRequired,
  address,
  nonce,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  blockExplorer}) {

  const [transactions, setTransactions] = useState();
  const getTransactions = async () => {
    const res = await axios.get(
      backendUrl + '?filter[address]=' + readContracts[contractName].address,
    );
    console.log("backend data: ", res.data)
    setTransactions(res.data.data)
  };


  useEffect(() => {   
    if (readContracts[contractName]) getTransactions();
  }, [readContracts[contractName]]);

  const sign = (item)  => {
    console.log("SIGN TRANSACTION")
  }

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Nonce',
      dataIndex: 'nonce',
      key: 'nonce',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (_, { address }) => ( <Address address={address} fontSize={14} style={{padding:4}}/>)
    },
    {
      title: 'Data',
      key: 'data',
      render: (_, { data, amount }) => {
        const parsedData = readContracts[contractName]?.interface?.parseTransaction({data: "0xeb12d61e00000000000000000000000078018618083bd5d7cba4b280fdf1907b13075699", value:1})
        return ( 
          <>
            <pre>{JSON.stringify(parsedData, null, 2)}</pre>
            <div><b>Args: </b>{parsedData.args}</div>
            <div><b>Args: </b>{parsedData.args}</div>
          </>
        )
      }
    },
    {
      title: '🖉 Signatures',
      dataIndex: 'signatures',
      key: 'signatures',
      render: (_, { signatures }, signaturesRequired) => {
        return (
        <>
          {signatures.length} / {signaturesRequired} {(signatures.length >= signaturesRequired) ? "✅" : ""}
        </>
      )},
    },
    {
      title: 'Signers',
      dataIndex: 'signers',
      key: 'signers',
      render: (_, { signers }) => {
        return (
        <>
          {signers.map((signer, i) =>(
            <Address key={i} address={signer} fontSize={14} style={{padding:4}}/>
          ))
          }
        </>
      )},
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, item) => {
        const hasSigned = item.signers.indexOf(address) >= 0;
        return (
        <>
          <Button
            type="secondary"
            onClick={sign(item)}
            disabled={(hasSigned)}
          >
            Sign
          </Button>
        </>
      )},
    },
  ]


  return (
    <div style={{ maxWidth: 850, margin: "auto", marginTop: 32, marginBottom: 32 }}>
      <h1>
        <b style={{ padding: 16 }}>Meta Transactions</b>
      </h1>

      <Table
        bordered
        dataSource={transactions}
        columns={columns}
        // renderItem={item => {
        //   const hasSigned = item.signers.indexOf(address) >= 0;
        //   const hasEnoughSignatures = item.signatures.length <= signaturesRequired.toNumber();

        //   console.log("transaction details:", item);

        //   return (
        //     <>
        //       <div style={{padding:16}}>
        //         <div></div>
        //         <Address address={item.address} fontSize={14} style={{padding:4}}/>
        //         <span></span>
        //         <span style={{padding:4}}>
        //           {item.signatures.length}/{signaturesRequired.toNumber()} {item.signatures.length===signaturesRequired.toNumber() ? "✅" : ""}
        //         </span>
        //         <span></span>
        //         <span style={{padding:4}}>
        //           <Button
        //             type="secondary"
        //             onClick={async () => {
        //               const newHash = await readContracts[contractName].getTransactionHash(
        //                 item.nonce,
        //                 item.to,
        //                 parseEther("" + parseFloat(item.amount).toFixed(12)),
        //                 item.data,
        //               );
        //             }}
        //             disabled={(hasSigned || hasEnoughSignatures)}
        //           >
        //             Sign
        //           </Button>
        //         </span>
        //     </div>
        //   </>
        //   );
        // }}
      />
    </div>
  );
}