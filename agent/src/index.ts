
import { sleep } from './common'
import { test_agent_objects } from './query_test';
import { test_call } from './call_test';
import { airdrop } from './airdrop';

const main = async () => {
    //await test_call()
    await airdrop();
}  

main().catch(console.error)