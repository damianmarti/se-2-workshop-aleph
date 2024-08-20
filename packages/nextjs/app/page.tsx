"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address, AddressInput, EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [newMessage, setNewMessage] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");
  const [newDelegate, setNewDelegate] = useState<string>("");

  const { data: greeting } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
  });

  const { data: delegate } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "delegate",
  });

  const { data: counterByAddress } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "userGreetingCounter",
    args: [connectedAddress],
  });

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");

  const {
    data: events,
    isLoading: isLoadingEvents,
    error: errorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "GreetingChange",
    fromBlock: 1n,
    watch: true,
    blockData: true,
    transactionData: true,
    receiptData: true,
  });

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="text-center text-lg">{greeting}</p>
          <p className="text-center text-lg">Counter by address: {counterByAddress?.toString()}</p>
          <p className="text-center text-lg">
            <EtherInput value={newValue} onChange={setNewValue} />
            <input
              type="text"
              placeholder="The value to set"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  await writeYourContractAsync({
                    functionName: "setGreeting",
                    args: [newMessage],
                    value: parseEther(newValue),
                  });
                } catch (e) {
                  console.error("Error setting greeting:", e);
                }
              }}
            >
              Set Greeting
            </button>
          </p>
          <p className="text-center text-lg">
            Delegate:
            <Address address={delegate} />
          </p>
          <p className="text-center text-lg">
            <AddressInput onChange={setNewDelegate} value={newDelegate} placeholder="Input your address" />
            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  await writeYourContractAsync({
                    functionName: "setDelegate",
                    args: [newDelegate],
                  });
                } catch (e) {
                  console.error("Error delegating:", e);
                }
              }}
            >
              Set Delegate
            </button>
          </p>
          <p className="text-center text-lg">
            Events
            {isLoadingEvents && <span>Loading...</span>}
            {errorReadingEvents && <span>Error: {errorReadingEvents.message}</span>}
            {events && (
              <ul>
                {events.map((event, i) => (
                  <li key={i}>
                    <Address address={event.args.greetingSetter} /> - {event.args.newGreeting}
                  </li>
                ))}
              </ul>
            )}
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
