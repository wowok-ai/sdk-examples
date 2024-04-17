import { SenseMaker, Guard_Sense_Binder, Guard_Sense, Guard_Creation, launch, signer_guard,
    everyone_guard, parse_graphql_senses, parse_sense_bsc, VariableType, add_variable
 } from 'wowok/src/guard';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { OperatorType, ContextType, DemandObject, RewardObject,
    ServiceObject, DiscountObject, OrderObject, ValueType,RepositoryObject, MODULES,
    PassportObject
 } from 'wowok/src/protocol';
import { graphql_object, graphql_objects } from './graphql_query';
import { array_unique, BCS_CONVERT } from 'wowok/src/utils';
import { bcs, BCS, toHEX, fromHEX, getSuiMoveConfig, TypeName, StructTypeDefinition } from '@mysten/bcs';
import { verify,destroy } from 'wowok/src/passport'

export const test_guard_launch_creator_equal = async(txb:TransactionBlock, param:any) => {
    let permission_id1 = param.get('permission::Permission')[0];
    let permission_id2 = param.get('permission::Permission')[1];

    let maker = new SenseMaker();
    maker.add_query(MODULES.permission, 'builder', permission_id1); // permission1 builder
    maker.add_query(MODULES.permission, 'builder', permission_id2); // permission2 builder
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

export const test_guard_passport = async(txb:TransactionBlock, param:any) => {
    let g = param.get('guard::Guard')[0] as string
    let p = verify(txb, [g], []);
    console.log(p)
    destroy(txb, p as PassportObject)
}

export const test_guard_launch_number = async(txb:TransactionBlock, param:any) => {
    let permission_id1 = param.get('permission::Permission')[0];
    let maker = new SenseMaker();
    maker.add_query(MODULES.permission, 'entity_count', permission_id1); // entity address count
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
    maker.add_query(MODULES.permission, 'builder', permission_id); // permission builder address
    maker.add_param(ContextType.TYPE_CONTEXT_SIGNER); // signer
    maker.add_logic(OperatorType.TYPE_LOGIC_OPERATOR_EQUAL);
    const sense1 = maker.make(false, Guard_Sense_Binder.AND) as Guard_Sense;
    let guard_creation1:Guard_Creation = {
        description: 'permission builder address equals singer address',
        senses: [sense1]
    };
    launch(txb, guard_creation1);
}

export const test_context_launch_creator_equal = async (txb:TransactionBlock, param:any) => {
    let permission_id1 = param.get('permission::Permission')[0];
    let permission_id2 = param.get('permission::Permission')[1];
    
    let variables:VariableType = new Map();
    add_variable(variables, 0, OperatorType.TYPE_QUERY_FROM_CONTEXT, permission_id1); // query_from_context, NOT TYPE_CONTEXT_address
    add_variable(variables, 1, OperatorType.TYPE_QUERY_FROM_CONTEXT, permission_id2);

    let maker = new SenseMaker();
    maker.add_query(MODULES.permission, 'builder', 0); // permission1 builder
    maker.add_query(MODULES.permission, 'builder', 1); // permission2 builder
    maker.add_logic(OperatorType.TYPE_LOGIC_OPERATOR_EQUAL); // equal

    const sense1 = maker.make() as Guard_Sense;
    let guard_creation1:Guard_Creation = {
        description: 'two permissions\' creator equal',
        variables:variables,
        senses: [sense1, sense1]
    };
    launch(txb, guard_creation1); // guard1
}

export const test_guard_graphql_senses_objects = async (guards:string[]) : Promise<string[]>=> {
    let res = await graphql_objects(guards);
    
    let arr : string[] = [];
/*    res.data.objects.nodes.forEach((n: any) => {
        arr = arr.concat(parse_graphql_senses(n.asMoveObject.contents.json.senses));
    }); */
    return arr
}