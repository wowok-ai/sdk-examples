import { SenseMaker, Guard_Sense_Binder, Guard_Sense, Guard_Creation, launch, signer_guard,
    everyone_guard, parse_graphql_senses, parse_sense_bsc
 } from 'wowok/src/guard';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { OperatorType, ContextType, DemandObject, RewardObject,
    ServiceObject, DiscountObject, OrderObject, ValueType,RepositoryObject, MODULES
 } from 'wowok/src/protocol';
import { graphql_object, graphql_objects } from './graphql_query';
import { array_unique } from 'wowok/src/utils';

export const test_guard_launch_creator_equal = async(txb:TransactionBlock, param:any) => {
    let permission_id1 = param.get('permission::Permission')[0];
    let permission_id2 = param.get('permission::Permission')[1];

    let maker = new SenseMaker();
    maker.add_query(OperatorType.TYPE_DYNAMIC_QUERY, permission_id1, MODULES.permission, 'builder'); // permission1 builder
    maker.add_query(OperatorType.TYPE_DYNAMIC_QUERY, permission_id2, MODULES.permission, 'builder'); // permission2 builder
    maker.add_logic(OperatorType.TYPE_LOGIC_OPERATOR_EQUAL); // equal

    const sense1 = maker.make() as Guard_Sense;
    let guard_creation1:Guard_Creation = {
        description: 'two permissions\' creator equal',
        senses: [sense1, sense1]
    };
    launch(txb, guard_creation1); // guard1
}

export const test_guard_launch_signer = async(txb:TransactionBlock, param:any) => {
    signer_guard(txb)
}

export const test_guard_launch_everyone = async(txb:TransactionBlock, param:any) => {
    everyone_guard(txb)
}

export const test_guard_launch_substring = async(txb:TransactionBlock, param:any) => {
    let maker = new SenseMaker();
    maker.add_param(ValueType.TYPE_STATIC_vec_u8, "i love WOWOK"); 
    maker.add_param(ValueType.TYPE_STATIC_vec_u8, "WOWOK"); 
    maker.add_logic(OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING); // substring
    const sense1 = maker.make() as Guard_Sense;
    let guard_creation1:Guard_Creation = {
        description: 'sub string',
        senses: [sense1]
    };
    launch(txb, guard_creation1)
}

export const test_guard_launch_number = async(txb:TransactionBlock, param:any) => {
    let permission_id1 = param.get('permission::Permission')[0];
    let maker = new SenseMaker();
    maker.add_query(OperatorType.TYPE_DYNAMIC_QUERY, permission_id1, MODULES.permission, 'entity_count'); // entity address count
    maker.add_param(ValueType.TYPE_STATIC_u64, 2); 
    maker.add_logic(OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER); // less than 2
    const sense1 = maker.make() as Guard_Sense;
    let guard_creation1:Guard_Creation = {
        description: 'entity adress count > 2',
        senses: [sense1]
    };
    launch(txb, guard_creation1)
}

export const test_guard_launch_permission_builder = async(txb:TransactionBlock, param:any) => {
    let permission_id = param.get('permission::Permission')[0];

    let maker = new SenseMaker();
    maker.add_query(OperatorType.TYPE_DYNAMIC_QUERY, permission_id, MODULES.permission, 'builder'); // permission builder address
    maker.add_param(ContextType.TYPE_CONTEXT_SIGNER); // signer
    maker.add_logic(OperatorType.TYPE_LOGIC_OPERATOR_EQUAL);
    const sense1 = maker.make(false, Guard_Sense_Binder.AND) as Guard_Sense;
    let guard_creation1:Guard_Creation = {
        description: 'permission builder address equals singer address',
        senses: [sense1]
    };
    launch(txb, guard_creation1);
}

export const test_guard_graphql_senses_objects = async (guards:string[]) : Promise<string[]>=> {
    let res = await graphql_objects(guards);
    
    let arr : string[] = [];
    res.data.objects.nodes.forEach((n: any) => {
        arr = arr.concat(parse_graphql_senses(n.asMoveObject.contents.json.senses));
    });
    return array_unique(arr)
}