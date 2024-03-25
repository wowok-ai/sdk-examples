
import { PROTOCOL, Data_Type, Query_Param, ENTRYPOINT} from 'wowok/src/protocol';
import { SENDER_PRIV, permission_test, machine_test, service_test, service_test_order, 
    progress_test, guard1_test, demand_test, reward_test, repository_test} from './test';
import { sense_objects_fn, description_fn } from 'wowok/src/guard';
import { objectids_from_response } from 'wowok/src/util'
import { SuiClient, SuiObjectResponse, SuiObjectDataOptions, SuiTransactionBlockResponseOptions, 
    SuiTransactionBlockResponse, SuiObjectChange, GetOwnedObjectsParams } from '@mysten/sui.js/client';

const main = async () => {
    // await test_guard_sense_objects();
    // await test_guard_description();
    PROTOCOL.UseNetwork(ENTRYPOINT.testnet);
    await test_exes();
    // await test_child();
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
    objectids_from_response(await PROTOCOL.Sign_Excute(permission_test, SENDER_PRIV, PROTOCOL.EveryoneGuard()), ids);
    objectids_from_response(await PROTOCOL.Sign_Excute(permission_test, SENDER_PRIV, PROTOCOL.EveryoneGuard()), ids);
    console.log('permission id: ' + ids.get('permission::Permission'));
    objectids_from_response(await PROTOCOL.Sign_Excute(guard1_test, SENDER_PRIV, ids), ids);
    console.log('guard id: ' + ids.get('guard::Guard')); 
    let param1:Query_Param = {objectid:(ids.get('guard::Guard') as string[])[0], callback:sense_objects_fn, data:[]};
    let param2:Query_Param = {objectid:(ids.get('guard::Guard') as string[])[1], callback:sense_objects_fn, data:[]};
    let r3 = await PROTOCOL.Query([param1, param2]);
    console.log(param1)
    console.log(param2)
}

const test_exes = async () => {
    let ids = new Map<string, string[]>();
    objectids_from_response(await PROTOCOL.Sign_Excute(permission_test, SENDER_PRIV, PROTOCOL.EveryoneGuard()), ids);
    console.log('permission id: ' + ids.get('permission::Permission'));
    objectids_from_response(await PROTOCOL.Sign_Excute(reward_test, SENDER_PRIV, ids), ids);
    console.log('reward id: ' + ids.get('reward::Reward'));
    /*objectids_from_response(await PROTOCOL.Sign_Excute(repository_test, SENDER_PRIV, ids), ids);
    console.log('repository id: ' + ids.get('repository::Repository'));
    objectids_from_response(await PROTOCOL.Sign_Excute(demand_test, SENDER_PRIV, ids), ids);
    console.log('demand id: ' + ids.get('demand::Demand'));
    objectids_from_response(await PROTOCOL.Sign_Excute(machine_test, SENDER_PRIV, ids), ids);
    console.log('machine id: ' + ids.get('machine::Machine'));
    objectids_from_response(await PROTOCOL.Sign_Excute(service_test, SENDER_PRIV, ids), ids);
    console.log('service id: ' + ids.get('service::Service'));
    console.log('discount id: ' + ids.get('order::Discount'));
    objectids_from_response(await PROTOCOL.Sign_Excute(service_test_order, SENDER_PRIV, ids), ids) ;
    console.log('order id: ' + ids.get('order::Order'));
    console.log('progress id: ' + ids.get('progress::Progress'));
    let resp1 = await PROTOCOL.Sign_Excute(progress_test, SENDER_PRIV, ids);
    console.log(resp1);*/
}

main().catch(console.error)