

import { Repository, Repository_Policy_Data, Repository_Policy_Mode, Repository_Policy, Protocol, ValueType} from 'wowok';
import { bcs, BCS, toHEX, fromHEX, getSuiMoveConfig } from '@mysten/bcs';

export const test_repository_launch = async (protocol:Protocol, param:any) => {
    let permission_id = param.get('permission::Permission')[0];

    let r = Repository.New(protocol, permission_id, 'test repository', Repository_Policy_Mode.POLICY_MODE_FREE);
    let bcs = new BCS(getSuiMoveConfig());

    let data_order_number:Repository_Policy_Data = {key:'order number', data:[
        {address:'0xe386bb9e01b3528b75f3751ad8a1e418b207ad979fea364087deef5250a73d3f', bcsBytes:bcs.ser(BCS.STRING, 'abcd-efg-3128').toBytes()},
        {address:'0xe8778267a777a5f4cc1df30c97fa788c5acb7905fab01e1a7429da622efe48a8', bcsBytes:bcs.ser(BCS.STRING, 'abcd-xyz-12222').toBytes()},
    ], value_type:ValueType.TYPE_STATIC_vec_u8}
    let data_order_time:Repository_Policy_Data = {key:'order time', data:[
        {address:'0xe386bb9e01b3528b75f3751ad8a1e418b207ad979fea364087deef5250a73d3f', bcsBytes:bcs.ser(BCS.U64, 0).toBytes()},
        {address:'0x07b1e78a99dcb13d2f1411cab294c8a54c44f03f7ab97b0a1bdecec99e1a186c', bcsBytes:bcs.ser(BCS.U64, 1234675).toBytes()},
    ], value_type:ValueType.TYPE_STATIC_u64}
    r.add_data(data_order_number);
    r.add_data(data_order_time);
    r.remove('0xe8778267a777a5f4cc1df30c97fa788c5acb7905fab01e1a7429da622efe48a8', 'order number');

    let po1:Repository_Policy = {
        key:'p1',
        description:'key p1 TYPE_STATIC_vec_u8',
        value_type:ValueType.TYPE_STATIC_vec_u8,
    };
    let po2:Repository_Policy = {
        key:'p2',
        description:'key p2 TYPE_STATIC_u64',
        value_type:ValueType.TYPE_STATIC_u64,
        permission: 10002,
    };

    r.add_policies([po1, po2]);
    r.launch();
}

export const test_repository_policy = async (protocol:Protocol, param:any) => {
    let permission_id = param.get('permission::Permission')[0];
    let repo_id = param.get('repository::Repository')[0];

    let po1:Repository_Policy = {
        key:'order number',
        description:'key p1 TYPE_STATIC_vec_u8',
        value_type:ValueType.TYPE_STATIC_vec_u8,
    };
    let po2:Repository_Policy = {
        key:'order time',
        description:'key p2 TYPE_STATIC_u64',
        value_type:ValueType.TYPE_STATIC_u64,
        permission: 10002,
    };
    let bcs = new BCS(getSuiMoveConfig());
    let data_order_number:Repository_Policy_Data = {key:'order number', data:[
        {address:'0x07b1e78a99dcb13d2f1411cab294c8a54c44f03f7ab97b0a1bdecec99e1a186c', bcsBytes:bcs.ser(BCS.STRING, 'abcd-efg-3128').toBytes()}
    ], value_type:ValueType.TYPE_STATIC_vec_u8}

    let r = Repository.From(protocol, permission_id, repo_id);
    r.set_description('test policy');
    r.add_policies([po1, po2]); // 'order number' 'order time'
    r.remove_policies(['p2', 'p1']);
    r.set_policy_mode(Repository_Policy_Mode.POLICY_MODE_STRICT); // strict mode
    r.add_data(data_order_number);
}