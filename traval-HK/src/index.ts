
import { Protocol, ENTRYPOINT, TxbObject, RpcResultParser, GuardParser, Wowok, Machine_Node, Machine, Permission_Entity, 
    PermissionIndex, Permission, Service, Service_Sale, DicountDispatch, Service_Discount_Type, Service_Discount, Guard,
    GuardMaker, MODULES,
    ContextType,
    ValueType,
    OperatorType,
    Machine_Forward,
    Treasury, 
} from 'wowok';
import { TEST_PRIV, TEST_ADDR, TESTOR } from './common'

const SERVICE_PAY_TYPE = Protocol.SUI_TOKEN_TYPE; // token for pay

const main = async () => {
    let protocol = new Protocol(ENTRYPOINT.testnet)
    let ids = new Map<string, TxbObject[]>();
    
    // permission
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([permission], TEST_PRIV(), ids), ids);
    console.log('permission id: ' + ids.get('permission::Permission'));  await sleep(2000)
   
    // treasury
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([treasury], TEST_PRIV(), ids), ids);
    console.log('treasury id: ' + ids.get('treasury::Treasury'));  await sleep(2000)

    // machine
    await machine(protocol, ids);
    console.log('machine id: ' + ids.get('machine::Machine')); 
    
    // //guard修改
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([guard_confirmation_24hrs_more], TEST_PRIV(), ids), ids);  await sleep(2000); // guard 0
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([guard_receipt], TEST_PRIV(), ids), ids);  await sleep(2000); // guard 0
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([guard_unsatisfied_order], TEST_PRIV(), ids), ids); // guard 3
    console.log('guard id: ' + ids.get('guard::Guard'));  

    // publish machine
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([machine_publish], TEST_PRIV(), ids), ids);

    // service
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([service], TEST_PRIV(), ids), ids);
    console.log('service id: ' + ids.get('service::Service'));  
    // 服务中的guard修改
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([guard_withdraw], TEST_PRIV(), ids), ids); await sleep(2000); // guard 1
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([guard_refund], TEST_PRIV(), ids), ids);  await sleep(2000); // guard 2
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([service_publish], TEST_PRIV(), ids), ids);

    // test service
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([service_run], TEST_PRIV(), ids), ids);
    console.log(ids); 
}  

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const treasury = async (protocol:Protocol, param:any) => {
    const permission = param.get('permission::Permission')[0] ;
    const t = Treasury.New(protocol.CurrentSession(), SERVICE_PAY_TYPE, permission, 'Order revenue Treasury');
    t.launch();
}

const service_publish = async (protocol:Protocol, param:any) => {
    const permission = param.get('permission::Permission')[0] ;
    const service = param.get('service::Service')[0];
    Service.From(protocol.CurrentSession(), SERVICE_PAY_TYPE, permission, service).publish(); 
}

const service_run = async (protocol:Protocol, param:any) => {
    const machine = param.get('machine::Machine')[0] ;
    const permission = param.get('permission::Permission')[0] ;
    const service = param.get('service::Service')[0];
}

enum BUSINESS { // business permission for Permission Object must >= 1000
    confirmOrder = 1000,
    preparationTrip = 1001,
    ExplanatoryItinerary = 1002,
    CompleteOrder = 1003,
    dispute = 1004,
};


const permission = async (protocol:Protocol, param:any) => {
    const entities:Permission_Entity[] = [
        {entity_address: TESTOR[0].address, permissions: [ {index:BUSINESS.confirmOrder}, ],},
        {entity_address: TESTOR[1].address, permissions: [ {index:BUSINESS.confirmOrder}, {index:BUSINESS.preparationTrip}],},
        {entity_address: TESTOR[2].address, permissions: [ {index:BUSINESS.preparationTrip}],},
        {entity_address: TESTOR[3].address, permissions: [ {index:BUSINESS.ExplanatoryItinerary}, ],},
        {entity_address: TESTOR[4].address, permissions: [ {index:BUSINESS.ExplanatoryItinerary}, ],},
        {entity_address: TESTOR[5].address, permissions: [ {index:BUSINESS.CompleteOrder},],},
        {entity_address: TESTOR[6].address, permissions: [ {index:BUSINESS.dispute},],},
    ]

    const p = Permission.New(protocol.CurrentSession(), 'permission test');

    for (const key in BUSINESS) { // add business permissions first.
        if (isNaN(Number(key))) {
            p.add_userdefine(parseInt(BUSINESS[key]), key)
        }
    }

    p.add_entity(entities);
    p.launch();
}

// machine nodes
//111
const order_confirmation:Machine_Node = {
    name: 'Order confirmation',
    pairs: [
        {prior_node: Machine.INITIAL_NODE_NAME, threshold:0, forwards:[
            {name:'Confirm order', weight: 1, permission:BUSINESS.confirmOrder},
        ]},
    ]
}
//111
const order_cancellation:Machine_Node = {
    name: 'Order cancellation',
    pairs: [
        {prior_node: Machine.INITIAL_NODE_NAME, threshold:0, forwards:[
            {name:'Payer cancels', weight: 1, namedOperator:Machine.OPERATOR_ORDER_PAYER},
            {name:'Seller cancels', weight: 1, permission:BUSINESS.confirmOrder},
        ]},
        {prior_node: 'Order confirmation', threshold:10, forwards:[
            {name:'Payer cancels', weight: 5, namedOperator:Machine.OPERATOR_ORDER_PAYER},
            {name:'Seller cancels', weight: 5, permission:BUSINESS.confirmOrder},
        ]},
        {prior_node: 'Trip preparation', threshold:10, forwards:[
            {name:'Payer request', weight: 5, namedOperator:Machine.OPERATOR_ORDER_PAYER},
            {name:'Seller cancels', weight: 5, permission:BUSINESS.confirmOrder},
        ]},
    ]
}
//111
const trip_preparation:Machine_Node = {
    name: 'Trip preparation',
    pairs: [
        {prior_node: 'Order confirmation', threshold:0, forwards:[
            {name:'Seller preparation', weight: 1, permission:BUSINESS.preparationTrip},
        ]},
    ]
}

//111
const order_completed:Machine_Node = {
    name: 'Order completed',
    pairs: [
        {prior_node: 'Tourism activity', threshold:10, forwards:[
            {name:'Payer sign', weight: 5, namedOperator:Machine.OPERATOR_ORDER_PAYER},
            {name:'Service provider confirms after 15 days', weight: 5, permission:BUSINESS.CompleteOrder},
        ]},
        {prior_node: 'Dispute', threshold:10, forwards:[
            {name:'Payer comfirms', weight: 6, namedOperator:Machine.OPERATOR_ORDER_PAYER},
            {name:'Seller comfirms', weight: 4, permission:BUSINESS.dispute},
        ]},
    ]
}
//111
const tourism_activity:Machine_Node = {
    name: 'Tourism activity',
    pairs: [
        {prior_node: 'Trip preparation', threshold:0, forwards:[
            {name:'Guide explanation', weight: 1, permission:BUSINESS.ExplanatoryItinerary},
        ]},
    ]
}
//111
const dispute:Machine_Node = {
    name: 'Dispute',
    pairs: [
        {prior_node: 'Order completed', threshold:0, forwards:[
            {name:'The order payer is not satisfied with the order within 15 days ',weight: 1,namedOperator:Machine.OPERATOR_ORDER_PAYER}
        ]},
    ]
}

// Chain transaction size limit, split into small transactions
const machine = async (protocol:Protocol, ids: Map<string, TxbObject[]>) => {
    const create = (protocol:Protocol, param:any) => {
        const permission = ids.get('permission::Permission')![0] ;
        const m = Machine.New(protocol.CurrentSession(), permission, 'The Nature Explorer Travel machine', 'https://wowok.net/');
        m.launch();
    }
    const add = (protocol:Protocol, param:any) => {
        const machine = param.get('machine::Machine')[0] ;
        const permission = ids.get('permission::Permission')![0] ;
        const m = Machine.From(protocol.CurrentSession(), permission, machine);
        m.add_node([order_confirmation, order_cancellation, order_completed, trip_preparation, tourism_activity, dispute]);
    }

    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([create], TEST_PRIV(), ids), ids); await sleep(2000);
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([add], TEST_PRIV(), ids), ids); await sleep(2000);
}

const machine_publish = async (protocol:Protocol, param:any) => {
    const machine = param.get('machine::Machine')[0] ;
    const permission = param.get('permission::Permission')[0] ;
    const m = Machine.From(protocol.CurrentSession(), permission, machine);
    m.publish();
}

const service = async (protocol:Protocol, param:any) => {
    const sales:Service_Sale[] = [
        {item:'< One Place in Finland > Romantic Aurora 10 day tour of One place in Finland Rock Church Rovaniemi Church across 66 degrees 33 minutes North latitude clock in the Arctic Circle landmark', price: BigInt(8999), stock: BigInt(56), endpoint:'http://www.bytshs.com/lines/show_200.html'}, 
        {item:'< Special Value > 10-day tour Kenya Rift Valley Giraffe Park Lake Navasha Park can take a hot air balloon at your own expense.', price: BigInt(24999), stock: BigInt(24), endpoint:'http://www.bytshs.com/lines/show_142.html'}, 
        {item:'【 Shanghai Departure 】< Aida Modo Cruise > Shanghai - Jeju - Fukuoka - Shanghai 4 nights 5 days tour cabin quadruple room {Japan, Korea} Aida World Modo set sail for international voyage', price: BigInt(2199), stock: BigInt(88), endpoint:'http://www.bytshs.com/lines/show_645.html'}, 
    ]
    const discount_type_a:Service_Discount = {
        name:'Select early bird discounts',  // 折扣名称
        price_greater: BigInt(5000), // 如果你想要设置一个最低购买金额才能使用折扣，可以设置这个值
        type:Service_Discount_Type.ratio, // 折扣类型，这里是百分比折扣
        off: 10, // 折扣力度，10% off
        duration_minutes: 60 * 24 * 30,   //     折扣有效期，例如30天
    }
    const discount_type_b:Service_Discount = {
        name:'Exclusive for old customers',
        price_greater: BigInt(2000),
        type:Service_Discount_Type.minus,
        off: 200,
        duration_minutes: 60 * 24 * 30,   //     折扣有效期，例如30天        
    }
    const discounts_dispatch:DicountDispatch[] = [
        {receiver: TESTOR[5].address, count: BigInt(2), discount: discount_type_a},
        {receiver: TESTOR[6].address, count: BigInt(2), discount: discount_type_a},
        {receiver: TESTOR[7].address, count: BigInt(2), discount: discount_type_a},
        {receiver: TESTOR[8].address, count: BigInt(2), discount: discount_type_a},
        {receiver: TESTOR[9].address, count: BigInt(2), discount: discount_type_a},
        {receiver: TESTOR[7].address, count: BigInt(1), discount: discount_type_b},//假设 7、8、9是老顾客
        {receiver: TESTOR[8].address, count: BigInt(1), discount: discount_type_b},
        {receiver: TESTOR[9].address, count: BigInt(1), discount: discount_type_b},
    ]

    const permission = param.get('permission::Permission')[0] ;
    const machine = param.get('machine::Machine')[0] ;
    const treasury = param.get('treasury::Treasury')[0] ;
    if (!permission || !machine || !treasury) {
        console.log('permission or machine invalid');
        return ;
    }

    const guard_withdraw = param.get('guard::Guard')[1];
    const guard_refund = param.get('guard::Guard')[2];
    if (!guard_withdraw || !guard_refund) {
        console.log('guard invalid');
        return ;
    }

    let service = Service.New(protocol.CurrentSession(), SERVICE_PAY_TYPE, permission, 'Tour services of Nature Explorer Tours.', treasury) ;
    service.set_machine(machine);
    service.add_sales(sales);
    service.discount_transfer(discounts_dispatch);
    service.launch();
}
//guard修改

const guard_confirmation_24hrs_more = async (protocol:Protocol, param:any) => {
    const machine = param.get('machine::Machine')[0] ;
    // Receipt will be signed by default 15 days after delivery
    const receipt = new GuardMaker();
    const receipt_progress_witness = receipt.add_constant(ValueType.TYPE_ADDRESS); // witness of Progress
    receipt.add_param(ValueType.TYPE_U64, 86400000) // 24 hours
        .add_query(MODULES.progress, 'Last Session Time', receipt_progress_witness)
        .add_logic(OperatorType.TYPE_NUMBER_ADD) // +
        .add_param(ContextType.TYPE_CLOCK) // current tx time
        .add_logic(OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL) // 1: current tx time >= (last session time + 24hrs)
        .add_param(ValueType.TYPE_STRING, order_confirmation.name)
        .add_query(MODULES.progress, 'Current Node', receipt_progress_witness)
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) // 2: current node equals order_confirmation
        .add_param(ValueType.TYPE_ADDRESS, machine) 
        .add_query(MODULES.progress, 'Machine', receipt_progress_witness) 
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) // 3: progress'machine equals this machine
        .add_logic(OperatorType.TYPE_LOGIC_AND, 3); // 1 and 2 and 3
    const guard = Guard.New(protocol.CurrentSession(), 'current on node '+order_confirmation.name+ ' and current tx time >= (last session time + 24hrs)', receipt.build());
    const permission = param.get('permission::Permission')[0] ;
    const m = Machine.From(protocol.CurrentSession(), permission, machine);
    const cancel:Machine_Forward = {name:'Goods not shipped for more than 24 hours', weight: 1, namedOperator:Machine.OPERATOR_ORDER_PAYER, guard:guard.get_object()};
    m.add_forward(order_confirmation.name, order_cancellation.name, cancel); 
    guard.launch()
}
//guard修改 1111
// machine guard 当前节点旅行已开始，当前发送时间> =（上一次会话+15天）
const guard_receipt = async (protocol:Protocol, param:any) => {
    const machine = param.get('machine::Machine')[0] ;
    // Current node travel has started, current sending time >= (last session + 15 days)
    const receipt = new GuardMaker();
    const receipt_progress_witness = receipt.add_constant(ValueType.TYPE_ADDRESS); // witness of Progress
    receipt.add_param(ValueType.TYPE_U64, 1296000000) // 15 days
        .add_query(MODULES.progress, 'Last Session Time', receipt_progress_witness)
        .add_logic(OperatorType.TYPE_NUMBER_ADD) // +
        .add_param(ContextType.TYPE_CLOCK) // current tx time
        .add_logic(OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL) // 1: current tx time >= (last session time + 15 days)
        .add_param(ValueType.TYPE_STRING, trip_preparation.name)
        .add_query(MODULES.progress, 'Current Node', receipt_progress_witness)
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) // 2: current node equals trip_preparation
        .add_param(ValueType.TYPE_ADDRESS, machine) 
        .add_query(MODULES.progress, 'Machine', receipt_progress_witness) 
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) // 3: progress'machine equals this machine
        .add_logic(OperatorType.TYPE_LOGIC_AND, 3); // 1 and 2 and 3
    const guard = Guard.New(protocol.CurrentSession(), 'current on node '+tourism_activity.name+ ' and current tx time >= (last session time + 15 days)', receipt.build());
    const permission = param.get('permission::Permission')[0] ;
    const m = Machine.From(protocol.CurrentSession(), permission, machine);
    const shipper_with_guard:Machine_Forward = {name:'Service provider comfirms after 15 days', weight: 5, permission:BUSINESS.ExplanatoryItinerary, guard:guard.get_object()};
    m.add_forward(trip_preparation.name, order_completed.name, shipper_with_guard);
    guard.launch()
}

//// 服务中的guard修改 111
const guard_withdraw = async (protocol:Protocol, param:any) => {
    const machine = param.get('machine::Machine')[0] ;
    // withdraw guard: order completed or arbitrition
    const withdraw = new GuardMaker();
    const withdraw_progress_witness = withdraw.add_constant(ValueType.TYPE_ADDRESS);
    const withdraw_completed = withdraw.add_constant(ValueType.TYPE_STRING, order_completed.name);
    withdraw.add_param(ContextType.TYPE_CONSTANT, withdraw_completed)
        .add_query(MODULES.progress, 'Current Node', withdraw_progress_witness)
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) 
        .add_param(ValueType.TYPE_ADDRESS, machine) 
        .add_query(MODULES.progress, 'Machine', withdraw_progress_witness) 
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) 
        .add_param(ValueType.TYPE_U64, 1296000000) // 15 days
        .add_query(MODULES.progress, 'Last Session Time', withdraw_progress_witness)
        .add_logic(OperatorType.TYPE_NUMBER_ADD) // +
        .add_param(ContextType.TYPE_CLOCK) // current tx time
        .add_logic(OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL) // 1: current tx time >= (last session time + 15 days)
        .add_logic(OperatorType.TYPE_LOGIC_AND, 3); 
    const permission = param.get('permission::Permission')[0] ;
    const service = param.get('service::Service')[0] ;
    var desp = 'Widthdraw on status: '+order_completed.name+'; and the dispute submission deadline of 15 days is exceeded\n; Service: '+service;
    const guard = Guard.New(protocol.CurrentSession(), desp, withdraw.build());
    Service.From(protocol.CurrentSession(), SERVICE_PAY_TYPE, permission, service).add_withdraw_guards([{guard:guard.get_object(), percent:100}]);
    guard.launch();
}
// 服务中的guard修改 1111
const guard_refund = async (protocol:Protocol, param:any) => {
    const machine = param.get('machine::Machine')[0] ;
    // refund guard: order canceled
    const refund = new GuardMaker();
    const refund_progress_witness = refund.add_constant(ValueType.TYPE_ADDRESS);
    const refund_canceled = refund.add_constant(ValueType.TYPE_STRING, order_cancellation.name);
    const refund_goods_lost = refund.add_constant(ValueType.TYPE_STRING, order_cancellation.name);
    refund.add_param(ContextType.TYPE_CONSTANT, refund_canceled)
        .add_query(MODULES.progress, 'Current Node', refund_progress_witness)
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) 
        .add_param(ContextType.TYPE_CONSTANT, refund_goods_lost)
        .add_query(MODULES.progress, 'Current Node', refund_progress_witness)
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL)
        .add_logic(OperatorType.TYPE_LOGIC_OR)
        .add_param(ValueType.TYPE_ADDRESS, machine) 
        .add_query(MODULES.progress, 'Machine', refund_progress_witness) 
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) 
        .add_logic(OperatorType.TYPE_LOGIC_AND, 2); 
    const permission = param.get('permission::Permission')[0] ;
    const service = param.get('service::Service')[0] ;
    const guard = Guard.New(protocol.CurrentSession(), 'Refund Guard for Machine nodes for Service: ' + service, refund.build());

    Service.From(protocol.CurrentSession(), SERVICE_PAY_TYPE, permission, service).add_refund_guards([{guard:guard.get_object(), percent:100}]);
    guard.launch();
}
//guard修改 11111
//订单付款人在15天内对订单不满意
const guard_unsatisfied_order = async (protocol:Protocol, param:any) => {
    const machine = param.get('machine::Machine')[0] ;
    const maker = new GuardMaker();
    const receipt_progress_witness = maker.add_constant(ValueType.TYPE_ADDRESS); // witness of Progress
    maker.add_param(ValueType.TYPE_U64, 1296000000) // 15 days
        .add_query(MODULES.progress, 'Last Session Time', receipt_progress_witness)
        .add_logic(OperatorType.TYPE_NUMBER_ADD) // +
        .add_param(ContextType.TYPE_CLOCK) // current tx time
        .add_logic(OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL) // 1: current tx time >= (last session time + 15 days)
        .add_param(ValueType.TYPE_STRING, order_completed.name)
        .add_query(MODULES.progress, 'Current Node', receipt_progress_witness)
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) // 2: current node equals goods_shippedout
        .add_param(ValueType.TYPE_ADDRESS, machine) 
        .add_query(MODULES.progress, 'Machine', receipt_progress_witness) 
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) // 3: progress'machine equals this machine
        .add_logic(OperatorType.TYPE_LOGIC_AND, 3); // 1 and 2 and 3
    var desp = order_completed.name+'->'+dispute.name+':\n';
    desp += 'The order payer is not satisfied with the order within 15 days;';
    const guard = Guard.New(protocol.CurrentSession(), desp, maker.build());
    const permission = param.get('permission::Permission')[0] ;
    const m = Machine.From(protocol.CurrentSession(), permission, machine);
    const express:Machine_Forward = {name:'The order payer is not satisfied with the order within 15 days', weight: 5, namedOperator:Machine.OPERATOR_ORDER_PAYER, guard:guard.get_object()};
    m.add_forward(dispute.name, tourism_activity.name, express);
    guard.launch()
}

const reward = async (protocol:Protocol, param:any) => {

}

const test_service = async (protocol:Protocol, param:any) => {

}

main().catch(console.error)