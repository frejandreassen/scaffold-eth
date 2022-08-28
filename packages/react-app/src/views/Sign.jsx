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

  const signTransaction = async (item)  => {

    const newHash = await readContracts[contractName].getTransactionHash(
      item.nonce,
      item.to,
      parseEther("" + parseFloat(item.amount).toFixed(12)),
      item.data,
    );

    const signature = await userSigner?.signMessage(ethers.utils.arrayify(newHash));
    const recover = await readContracts[contractName].recover(newHash, signature);
    const isSigner = await readContracts[contractName].isSigner(recover);
    if (isSigner) {
        const newSignatures = [...item.signatures, signature]
        const newSigners = [...item.signers, recover]
      
        const res = await axios.patch(`${backendUrl}/${item.id}` , {
        ...item,
        signatures: newSignatures,
        signers: newSigners,
      });
    }
    getTransactions();
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
      key: 'nonce'
    },
    {
      title: 'To',
      dataIndex: 'to',
      key: 'to',
      render: (_, { to }) => ( <Address address={to} fontSize={12} style={{padding:4}}/>)
    },
    {
      title: 'Data',
      key: 'data',
      render: (_, { data, amount }) => {
        if (data.toString() === '0x')  return (
          <div><b>Value: </b>{amount} ether</div>
        )
        const parsedData = readContracts[contractName]?.interface?.parseTransaction({data: data.toString(), value:amount})
        return ( 
          <>
            {/* <pre>{JSON.stringify(parsedData, null, 2)}</pre> */}
            <div><b>Function name: </b>{parsedData.functionFragment?.name}</div>
            <div><b>Input args: </b>{parsedData.args[0].toString()}</div>
            <div><b>Value: </b>{parsedData.value.toNumber()} ether</div>
          </>
        )
      }
    },
    {
      title: 'Signatures',
      dataIndex: 'signatures',
      key: 'signatures',
      render: (_, { signatures }) => {
        return (
        <>
          {signatures.length} / {signaturesRequired.toNumber()} {(signatures.length >= signaturesRequired.toNumber()) ? "✅" : ""}
        </>
      )},
    },
    {
      title: 'Signed',
      dataIndex: 'signers',
      key: 'signers',
      render: (_, { signers }) => {
        return (
        <>
          {signers.map((signer, i) =>(
            <div><Address key={i} address={signer} minimized style={{padding:4}}/></div>
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
            onClick={() => signTransaction(item)}
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