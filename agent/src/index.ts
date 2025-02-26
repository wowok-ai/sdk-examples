
import { sleep } from './common'
import { test_agent_objects } from './query_test';
import { test_call } from './call_test';
import { airdrop } from './airdrop';
import { e_commerce } from './e-commerce';

const main = async () => {
    //await test_call()
    //await airdrop();
    await e_commerce();
}  

main().catch(console.error)