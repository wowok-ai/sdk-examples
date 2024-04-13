import { PROTOCOL, Data_Type, Query_Param, ENTRYPOINT} from 'wowok/src/protocol';
import { rpc_sense_objects_fn, rpc_description_fn } from 'wowok/src/guard';
import { objectids_from_response, stringToUint8Array } from 'wowok/src/utils'
import { bcs } from '@mysten/sui.js/bcs'
import { TEST_PRIV } from './common'
import { test_permission_launch, test_permission_set_guard } from './permission-test'
import { test_guard_launch_permission_builder, test_guard_launch_everyone, test_guard_launch_signer, test_guard_launch_substring,
    test_guard_launch_number, } from './gurad-test'


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

const test_guard_description = async () => {
    let param:Query_Param = {objectid:PROTOCOL.EveryoneGuard(), callback:rpc_description_fn, data:[]};
    await PROTOCOL.Query([param, param]);
    console.log(param)    
}

const test_guard_sense_objects = async () => {
    let ids = new Map<string, string[]>();
    objectids_from_response(await PROTOCOL.Sign_Excute([test_permission_launch], TEST_PRIV()), ids);
    console.log('permission id: ' + ids.get('permission::Permission'));
    objectids_from_response(await PROTOCOL.Sign_Excute([test_guard_launch_permission_builder, test_guard_launch_everyone], TEST_PRIV(), ids), ids);
    console.log('guard id: ' + ids.get('guard::Guard')); 
    let param1:Query_Param = {objectid:(ids.get('guard::Guard') as string[])[0], callback:rpc_sense_objects_fn, data:[]};
    let param2:Query_Param = {objectid:(ids.get('guard::Guard') as string[])[1], callback:rpc_sense_objects_fn, data:[]};
    let r3 = await PROTOCOL.Query([param1, param2]);
    console.log(param1)
    console.log(param2)
}