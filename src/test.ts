//@ts-ignore 
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { machine, Machine_Node, MachineObject, INITIAL_NODE_NAME, machine_remove_node, MachineNodeObject, 
    machine_add_node, machine_set_endpoint, machine_publish, launch as machine_launch} from 'wowok/src/machine';
import { Permission_Entity, PermissionObject, permission, add_entity, add_admin, set_guard, PermissionIndex,
    remove_entity, launch as permission_launch } from 'wowok/src/permission';
import { ProgressObject, hold, next } from 'wowok/src/progress';
import { service, service_add_sale, service_publish, service_pause, launch as service_launch, DicountDispatch,
    service_discount_transfer, DiscountObject, ServiceObject, Service_Discount_Type, Service_Buy, Service_Sale,
    service_set_price, service_set_machine, service_add_stock, buy} from 'wowok/src/service';
import { PROTOCOL, FnCallType, GuardObject, Data_Type } from 'wowok/src/protocol';
import { SenseMaker, description_fn, Guard_Creation, Guard_Sense, Guard_Sense_Binder, 
    launch as guard_launch, signer_guard } from 'wowok/src/guard';
import { demand, launch as demand_launch, deposit as demand_deposit } from 'wowok/src/demand';
import { reward, launch as reward_launch, deposit as reward_deposit, Reward } from 'wowok/src/reward';


export const ADDR = "0xe386bb9e01b3528b75f3751ad8a1e418b207ad979fea364087deef5250a73d3f";
export const SENDER_PRIV = "0xc9bbc30f72ef7d9aa674a3be1448b9267141a676b59f3f4315231617a5bbc0e8";

// permission test -------------
const permission_entity_1 : Permission_Entity = {
    who: ADDR,
    permissions: [{index:PermissionIndex.machine_add_node}, {index:PermissionIndex.machine}],
}
const permission_entity_2 : Permission_Entity = {
    who: '0x07b1e78a99dcb13d2f1411cab294c8a54c44f03f7ab97b0a1bdecec99e1a186c',
    permissions: [{index:PermissionIndex.demand}, {index:PermissionIndex.machine}],
}
const permission_entity_3 : Permission_Entity = {
    who: '0xe8778267a777a5f4cc1df30c97fa788c5acb7905fab01e1a7429da622efe48a8',
    permissions: [{index:PermissionIndex.demand}, {index:PermissionIndex.machine}],
}

export const permission_test = async(txb:TransactionBlock, param:any) => {
    let per = permission(txb, 'eeee....')
    let guard = param as string;

    add_entity(txb, per, [permission_entity_1, permission_entity_2]);
    add_entity(txb, per, [permission_entity_3, permission_entity_2]);
    add_admin(txb, per, ['0x07b1e78a99dcb13d2f1411cab294c8a54c44f03f7ab97b0a1bdecec99e1a186c', '0x3ce6931306dcfd4eb4be7013caa9077b1a8166b361c9f1e87057eab13bd1b34a']);
    set_guard(txb, per, ADDR, PermissionIndex.machine_add_node, guard);
    set_guard(txb, per, ADDR, PermissionIndex.machine_add_node)
    set_guard(txb, per, ADDR, PermissionIndex.machine, guard)
    remove_entity(txb, per, [permission_entity_3.who])
    permission_launch(txb, per)
}

// machine test ------------------------------------------
export const node1:Machine_Node = {
    name: 'node1',
    description: '',
    pairs: [
        {prior_node: INITIAL_NODE_NAME, threshold:0, forwards:[
            {name:'f1', permission:10000},
            {name:'f2', permission:10002},
        ]}
    ]
}
export const node2:Machine_Node = {
    name: 'node2',
    description: '',
    pairs: [
        {prior_node: node1.name, threshold:0, forwards:[
            {name:'f1', permission:10000},
            {name:'f2', permission:10002},
        ]},
        {prior_node: INITIAL_NODE_NAME, threshold:0, forwards:[
            {name:'f3', permission:10000},
        ]},
    ]
}
export const node3:Machine_Node = {
    name: 'node3',
    description: '',
    pairs: [
        {prior_node: node2.name, threshold:0, forwards:[
            {name:'f1', permission:10000},
            {name:'f2', permission:10002},
        ]},
        {prior_node: node1.name, threshold:0, forwards:[
            {name:'f3', permission:10000},
        ]},
    ]
}

export const machine_test = async(txb:TransactionBlock, param:any) => {
    let permission = txb.object(param.get('permission::Permission')[0] as string) as PermissionObject;
    
    let m = machine(txb, permission, 'mmmm....', 'https://wowok/');
    if (!m) { console.log('error machine')}
    machine_add_node(txb, m as MachineNodeObject, permission, [node1]);
    machine_set_endpoint(txb, m as MachineNodeObject, permission);
    machine_publish(txb, m as MachineNodeObject, permission);
    machine_launch(txb, m as MachineNodeObject);
}


export const progress_test = async(txb:TransactionBlock, param:any) => {
    let permission = txb.object(param.get('permission::Permission')[0] as string) as PermissionObject;
    let machine = txb.object(param.get('machine::Machine')[0] as string) as MachineObject;
    let progress = txb.object(param.get('progress::Progress')[0] as string) as ProgressObject;
    hold(txb, machine, permission, progress, {next_node_name:node1.name, forward:'f1'}, true);
    next(txb, machine, permission, progress, {next_node_name:node1.name, forward:'f1'});
}

// service TEST -----------------------
const pay_type = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
const service_sales1:Service_Sale = {
    item:'cup xx',
    price: 3,
    stock: 10,
}
const service_sales2:Service_Sale = {
    item:'cup b',
    price: 13,
    stock: 22,
}
const service_buy1: Service_Buy = {
    item: service_sales1.item,
    count: 200,
}
const service_buy2: Service_Buy = {
    item: service_sales2.item,
    count: 2,
}
const discount1 : DicountDispatch = {
    receiver: ADDR,
    count: 10,
    discount:{
        name:'discount aaa',
        type:Service_Discount_Type.minus,
        off: 100,
        duration_minutes: 1000000,
    }
}
const discount2 : DicountDispatch = {
    receiver: ADDR,
    count: 1,
    discount:{
        name:'discount aaa',
        type:Service_Discount_Type.minus,
        off: 100,
        duration_minutes: 1000000,
    }
}
export const service_test = async(txb:TransactionBlock, param:any) => {
    let permission = txb.object(param.get('permission::Permission')[0] as string) as PermissionObject;
    let machine = txb.object(param.get('machine::Machine')[0] as string) as MachineObject;
    let s = service(pay_type, txb, permission, 'sss,,,,,,,', ADDR, 'https://wwk') as ServiceObject;
    service_set_machine(pay_type, txb, s, permission, machine);
    service_add_sale(pay_type, txb, s, permission, [service_sales1, service_sales2]);
    service_add_stock(pay_type, txb, s, permission, service_sales1.item, 1000);
    service_set_price(pay_type, txb, s, permission, service_sales2.item, 8888);
    service_discount_transfer(pay_type, txb, s, permission, [discount1, discount2]);
    service_publish(pay_type, txb, s, permission);
    service_launch(pay_type, txb, s);
}

export const service_test_order = async(txb:TransactionBlock, param:any) => {
    let permission = txb.object(param.get('permission::Permission')[0] as string) as PermissionObject;
    let machine = txb.object(param.get('machine::Machine')[0] as string) as MachineObject;
    let s = txb.object(param.get('service::Service')[0] as string) as ServiceObject;
    let discount = txb.object(param.get('order::Discount')[0] as string) as DiscountObject;

    const coin = txb.splitCoins(txb.gas, [txb.pure(100000)]);
    buy(pay_type, txb, s, [service_buy1, service_buy2], coin, discount, machine);
}

// guard test ----------------
export const guard1_test = async(txb:TransactionBlock, param:any) => {
    let permission_id1 = param.get('permission::Permission')[0];
    let permission_id2 = param.get('permission::Permission')[1];

    let maker = new SenseMaker();
    maker.add_cmd(permission_id1, 0);
    maker.add_cmd(permission_id2, 0);
    maker.add_logic(Data_Type.TYPE_LOGIC_OPERATOR_EQUAL);
    const sense1 = maker.make(false, Guard_Sense_Binder.AND) as Guard_Sense;
    let guard_creation1:Guard_Creation = {
        description: 'two permissions\' creator equal',
        senses: [sense1, sense1]
    };
    guard_launch(txb, guard_creation1); // guard1
    signer_guard(txb); // guard2
}
export const guard2_test = async (txb:TransactionBlock, param:any) => {
    let permission_id = param.get('permission::Permission')[0];

    let maker = new SenseMaker();
    maker.add_cmd(permission_id, 0);
    maker.add_param(Data_Type.TYPE_CONTEXT_SIGNER);
    maker.add_logic(Data_Type.TYPE_LOGIC_OPERATOR_EQUAL);
    const sense1 = maker.make(false, Guard_Sense_Binder.AND) as Guard_Sense;
    const sense2 = sense1;
    let guard_creation1:Guard_Creation = {
        description: 'aaa',
        senses: [sense1, sense1]
    };
    guard_launch(txb, guard_creation1);
}

// demand test -------------
const earnest_type = '0x2::coin::Coin<0x2::sui::SUI>';

export const demand_test = async (txb:TransactionBlock, param:any) => {
    let permission_id = param.get('permission::Permission')[0];
    let d = demand(earnest_type, txb, txb.object(permission_id) as PermissionObject, 
        'demand...', txb.splitCoins(txb.gas, [10000000]));
    demand_deposit(earnest_type, txb, d, txb.splitCoins(txb.gas,[200000]));
    demand_launch(earnest_type, txb, d);
}

export const reward_test = async (txb:TransactionBlock, param:any) => {
    let permission_id = param.get('permission::Permission')[0];
    let w = reward(earnest_type, txb, txb.object(permission_id) as PermissionObject,
        'reward hhh', 10000);
    let rewards = [txb.splitCoins(txb.gas, [111]), txb.splitCoins(txb.gas, [222])];
    reward_deposit(earnest_type, txb, w, rewards);
    reward_launch(earnest_type, txb, w);
}