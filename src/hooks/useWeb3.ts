import Web3 from "web3"

export const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_ENERGI_NODE_1 ?? 'https://nodeapi.energi.network/v1/jsonrpc'))
