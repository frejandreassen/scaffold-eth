import { List } from "antd";
import { useEventListener } from "eth-hooks/events/useEventListener";
import Address from "./Address";
import TokenBalance from "./TokenBalance";

/**
  ~ What it does? ~

  Displays a lists of events

  ~ How can I use? ~

  <Events
    contracts={readContracts}
    contractName="YourContract"
    eventName="SetPurpose"
    localProvider={localProvider}
    mainnetProvider={mainnetProvider}
    startBlock={1}
  />
**/

export default function Events({ contracts, contractName, eventName, localProvider, mainnetProvider, startBlock }) {
  // 📟 Listen for broadcast events
  const events = useEventListener(contracts, contractName, eventName, localProvider, startBlock);

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <h2>{eventName} Events:</h2>
      <List
        bordered
        dataSource={events}
        renderItem={item => {
          return (
            <List.Item key={item.blockNumber + "_" + item.args.sender + "_" + item.args.purpose}>
              <Address address={item.args[0]} ensProvider={mainnetProvider} fontSize={16} />
              {/* <b>{item.args[1].toString()}</b> */}
              {(item.args[1] > 100) ? (
              <TokenBalance balance={item.args[1]} provider={localProvider} />) : (
              <b>{item.args[1].toString()}</b>)}
              {/* {item.args[1].toString().indexOf("E") == -1 ? (
                <TokenBalance balance={item.args[1]} provider={localProvider} />
              ) : (
                `${item.args[1].toString()}`
              )} */}
            </List.Item>
          );
        }}
      />
    </div>
  );
}
