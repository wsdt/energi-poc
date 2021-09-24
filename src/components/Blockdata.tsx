import {Component} from "react";
import {web3} from "../hooks/useWeb3";
import LoadingButton from '@mui/lab/LoadingButton';
import {Transaction} from "web3-core";
import {TransactionsOfBlock} from "./TransactionsOfBlock/TransactionsOfBlock";
import {GridCheckCircleIcon, GridCloseIcon, GridLoadIcon} from "@mui/x-data-grid";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {Button, Card, CardActions, CardContent, Chip, Link, Typography} from "@mui/material";
import {Box} from "@material-ui/core";

interface IBlockdataProps {
}

interface IBlockdataState {
    currBlock: number | null,
    numberOfTx: number | null,
    minerAddr: string,
    totalDifficulty: number | null,
    intervalID: NodeJS.Timeout | null,
    transactions: Transaction[],
    lastFetched: Date | null,
    isFetching: boolean,
}

export class Blockdata extends Component<IBlockdataProps, IBlockdataState> {
    state: IBlockdataState = {
        currBlock: null,
        numberOfTx: null,
        minerAddr: '',
        totalDifficulty: null,
        transactions: [],
        intervalID: null,
        lastFetched: null,
        isFetching: false,
    }

    private fetchBlockData = async () => {
        if (!this.state.isFetching) {
            this.setState({isFetching: true})
            const currBlock: number = await web3.eth.getBlockNumber()
            const currBlockObj = await web3.eth.getBlock(currBlock, true)
            this.setState({
                currBlock,
                numberOfTx: currBlockObj.transactions.length,
                transactions: this.populateTxWithID(currBlockObj.transactions),
                totalDifficulty: currBlockObj.totalDifficulty,
                minerAddr: currBlockObj.miner,
                lastFetched: new Date(),
                isFetching: false
            })
        }
    }

    private startFetchingBlockData = async () => {
        await this.fetchBlockData()
        this.setState({
            intervalID: setInterval(async () => {
                await this.fetchBlockData()
            }, parseInt(process.env.REACT_APP_REFETCH_INTERVAL ?? '5000')) // default: 5 seconds
        })
    }

    private stopFetchingBlockData = () => {
        if (this.state.intervalID) {
            clearInterval(this.state.intervalID)
            this.setState({intervalID: null})
        }
    }

    async componentDidMount() {
        // Refetch for latest block, do not set interval too tight for public nodes to avoid being banned! Websocket node with reconnect would also be an option.
        await this.startFetchingBlockData()
    }

    private populateTxWithID = (transactions: Transaction[]): Transaction[] => transactions.map(tx => Object.assign({}, tx, {
        id: tx.hash,
        value: web3.utils.fromWei(tx.value)
    }))

    render() {
        const card = <><Chip icon={<AccessTimeIcon/>} label={`Last fetched: ${this.state.lastFetched?.toLocaleString()}`} style={{marginBottom: 15}}/>
            <Typography sx={{fontSize: 14}} color='text.secondary' gutterBottom>Current block</Typography>
            <Typography variant='h5' component='div'>{this.state.currBlock}</Typography>
            <Typography variant='body2' color='text.secondary'>
                <small style={{padding: 5}}><Link href={`https://explorer.energi.network/address/${this.state.minerAddr}/transactions`} target='_blank'>{this.state.minerAddr} (Miner)</Link></small><br/>
                <small style={{padding: 5}}>{this.state.totalDifficulty} (Difficulty)</small><br/>
                    <small style={{padding: 5}}>{this.state.numberOfTx} (Amount Tx)</small><br/>
            </Typography></>

        return <>
            <Box sx={{minWidth: 275, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', marginTop: 15, marginBottom: 15}}>
                <Card variant="outlined" sx={{ }}>
                    <CardContent>
                        {this.state.lastFetched ? card : 'Loading onChain data..'}
                    </CardContent>
                    <CardActions style={{justifyContent: 'center'}}>
                        <Button variant='outlined'
                                startIcon={this.state.intervalID ? <GridCloseIcon/> : <GridCheckCircleIcon/>}
                                onClick={this.state.intervalID ? this.stopFetchingBlockData : this.startFetchingBlockData}>{this.state.intervalID ? 'Stop fetching' : 'Continue fetching'}</Button>
                        <LoadingButton variant='contained' startIcon={<GridLoadIcon/>} loading={this.state.isFetching}
                                       loadingPosition='start'
                                       onClick={this.fetchBlockData}>Reload</LoadingButton>
                    </CardActions>
                </Card>
            </Box>

            <TransactionsOfBlock transactions={this.state.transactions}
                                 stopAutoFetchingCb={this.stopFetchingBlockData}/>
        </>
    }
}