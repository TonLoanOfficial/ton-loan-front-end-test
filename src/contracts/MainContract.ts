import {Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode,} from '@ton/core';

export type    MainConfig = {
    number: number;
    address: Address;
    owner_address: Address;
};

export function mainConfigToCell(config: MainConfig): Cell {
    return beginCell()
        .storeUint(config.number, 32)
        .storeAddress(config.address)
        .storeAddress(config.owner_address)
        .endCell();
}

export class MainContract implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
    }

    static createFromAddress(address: Address) {
        return new MainContract(address);
    }

    static createFromConfig(config: MainConfig, code: Cell, workchain = 0) {
        const data = mainConfigToCell(config);
        const init = {code, data};
        return new MainContract(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeInt(1, 32).storeInt(0, 32).endCell(),
        });
    }

    async getState(provider: ContractProvider) {
        return await provider.getState();
    }

    async getData(provider: ContractProvider): Promise<{
        number: number;
        recent_sender: Address,
        owner_address: Address
    }> {
        const {stack} = await provider.get('get_contract_storage_data', [])
        return {number: stack.readNumber(), recent_sender: stack.readAddress(), owner_address: stack.readAddress()};
    }

    async getBalance(provider: ContractProvider) {
        const {stack} = await provider.get('balance', []);
        return {number: stack.readNumber()}
    }

    async sendIncrement(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        increment_by: number
    ) {
        const msg_body = beginCell()
            .storeUint(1, 32)        // OP code
            .storeInt(increment_by, 32)   // increment_by value
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body
        });
    }

    async sendDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
        const msg_body = beginCell()
            .storeInt(2, 32)
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body
        })
    }

    async sendNoCodeDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
        const msg_body = beginCell().endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body
        });
    }

    async sendWithdrawalRequest(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        amount: bigint
    ) {
        const msg_body = beginCell()
            .storeUint(3, 32)
            .storeCoins(amount)
            .endCell();
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body
        });
    }

}
