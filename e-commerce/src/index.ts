
import { Protocol, ENTRYPOINT, TxbObject, RpcResultParser, GuardParser, Wowok} from 'wowok';
import { TEST_PRIV, TEST_ADDR } from './common'


const main = async () => {
    let protocol = new Protocol(ENTRYPOINT.testnet)
    
}  

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}



main().catch(console.error)