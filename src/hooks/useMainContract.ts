import {useTonClient} from "./useTonClient.ts";
import {useEffect, useState} from "react";
import {Address, fromNano, OpenedContract, toNano} from "ton-core";
import {useAsyncInitialize} from "./useAsyncInitialize.ts";
import {MainContract} from "../contracts/MainContract.ts";
import {useTonConnect} from "./useTonConnect.ts";

export function useMainContract() {
    const client = useTonClient();
    const {sender} = useTonConnect();

    const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time))

    const [contractData, setContractData] = useState<null | {
        counter_value: number,
        recent_sender: Address,
        owner_address: Address
    }>();
    const [contract_balance, setBalance] = useState('');

    const mainContract = useAsyncInitialize(async () => {
        if (!client) return;
        const contract = new MainContract(
            Address.parse("EQC6jU4sO-S-8jsQ6BFvkKs0sBBhbeL6kTp1bizGwPt0RNnt") // replace with your address from tutorial 2 step 8
        );
        //@ts-ignore
        return client.open(contract) as OpenedContract<MainContract>;
    }, [client]);

    useEffect(() => {
        async function getValue() {
            if (!mainContract) return;
            setContractData(null)
            //@ts-ignore
            const val = await mainContract.getData();
            //@ts-ignore
            const balance = await mainContract.getBalance();
            setContractData({
                counter_value: val.number,
                recent_sender: val.recent_sender,
                owner_address: val.owner_address,
            });
            setBalance(fromNano(balance.number))
            await sleep(50000)
            getValue()
        }

        getValue();
    }, [mainContract])

    return {
        contract_address: mainContract?.address.toString(),
        ...contractData,
        ...{contract_balance: contract_balance},
        sendIncrement: async () => {
            //@ts-ignore
            return mainContract?.sendIncrement(sender, toNano("0.05"), 5)
        }
    };

}