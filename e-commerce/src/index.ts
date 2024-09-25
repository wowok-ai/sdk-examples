
import { Protocol, ENTRYPOINT, TxbObject, RpcResultParser, GuardParser, Wowok, Machine_Node, Machine, Permission_Entity, 
    PermissionIndex, Permission, Service, Service_Sale, DicountDispatch, Service_Discount_Type, Service_Discount
} from 'wowok';
import { TEST_PRIV, TEST_ADDR, TESTOR } from './common'


const main = async () => {
    let protocol = new Protocol(ENTRYPOINT.testnet)
    let ids = new Map<string, TxbObject[]>();
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([permission], TEST_PRIV(), ids), ids);
    console.log('permission id: ' + ids.get('permission::Permission'));  
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([machine], TEST_PRIV(), ids), ids);
    console.log('machine id: ' + ids.get('machine::Machine'));  
    RpcResultParser.objectids_from_response(protocol, await protocol.SignExcute([service], TEST_PRIV(), ids), ids);
    console.log('service id: ' + ids.get('service::Service'));  
}  

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

enum BUSINESS { // business permission for Permission Object must >= 1000
    confirm_order = 1000,
    shipping = 1001,
    express = 1002,
    finance = 1003,
};

const permission = async (protocol:Protocol, param:any) => {
    const entities:Permission_Entity[] = [
        {entity_address: TESTOR[0].address, permissions: [ {index:BUSINESS.confirm_order}, ],},
        {entity_address: TESTOR[1].address, permissions: [ {index:BUSINESS.confirm_order}, {index:BUSINESS.shipping}],},
        {entity_address: TESTOR[2].address, permissions: [ {index:BUSINESS.shipping}],},
        {entity_address: TESTOR[3].address, permissions: [ {index:BUSINESS.express}, ],},
        {entity_address: TESTOR[4].address, permissions: [ {index:BUSINESS.express}, ],},
        {entity_address: TESTOR[5].address, permissions: [ {index:BUSINESS.finance},],},
    ]

    const p = Permission.New(protocol.CurrentSession(), 'permission test');
    p.add_entity(entities);
    p.launch();
}

const machine = async (protocol:Protocol, param:any) => {
    const order_confirmation:Machine_Node = {
        name: 'Order confirmation',
        pairs: [
            {prior_node: Machine.INITIAL_NODE_NAME, threshold:0, forwards:[
                {name:'Confirm order', weight: 1, permission:BUSINESS.confirm_order},
            ]},
        ]
    }
    const order_cancellation:Machine_Node = {
        name: 'Order cancellation',
        pairs: [
            {prior_node: Machine.INITIAL_NODE_NAME, threshold:0, forwards:[
                {name:'Payer cancels', weight: 1, namedOperator:Machine.OPERATOR_ORDER_PAYER},
                {name:'Seller cancels', weight: 1, permission:BUSINESS.confirm_order},
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
            {prior_node: 'Goods shipped out', threshold:0, forwards:[
                {name:'Payer sign', weight: 1, namedOperator:Machine.OPERATOR_ORDER_PAYER},
                {name:'Default receipt after 15 days', weight: 1, permission:BUSINESS.express},
            ]},
        ]
    }
    const goods_lost:Machine_Node = {
        name: 'Goods lost',
        pairs: [
            {prior_node: 'Order completed', threshold:10, forwards:[
                {name:'Payer confirmation', weight: 5, namedOperator:Machine.OPERATOR_ORDER_PAYER},
                {name:'Express confirmation', weight: 5, permission:BUSINESS.express},
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
    const arbitrition:Machine_Node = {
        name: 'Arbitrition',
        pairs: [
            {prior_node: 'Dispute', threshold:0, forwards:[
                {name:'Confirm compensation', weight: 1, permission: BUSINESS.finance},
            ]},
        ]
    }

    const permission = param.get('permission::Permission')[0] ;
    const m = Machine.New(protocol.CurrentSession(), permission, 'E-commerce Machine', 'https://wowok.net/');
    m.add_node([order_confirmation, order_cancellation, order_completed, goods_lost, arbitrition, dispute, goods_shippedout]);
    m.publish();
    m.launch();
}

const service = async (protocol:Protocol, param:any) => {
    const SERVICE_PAY_TYPE = Protocol.SUI_TOKEN_TYPE; // token for pay
    const sales:Service_Sale[] = [
        {item:'小女孩游戏钱包,儿童钱包生日礼物,适合3岁、4岁、5岁、6岁以上女孩', price: BigInt(3), stock: BigInt(10022), endpoint:'https://www.amazon.com/-/zh/dp/B0CC5HY7FW/?_encoding=UTF8&pd_rd_w=WCGMu&content-id=amzn1.sym.4b90c80a-3aee-44a3-b41d-fc2674a3ef63%3Aamzn1.symc.ee4c414f-039b-458d-a009-4479557ca47b&pf_rd_p=4b90c80a-3aee-44a3-b41d-fc2674a3ef63&pf_rd_r=8THXB3PK5QMJY69HTZBT&pd_rd_wg=GncEh&pd_rd_r=cabe72a9-3591-47f1-8cb1-fd10ec2d9db1&ref_=pd_hp_d_btf_ci_mcx_mr_hp_d'}, 
        {item:'小女孩钱包带配饰和幼儿假装化妆品,适合3岁', price: BigInt(5), stock: BigInt(10111), endpoint:'https://www.amazon.com/-/zh/dp/B0BJYRT9JL/?_encoding=UTF8&pd_rd_w=WCGMu&content-id=amzn1.sym.4b90c80a-3aee-44a3-b41d-fc2674a3ef63%3Aamzn1.symc.ee4c414f-039b-458d-a009-4479557ca47b&pf_rd_p=4b90c80a-3aee-44a3-b41d-fc2674a3ef63&pf_rd_r=8THXB3PK5QMJY69HTZBT&pd_rd_wg=GncEh&pd_rd_r=cabe72a9-3591-47f1-8cb1-fd10ec2d9db1&ref_=pd_hp_d_btf_ci_mcx_mr_hp_d&th=1'}, 
        {item:'树屋积木套装,女孩友谊树屋建筑玩具,带滑梯、秋千、动物创意森林屋积木套装', price: BigInt(8), stock: BigInt(8867), endpoint:'https://www.amazon.com/dp/B0CTHQG2QC/ref=sr_1_1_sspa?__mk_zh_CN=%E4%BA%9A%E9%A9%AC%E9%80%8A%E7%BD%91%E7%AB%99&dib=eyJ2IjoiMSJ9.-74BToXqoNZSYOJd18joki3pJRFcdz2A48Z6SDgyXgdG3ubgYJS56JDSqiHzW9NGNzq35t1UCJDVtB6tjuVa3et20K06IYqBshPc5XMK9hMNOw_bwj2bXcxGURGsD5yYmyC18d1JaqH9mkyRwLmdamSaeEBogjaM4QJV31Xvko4vbMy3elYuCDtOlC_4BQvRiCS5s_cQH_I07eMDAonkmD8-mKVE72HOjqIBWLHPh6apvcLi9ouUUx1PPy8fp7KCbRprsjFzh8EWkGzxjHUQddVvaa4-jDMfkQhMmroAp8s.vc0mkMyz72-tRAlwl2Lzt3ewSdI7BD3Q288AXz8sfHg&dib_tag=se&keywords=%E6%A0%91%E5%B1%8B&qid=1727248906&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1'}, 
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
    if (!permission || !machine) {
        console.log('permission or machine invalid');
        return ;
    }

    let service = Service.New(protocol.CurrentSession(), SERVICE_PAY_TYPE, permission, 'Top1 Toy Store in US.', TEST_ADDR()) ;
    service.set_machine(machine);
    service.add_sales(sales);
    service.discount_transfer(discounts_dispatch);
    service.publish(); 
    service.launch();
}

const guard = async (protocol:Protocol, param:any) => {
    
}
main().catch(console.error)