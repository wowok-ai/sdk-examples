
import { PROTOCOL, Data_Type, Query_Param, ENTRYPOINT} from 'wowok/src/protocol';
import { sense_objects_fn, description_fn } from 'wowok/src/guard';
import { objectids_from_response, stringToUint8Array } from 'wowok/src/util'
import { SuiClient, } from '@mysten/sui.js/client';
import { bcs } from '@mysten/sui.js/bcs'
import { SENDER_PRIV } from './common'
import { test_permission_launch, test_permission_set_guard } from './permission'
import { test_guard_launch_permission_builder, test_guard_launch_everyone, test_guard_launch_signer, test_guard_launch_substring,
    test_guard_launch_number, } from './gurad'
import { test_repository_launch, test_repository_policy } from './repository'
import { test_machine_edit_nodes, test_machine_launch, test_machine_progress, test_progress_run1, test_progress_run2 } from './machine';
import { test_service_launch, test_service_order, test_service_withdraw } from './service';

const main = async () => {
    // await test_guard_sense_objects();
    // await test_guard_description();
    PROTOCOL.UseNetwork(ENTRYPOINT.testnet);
    await test_exes();
    // await test_child();
    // test_bcs()
}

const test_bcs = () => {
    var w = atob('44a7ngGzUot183Ua2KHkGLIHrZef6jZAh97vUlCnPT8=');
    console.log(w);

    console.log(bcs.Address.parse(stringToUint8Array(w)));

    w = atob('AQV0ZXN0MQVpYWJjZA==');
    let res = bcs.vector(bcs.struct("data", {
        key:bcs.string(),
        value: bcs.vector(bcs.u8()),
    })).parse(stringToUint8Array(w));
    console.log(res)
}
const test_child = async () => {
    const client =  new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });  
    let id = '0x049708ea1c4b4a66531b79adeb2d9075dfa4a04dd41736bfd419541d107e3445';
    console.log(await client.getOwnedObjects({owner:id}));
}

const test_guard_description = async () => {
    let param:Query_Param = {objectid:PROTOCOL.EveryoneGuard(), callback:description_fn, data:[]};
    await PROTOCOL.Query([param, param]);
    console.log(param)    
}

const test_guard_sense_objects = async () => {
    let ids = new Map<string, string[]>();
    objectids_from_response(await PROTOCOL.Sign_Excute([test_permission_launch], SENDER_PRIV), ids);
    console.log('permission id: ' + ids.get('permission::Permission'));
    objectids_from_response(await PROTOCOL.Sign_Excute([test_guard_launch_permission_builder, test_guard_launch_everyone], SENDER_PRIV, ids), ids);
    console.log('guard id: ' + ids.get('guard::Guard')); 
    let param1:Query_Param = {objectid:(ids.get('guard::Guard') as string[])[0], callback:sense_objects_fn, data:[]};
    let param2:Query_Param = {objectid:(ids.get('guard::Guard') as string[])[1], callback:sense_objects_fn, data:[]};
    let r3 = await PROTOCOL.Query([param1, param2]);
    console.log(param1)
    console.log(param2)
}


const test_exes = async () => {
    let ids = new Map<string, string[]>();
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_guard_launch_everyone, test_guard_launch_signer, test_guard_launch_substring], 
        SENDER_PRIV), ids);
    console.log('guard id: ' + ids.get('guard::Guard'));
    objectids_from_response(await PROTOCOL.Sign_Excute([test_permission_launch, test_permission_launch], SENDER_PRIV), ids);
    console.log('permission id: ' + ids.get('permission::Permission'));
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_permission_set_guard, test_guard_launch_number, test_guard_launch_permission_builder, test_repository_launch], 
        SENDER_PRIV, ids), ids);
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_repository_policy, test_machine_launch], 
        SENDER_PRIV, ids), ids);
    console.log('machine id: ' + ids.get('machine::Machine'));
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_machine_edit_nodes, test_machine_progress], 
        SENDER_PRIV, ids), ids);
    console.log('progress id: ' + ids.get('progress::Progress'));
    await PROTOCOL.Sign_Excute([test_progress_run1], SENDER_PRIV, ids);
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_service_launch], SENDER_PRIV, ids), ids);
    console.log('service id: ' + ids.get('service::Service'));
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_service_order], SENDER_PRIV, ids), ids);
    objectids_from_response(await PROTOCOL.Sign_Excute(
        [test_service_withdraw], SENDER_PRIV, ids), ids);
    console.log(ids)
}

main().catch(console.error)