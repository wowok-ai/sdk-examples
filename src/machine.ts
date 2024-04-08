import { TransactionBlock } from '@mysten/sui.js/transactions';
import { MachineObject, PermissionObject, GuardObject, RepositoryObject, ValueType, SUI_TYPE, ProgressObject } from 'wowok/src/protocol';
import { ADDR } from './common'
import { launch, machine, Machine_Node, INITIAL_NODE_NAME, MachineNodeObject, machine_add_node, machine_remove_node,
    machine_add_repository, machine_remove_repository, machine_clone, machine_publish, machine_set_endpoint, machine_pause,
    namedOperator_ORDER_PAYER, change_permission, machine_set_description} from 'wowok/src/machine';
import { progress, hold, next, launch as progress_launch, progress_set_namedOperator} from 'wowok/src/progress'
import { signer_guard } from 'wowok/src/guard';
import { verify, } from 'wowok/src/passport';

export const node_order_comfirmed:Machine_Node = {
    name: 'order confirmed',
    description: 'node1',
    pairs: [
        {prior_node: INITIAL_NODE_NAME, threshold:10, forwards:[
            {name:'confirm order', weight: 5, permission:10000},
            {name:'confirm express', weight: 5, permission:10002},
        ]}
    ]
}
export const node_order_delivered:Machine_Node = {
    name: 'order delivered',
    description: 'node2',
    pairs: [
        {prior_node: node_order_comfirmed.name, threshold:0, forwards:[
            {name:'pick up dilivery - JD', namedOperator:'JD'},
            {name:'pick up dilivery - CN', namedOperator:'CN'},
            {name:'pick up dilivery - YT', namedOperator:'YT'},
        ]},
        {prior_node: INITIAL_NODE_NAME, threshold:0, forwards:[
            {name:'pick up dilivery - JD', namedOperator:'JD'},
            {name:'pick up dilivery - CN', namedOperator:'CN'},
            {name:'pick up dilivery - YT', namedOperator:'YT'},
        ]},
    ]
}
export const node_order_signed:Machine_Node = {
    name: 'order signed',
    description: 'node3',
    pairs: [
        {prior_node: node_order_delivered.name, threshold:0, forwards:[
            {name:'payer signed', namedOperator: namedOperator_ORDER_PAYER},
        ]},
    ]
}
export const node_order_canceled:Machine_Node = {
    name: 'order canceled',
    description: 'node4',
    pairs: [
        {prior_node: INITIAL_NODE_NAME, threshold:0, forwards:[
            {name:'payed canceled',  namedOperator: namedOperator_ORDER_PAYER},
            {name:'service canceled',  permission: 10000},
        ]},
        {prior_node: node_order_delivered.name, forwards:[
            {name:'payed canceled',  namedOperator: namedOperator_ORDER_PAYER},
            {name:'express canceled', namedOperator:'EXPRESS'}
        ]},
        {prior_node: node_order_signed.name, forwards:[
            {name:'payed canceled',  namedOperator: namedOperator_ORDER_PAYER},
            {name:'service canceled', permission: 10001}
        ]},
    ]
}

export const test_machine_launch = async (txb:TransactionBlock, param:any) => {
    let permission = param.get('permission::Permission')[0] as string;
    let permission_new = param.get('permission::Permission')[1] as string;    
    let repo = param.get('repository::Repository')[0] as string;

    let m = machine(txb, permission, 'mmmm....', 'https://best-service.com/') as MachineObject;

    machine_add_node(txb, m, permission, [node_order_comfirmed, node_order_delivered, node_order_signed, node_order_canceled]);
    machine_set_endpoint(txb, m, permission);
    machine_set_endpoint(txb, m, permission, 'https://best-service.com/order-ops/');
    machine_publish(txb, m, permission);
    machine_add_repository(txb, m, permission, repo);
    machine_pause(txb, m, permission, true);
    launch(txb, m);
}

export const node_order_delivered2:Machine_Node = {
    name: 'order delivered',
    description: 'node5',
    pairs: [
        {prior_node: node_order_comfirmed.name, threshold:0, forwards:[
            {name:'pick up dilivery - JD', namedOperator:'JD'},
            {name:'pick up dilivery - CN', namedOperator:'CN'},
            {name:'pick up dilivery - YT', namedOperator:'YT'},
        ]},
        {prior_node: INITIAL_NODE_NAME, threshold:0, forwards:[
            {name:'pick up dilivery - JD', namedOperator:'JD'},
            {name:'pick up dilivery - CN', namedOperator:'CN'},
            {name:'pick up dilivery - YT', namedOperator:'YT'},
        ]},
    ]
}
export const node_order_canceled2:Machine_Node = {
    name: 'order canceled',
    description: 'node6',
    pairs: [
        {prior_node: INITIAL_NODE_NAME, threshold:0, forwards:[
            {name:'payed canceled',  namedOperator: namedOperator_ORDER_PAYER},
            {name:'service canceled',  permission: 10000},
        ]},
        {prior_node: node_order_delivered.name, forwards:[
            {name:'payed canceled',  namedOperator: namedOperator_ORDER_PAYER},
            {name:'express canceled', namedOperator:'EXPRESS'}
        ]},
        {prior_node: node_order_signed.name, forwards:[
            {name:'payed canceled',  namedOperator: namedOperator_ORDER_PAYER},
            {name:'service canceled', permission: 10001}
        ]},
    ]
}
// machine could edit nodes while NOT PUBULISHED
export const test_machine_edit_nodes = async (txb:TransactionBlock, param:any) => {
    let permission = param.get('permission::Permission')[0] as string;
    let permission2 = param.get('permission::Permission')[1] as string;
    let machine = param.get('machine::Machine')[0] as string;

    let new_m = machine_clone(txb, machine, permission) as MachineObject;
    machine_set_description(txb, new_m, permission, 'our new machine for test')
    change_permission(txb, new_m, permission, permission2);
    machine_remove_repository(txb, new_m, permission2, [], true); // must use new permission 
    machine_remove_node(txb, new_m, permission2, ['order delivered', 'order canceled'])
    machine_add_node(txb, new_m, permission2, [node_order_canceled2, node_order_delivered2])
    machine_publish(txb, new_m, permission2)
    launch(txb, new_m);
}

// machine could generate progresses while PUBLISHED
export const test_machine_progress = async (txb:TransactionBlock, param:any) => {
    let permission = param.get('permission::Permission')[0] as string; // permission 0
    let machine = param.get('machine::Machine')[0] as string;
    machine_pause(txb, machine, permission, false); // machine.bPaused=false & machine.bPublished=true, before creating progress for it
    let progress1 = progress(txb, machine, permission) as ProgressObject;
    progress_launch(txb, progress1)
}

// machine could generate progresses while PUBLISHED
export const test_progress_run1 = async (txb:TransactionBlock, param:any) => {
    let permission = param.get('permission::Permission')[0] as string; // permission 0
    let machine = param.get('machine::Machine')[0] as string;
    let progress = param.get('progress::Progress')[0] as string;
    progress_set_namedOperator(txb, machine, permission, progress, namedOperator_ORDER_PAYER, [ADDR]);
    hold(txb, machine, permission, progress, {next_node_name:node_order_comfirmed.name, forward:'confirm order'}, true);
    hold(txb, machine, permission, progress, {next_node_name:node_order_comfirmed.name, forward:'confirm order'}, false);
    hold(txb, machine, permission, progress, {next_node_name:node_order_comfirmed.name, forward:'confirm order'}, true);
    next(txb, machine, permission, progress, {next_node_name:node_order_comfirmed.name, forward:'confirm order'}); // wight 5; threshold:10
    next(txb, machine, permission, progress, {next_node_name:node_order_canceled.name, forward:'payed canceled'});
}

// machine could generate progresses while PUBLISHED
export const test_progress_run2 = async (txb:TransactionBlock, param:any) => {
    let permission = param.get('permission::Permission')[0] as string; // permission 0
    let machine = param.get('machine::Machine')[0] as string;
    let progress = param.get('progress::Progress')[0] as string;
    next(txb, machine, permission, progress, {next_node_name:node_order_canceled.name, forward:'payed canceled'}); // wight 5; threshold:10
}