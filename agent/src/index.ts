
import { sleep } from './common'
import { test_agent_objects } from './query_test';
import { test_call } from './call_test';

const main = async () => {
    await test_call()
    //await test_agent_objects()
}  

main().catch(console.error)