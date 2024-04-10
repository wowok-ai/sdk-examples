
import { PROTOCOL, ENTRYPOINT} from 'wowok/src/protocol';
import { objectids_from_response, stringToUint8Array } from 'wowok/src/util'
import { TEST_PRIV } from './common'
import { test_permission_launch, test_permission_set_guard } from './permission-test'
import { test_guard_launch_permission_builder, test_guard_launch_everyone, test_guard_launch_signer, test_guard_launch_substring,
    test_guard_launch_number, test_guard_graphql_senses_objects, test_guard_launch_creator_equal } from './gurad-test'
import { test_repository_launch, test_repository_policy } from './repository-test'
import { test_machine_edit_nodes, test_machine_launch, test_machine_progress, test_progress_run1, test_progress_run2 } from './machine-test';
import { test_service_launch, test_service_order, test_service_withdraw } from './service-test';
import { test_reward_claim, test_reward_launch } from './reward-test';
import { test_demand_launch, test_demand_yes } from './demand-test';

const main = async () => {
    PROTOCOL.UseNetwork(ENTRYPOINT.testnet);
    await test_exes();
    // await test_guard_queries()
}   

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const test_guard_queries = async () => {
    let ids = new Map<string, string[]>();
    objectids_from_response(await PROTOCOL.Sign_Excute([test_permission_launch, test_permission_launch], TEST_PRIV()), ids);
    console.log('permission id: ' + ids.get('permission::Permission'));
    objectids_from_response(await PROTOCOL.Sign_Excute([test_guard_launch_creator_equal], TEST_PRIV(), ids), ids);
    console.log('guard id:  ' + ids.get('guard::Guard'))
    await sleep(10000) // wait query effective, important!
    let res = await test_guard_graphql_senses_objects(ids.get('guard::Guard') as string[]); 
    console.log(res)
}

const test_exes = async () => {
    let ids = new Map<string, string[]>();
    objectids_from_response(await PROTOCOL.Sign_Excute([test_permission_launch, test_permission_launch], TEST_PRIV(), ids), ids);
    console.log('permission id: ' + ids.get('permission::Permission'));
    // object random sequence by rpc-get-objects !!  
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_guard_launch_creator_equal], 
        TEST_PRIV(), ids), ids);
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_guard_launch_creator_equal, test_guard_launch_everyone, test_guard_launch_signer, test_guard_launch_substring], 
        TEST_PRIV(), ids), ids);
    console.log('guard id: ' + ids.get('guard::Guard'));
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_permission_set_guard, test_guard_launch_number, test_guard_launch_permission_builder, test_repository_launch], 
        TEST_PRIV(), ids), ids);
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_repository_policy, test_machine_launch], 
        TEST_PRIV(), ids), ids);
    console.log('machine id: ' + ids.get('machine::Machine'));
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_machine_edit_nodes, test_machine_progress], 
        TEST_PRIV(), ids), ids);
    console.log('progress id: ' + ids.get('progress::Progress'));
    await PROTOCOL.Sign_Excute([test_progress_run1], TEST_PRIV(), ids);
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_service_launch, test_service_launch], TEST_PRIV(), ids), ids);
    console.log('service id: ' + ids.get('service::Service'));
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_service_order], TEST_PRIV(), ids), ids);
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_service_withdraw], TEST_PRIV(), ids), ids);
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_reward_launch, test_demand_launch], TEST_PRIV(), ids), ids);
    console.log('reward id: ' + ids.get('reward::Reward'));
    console.log('demand id: ' + ids.get('demand::Demand'));
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_reward_claim], TEST_PRIV(), ids), ids);
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_demand_yes], TEST_PRIV(), ids), ids);
    console.log(ids)
}

main().catch(console.error)