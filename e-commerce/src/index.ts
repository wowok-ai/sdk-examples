
import { Protocol, ENTRYPOINT, TxbObject, RpcResultParser, GuardParser, Wowok, Machine_Node, Machine, Permission_Entity, 
    PermissionIndex, Permission, Service, Service_Sale, DicountDispatch, Service_Discount_Type, Service_Discount, Guard,
    GuardMaker, MODULES,
    ContextType,
    ValueType,
    OperatorType,
    Machine_Forward, 
} from 'wowok';
import { TEST_PRIV, TEST_ADDR, TESTOR } from './common'


const main = async () => {
    let protocol = new Protocol(ENTRYPOINT.testnet)
    let ids = new Map<string, TxbObject[]>();
    
    // permission
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([permission], TEST_PRIV(), ids), ids);
    console.log('permission id: ' + ids.get('permission::Permission'));  
   
    // machine
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([machine], TEST_PRIV(), ids), ids);
    console.log('machine id: ' + ids.get('machine::Machine')); 
    
    // guard
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([guard_receipt], TEST_PRIV(), ids), ids); // guard 0
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([guard_withdraw], TEST_PRIV(), ids), ids); // guard 1
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([guard_refund], TEST_PRIV(), ids), ids); // guard 2
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([guard_lost_comfirm_compensate], TEST_PRIV(), ids), ids); // guard 3
    console.log('guard id: ' + ids.get('guard::Guard'));  

    // publish machine
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([machine_publish], TEST_PRIV(), ids), ids);

    // service
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([service], TEST_PRIV(), ids), ids);
    console.log('service id: ' + ids.get('service::Service'));  

    // reward

    // test service
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([service_run], TEST_PRIV(), ids), ids);
    console.log(ids); 
}  

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const service_run = async (protocol:Protocol, param:any) => {
    const machine = param.get('machine::Machine')[0] ;
    const permission = param.get('permission::Permission')[0] ;
    const service = param.get('service::Service')[0];
}

enum BUSINESS { // business permission for Permission Object must >= 1000
    confirmOrder = 1000,
    shipping = 1001,
    express = 1002,
    finance = 1003,
};


const permission = async (protocol:Protocol, param:any) => {
    const entities:Permission_Entity[] = [
        {entity_address: TESTOR[0].address, permissions: [ {index:BUSINESS.confirmOrder}, ],},
        {entity_address: TESTOR[1].address, permissions: [ {index:BUSINESS.confirmOrder}, {index:BUSINESS.shipping}],},
        {entity_address: TESTOR[2].address, permissions: [ {index:BUSINESS.shipping}],},
        {entity_address: TESTOR[3].address, permissions: [ {index:BUSINESS.express}, ],},
        {entity_address: TESTOR[4].address, permissions: [ {index:BUSINESS.express}, ],},
        {entity_address: TESTOR[5].address, permissions: [ {index:BUSINESS.finance},],},
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
const order_confirmation:Machine_Node = {
    name: 'Order confirmation',
    pairs: [
        {prior_node: Machine.INITIAL_NODE_NAME, threshold:0, forwards:[
            {name:'Confirm order', weight: 1, permission:BUSINESS.confirmOrder},
        ]},
    ]
}
const order_cancellation:Machine_Node = {
    name: 'Order cancellation',
    pairs: [
        {prior_node: Machine.INITIAL_NODE_NAME, threshold:0, forwards:[
            {name:'Payer cancels', weight: 1, namedOperator:Machine.OPERATOR_ORDER_PAYER},
            {name:'Seller cancels', weight: 1, permission:BUSINESS.confirmOrder},
        ]},
    ]
}
const goods_shippedout:Machine_Node = {
    name: 'Goods shipped out',
    pairs: [
        {prior_node: 'Order confirmation', threshold:10, forwards:[
            {name:'Express pickup', weight: 5, permission:BUSINESS.express},
            {name:'Seller Ships', weight: 5, permission:BUSINESS.shipping},
        ]},
    ]
}

const order_completed:Machine_Node = {
    name: 'Order completed',
    pairs: [
        {prior_node: 'Goods shipped out', threshold:10, forwards:[
            {name:'Payer sign', weight: 10, namedOperator:Machine.OPERATOR_ORDER_PAYER},
            {name:'Expdress comfirms', weight: 5, permission:BUSINESS.express},
            {name:'Shipper comfirms after 15 days', weight: 5, permission:BUSINESS.shipping},
        ]},
    ]
}

const goods_lost:Machine_Node = {
    name: 'Goods lost',
    pairs: [
        {prior_node: 'Order completed', threshold:10, forwards:[
            {name:'Payer confirmation', weight: 5, namedOperator:Machine.OPERATOR_ORDER_PAYER},
            /*{name:'Express confirmation', weight: 5, permission:BUSINESS.express},*/
        ]},
        {prior_node: 'Goods shipped out', threshold:0, forwards:[
            {name:'Express confirmation', weight: 1, permission:BUSINESS.express},
        ]},
    ]
}
const dispute:Machine_Node = {
    name: 'Dispute',
    pairs: [
        {prior_node: 'Order completed', threshold:0, forwards:[
            {name:'Payer submits', weight: 1, namedOperator:Machine.OPERATOR_ORDER_PAYER},
        ]},
    ]
}

const compensation:Machine_Node = {
    name: 'Compensation',
    pairs: [
        {prior_node: 'Dispute', threshold:0, forwards:[
            {name:'Confirm compensation', weight: 1, permission: BUSINESS.finance},
        ]},
    ]
}

const no_compensation:Machine_Node = {
    name: 'No compensation',
    pairs: [
        {prior_node: 'Dispute', threshold:10, forwards:[
            {name:'Payer comfirms', weight: 5, namedOperator:Machine.OPERATOR_ORDER_PAYER},
            {name:'Seller comfirms', weight: 5, permission:BUSINESS.shipping},
        ]},
    ]
}

const machine = async (protocol:Protocol, param:any) => {
    const permission = param.get('permission::Permission')[0] ;
    const m = Machine.New(protocol.CurrentSession(), permission, 'E-commerce Machine', 'https://wowok.net/');
    m.add_node([order_confirmation, order_cancellation, order_completed, goods_lost, compensation, dispute, goods_shippedout, no_compensation]);
    m.launch();
}

const machine_publish = async (protocol:Protocol, param:any) => {
    const machine = param.get('machine::Machine')[0] ;
    const permission = param.get('permission::Permission')[0] ;
    const guard_15days = param.get('guard::Guard')[0];
    const guard_reaction_24hrs = param.get('guard::Guard')[3];
    const m = Machine.From(protocol.CurrentSession(), permission, machine);
    const shipper_with_guard:Machine_Forward = {name:'Shipper comfirms after 15 days', weight: 5, permission:BUSINESS.shipping, guard:guard_15days};
    m.add_forward(goods_shippedout.name, order_completed.name, shipper_with_guard);
    const lost_with_guard:Machine_Forward = {name:'Response within 24 hours if package is lost', weight: 5, permission:BUSINESS.express, guard:guard_reaction_24hrs};
    m.add_forward(order_completed.name, goods_lost.name, lost_with_guard);
    m.publish();
}

const service = async (protocol:Protocol, param:any) => {
    const SERVICE_PAY_TYPE = Protocol.SUI_TOKEN_TYPE; // token for pay
    const sales:Service_Sale[] = [
        {item:'Play Purse for Little Girls, 35PCS Toddler Purse with Pretend Makeup for Toddlers, Princess Toys Includes Handbag, Phone, Wallet, Camera, Keys, Kids Purse Birthday Gift for Girls Age 3 4 5 6+', price: BigInt(3), stock: BigInt(10022), endpoint:'https://www.amazon.com/-/zh/dp/B0CC5HY7FW/?_encoding=UTF8&pd_rd_w=WCGMu&content-id=amzn1.sym.4b90c80a-3aee-44a3-b41d-fc2674a3ef63%3Aamzn1.symc.ee4c414f-039b-458d-a009-4479557ca47b&pf_rd_p=4b90c80a-3aee-44a3-b41d-fc2674a3ef63&pf_rd_r=8THXB3PK5QMJY69HTZBT&pd_rd_wg=GncEh&pd_rd_r=cabe72a9-3591-47f1-8cb1-fd10ec2d9db1&ref_=pd_hp_d_btf_ci_mcx_mr_hp_d'}, 
        {item:'Little Girls Purse with Accessories and Pretend Makeup for Toddlers - My First Purse Set Includes Handbag, Phone, Wallet, Play Makeup and More Pretend Play Toys for Girls Age 3 +, Great Gift for Girls', price: BigInt(5), stock: BigInt(10111), endpoint:'https://www.amazon.com/-/zh/dp/B0BJYRT9JL/?_encoding=UTF8&pd_rd_w=WCGMu&content-id=amzn1.sym.4b90c80a-3aee-44a3-b41d-fc2674a3ef63%3Aamzn1.symc.ee4c414f-039b-458d-a009-4479557ca47b&pf_rd_p=4b90c80a-3aee-44a3-b41d-fc2674a3ef63&pf_rd_r=8THXB3PK5QMJY69HTZBT&pd_rd_wg=GncEh&pd_rd_r=cabe72a9-3591-47f1-8cb1-fd10ec2d9db1&ref_=pd_hp_d_btf_ci_mcx_mr_hp_d&th=1'}, 
        {item:'Tree House Building Set, Friendship Treehouse Building Toy for Girls, with Slides, Swing, Animals Creative Forest House Building Brick Kits, Great Gift for Kids Who Love Nature', price: BigInt(8), stock: BigInt(8867), endpoint:'https://www.amazon.com/dp/B0CTHQG2QC/ref=sr_1_1_sspa?__mk_zh_CN=%E4%BA%9A%E9%A9%AC%E9%80%8A%E7%BD%91%E7%AB%99&dib=eyJ2IjoiMSJ9.-74BToXqoNZSYOJd18joki3pJRFcdz2A48Z6SDgyXgdG3ubgYJS56JDSqiHzW9NGNzq35t1UCJDVtB6tjuVa3et20K06IYqBshPc5XMK9hMNOw_bwj2bXcxGURGsD5yYmyC18d1JaqH9mkyRwLmdamSaeEBogjaM4QJV31Xvko4vbMy3elYuCDtOlC_4BQvRiCS5s_cQH_I07eMDAonkmD8-mKVE72HOjqIBWLHPh6apvcLi9ouUUx1PPy8fp7KCbRprsjFzh8EWkGzxjHUQddVvaa4-jDMfkQhMmroAp8s.vc0mkMyz72-tRAlwl2Lzt3ewSdI7BD3Q288AXz8sfHg&dib_tag=se&keywords=%E6%A0%91%E5%B1%8B&qid=1727248906&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1'}, 
    ]
    const discount_type_a:Service_Discount = {
        name:'Discounts on Select Holiday Gifts',
        price_greater: BigInt(0),
        type:Service_Discount_Type.ratio,
        off: 20,
        duration_minutes: 10000000,        
    }
    const discount_type_b:Service_Discount = {
        name:'Exclusive for old customers',
        price_greater: BigInt(2),
        type:Service_Discount_Type.minus,
        off: 2,
        duration_minutes: 60000000,        
    }
    const discounts_dispatch:DicountDispatch[] = [
        {receiver: TESTOR[5].address, count: BigInt(2), discount: discount_type_a},
        {receiver: TESTOR[6].address, count: BigInt(2), discount: discount_type_a},
        {receiver: TESTOR[7].address, count: BigInt(2), discount: discount_type_a},
        {receiver: TESTOR[8].address, count: BigInt(2), discount: discount_type_a},
        {receiver: TESTOR[9].address, count: BigInt(2), discount: discount_type_a},
        {receiver: TESTOR[7].address, count: BigInt(1), discount: discount_type_b},
        {receiver: TESTOR[8].address, count: BigInt(1), discount: discount_type_b},
        {receiver: TESTOR[9].address, count: BigInt(1), discount: discount_type_b},
    ]

    const permission = param.get('permission::Permission')[0] ;
    const machine = param.get('machine::Machine')[0] ;
    if (!permission || !machine ) {
        console.log('permission or machine invalid');
        return ;
    }

    const guard_withdraw = param.get('guard::Guard')[1];
    const guard_refund = param.get('guard::Guard')[2];
    if (!guard_withdraw || !guard_refund) {
        console.log('guard invalid');
        return ;
    }

    let service = Service.New(protocol.CurrentSession(), SERVICE_PAY_TYPE, permission, 'Top1 Toy Store in US.', TEST_ADDR()) ;
    service.set_machine(machine);
    service.add_sales(sales);
    service.discount_transfer(discounts_dispatch);
    service.add_refund_guards([
        {guard:guard_refund, percent:100}
    ]);
    service.add_withdraw_guards([
        {guard:guard_withdraw, percent:100}
    ]);
    service.publish(); 
    service.launch();
}

const guard_receipt = async (protocol:Protocol, param:any) => {
    const machine = param.get('machine::Machine')[0] ;
    // Receipt will be signed by default 15 days after delivery
    const receipt = new GuardMaker();
    const receipt_progress_witness = receipt.add_constant(ValueType.TYPE_ADDRESS); // witness of Progress
    receipt.add_param(ValueType.TYPE_U64, 1296000000) // 15 days
        .add_query(MODULES.progress, 'Last Session Time', receipt_progress_witness)
        .add_logic(OperatorType.TYPE_NUMBER_ADD) // +
        .add_param(ContextType.TYPE_CLOCK) // current tx time
        .add_logic(OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL) // 1: current tx time >= (last session time + 15 days)
        .add_param(ValueType.TYPE_STRING, goods_shippedout.name)
        .add_query(MODULES.progress, 'Current Node', receipt_progress_witness)
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) // 2: current node equals goods_shippedout
        .add_param(ValueType.TYPE_ADDRESS, machine) 
        .add_query(MODULES.progress, 'Machine', receipt_progress_witness) 
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) // 3: progress'machine equals this machine
        .add_logic(OperatorType.TYPE_LOGIC_AND, 3); // 1 and 2 and 3
    Guard.launch(protocol.CurrentSession(), 'current on node '+goods_shippedout.name+ ' and current tx time >= (last session time + 15 days)', receipt.build());
}

const guard_withdraw = async (protocol:Protocol, param:any) => {
    const machine = param.get('machine::Machine')[0] ;
    // withdraw guard: order completed or arbitrition
    const withdraw = new GuardMaker();
    const withdraw_progress_witness = withdraw.add_constant(ValueType.TYPE_ADDRESS);
    const withdraw_completed = withdraw.add_constant(ValueType.TYPE_STRING, order_completed.name);
    const withdraw_dispute = withdraw.add_constant(ValueType.TYPE_STRING, dispute.name);
    withdraw.add_param(ContextType.TYPE_CONSTANT, withdraw_completed)
        .add_query(MODULES.progress, 'Current Node', withdraw_progress_witness)
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) 
        .add_param(ContextType.TYPE_CONSTANT, withdraw_dispute)
        .add_query(MODULES.progress, 'Current Node', withdraw_progress_witness)
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL)
        .add_logic(OperatorType.TYPE_LOGIC_OR)
        .add_param(ValueType.TYPE_ADDRESS, machine) 
        .add_query(MODULES.progress, 'Machine', withdraw_progress_witness) 
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) 
        .add_logic(OperatorType.TYPE_LOGIC_AND, 2); 
    Guard.launch(protocol.CurrentSession(), 'Widthdraw Guard for Machine nodes', withdraw.build());
}

const guard_refund = async (protocol:Protocol, param:any) => {
    const machine = param.get('machine::Machine')[0] ;
    // refund guard: order canceled or goods lost
    const refund = new GuardMaker();
    const refund_progress_witness = refund.add_constant(ValueType.TYPE_ADDRESS);
    const refund_canceled = refund.add_constant(ValueType.TYPE_STRING, order_cancellation.name);
    const refund_goods_lost = refund.add_constant(ValueType.TYPE_STRING, goods_lost.name);
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
    Guard.launch(protocol.CurrentSession(), 'Refund Guard for Machine nodes', refund.build());
}

const guard_lost_comfirm_compensate = async (protocol:Protocol, param:any) => {
    const machine = param.get('machine::Machine')[0] ;
    const maker = new GuardMaker();
    const progress = maker.add_constant(ValueType.TYPE_ADDRESS);
    const completed_name = maker.add_constant(ValueType.TYPE_STRING, order_completed.name);
    const lost_name = maker.add_constant(ValueType.TYPE_STRING, goods_lost.name);
    const payer_forward_name = maker.add_constant(ValueType.TYPE_STRING, 'Payer confirmation');
    const payment = maker.add_constant(ValueType.TYPE_ADDRESS);
    const order = maker.add_constant(ValueType.TYPE_ADDRESS)
    maker.add_param(ContextType.TYPE_CONSTANT, payer_forward_name)
        .add_param(ContextType.TYPE_CONSTANT, lost_name)
        .add_param(ContextType.TYPE_CONSTANT, completed_name)
        .add_query(MODULES.progress, 'Closest Forward time', progress) // time that payer confirmed
        .add_param(ValueType.TYPE_U64, 86400000) // 24 hours
        .add_logic(OperatorType.TYPE_NUMBER_ADD) 
        .add_param(ContextType.TYPE_CLOCK)
        .add_logic(OperatorType.TYPE_LOGIC_AS_U256_GREATER) // 1: tx time > (time that payer confirmed + 24 hrs)
        .add_query(MODULES.order, 'Progress', order)
        .add_param(ContextType.TYPE_CONSTANT, progress)
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL) // 2: ralationship: order's progress
        .add_query(MODULES.payment, 'Guard for Perpose', payment)
        .add_param(ContextType.TYPE_GUARD)
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL)
        .add_query(MODULES.payment, 'Index', payment)
        .add_query(MODULES.progress, 'Current Session-id', progress)
        .add_logic(OperatorType.TYPE_LOGIC_EQUAL)
        .add_query(MODULES.order, 'Payer', order)
        .add_query(MODULES.payment, 'Amount for a Recipient', payment)
        .add_param(ValueType.TYPE_U64, 100000000)
        .add_logic(OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL) 
        .add_logic(OperatorType.TYPE_LOGIC_AND, 3)  // 3: payment: for this guard usage && progress session id matchs && compensation > 100000000
        .add_logic(OperatorType.TYPE_LOGIC_AND, 3)  // 4: 1 && 2 && 3
        .add_param(ContextType.TYPE_CONSTANT, payer_forward_name)
        .add_param(ContextType.TYPE_CONSTANT, lost_name)
        .add_param(ContextType.TYPE_CONSTANT, completed_name)
        .add_query(MODULES.progress, 'Closest Forward time', progress) // time that payer confirmed
        .add_param(ValueType.TYPE_U64, 86400000) // 24 hours
        .add_logic(OperatorType.TYPE_NUMBER_ADD) 
        .add_param(ContextType.TYPE_CLOCK)
        .add_logic(OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL) // 5: tx time < (time that payer confirmed + 24 hrs) : No compensation required
        .add_logic(OperatorType.TYPE_LOGIC_OR, 2); // 6: 4 || 5
    var desp = order_completed.name+'->'+goods_lost.name+':\n';
    desp += '1: Compensation 0.1 SUI for express response exceeding 24 hours;\n';
    desp += '2: If the status is resolved within 24 hours, no compensation will be required.';
    Guard.launch(protocol.CurrentSession(), desp, maker.build());
}

const reward = async (protocol:Protocol, param:any) => {

}

const test_service = async (protocol:Protocol, param:any) => {

}

main().catch(console.error)