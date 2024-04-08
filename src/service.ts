 //@ts-ignore 
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { service, service_add_sale, service_publish, service_pause, launch as service_launch, DicountDispatch,
    service_discount_transfer, Service_Discount_Type, Service_Buy, Service_Sale,
    service_set_price, service_set_machine, service_add_stock, buy,
    service_withdraw} from 'wowok/src/service';
import { MachineObject, PermissionObject, ProgressObject, OperatorType, ContextType, DemandObject, RewardObject,
    ServiceObject, DiscountObject, OrderObject, ValueType,RepositoryObject, 
 } from 'wowok/src/protocol';

import { ADDR, SENDER_PRIV } from './common'


const pay_type = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
const service_sales1:Service_Sale = {
    item:'cup A',
    price: 3,
    stock: 10,
}
const service_sales2:Service_Sale = {
    item:'cup B',
    price: 13,
    stock: 220,
}
const service_buy1: Service_Buy = {
    item: service_sales1.item,
    count: 200,
}
const service_buy2: Service_Buy = {
    item: service_sales2.item,
    count: 1,
}
const discount1 : DicountDispatch = {
    receiver: ADDR,
    count: 10,
    discount:{
        name:'discounts for cup service ',
        price_greater: 100,
        type:Service_Discount_Type.ratio,
        off: 20,
        duration_minutes: 1000000,
    }
}
const discount2 : DicountDispatch = {
    receiver: ADDR,
    count: 1,
    discount:{
        name:'discount',
        type:Service_Discount_Type.minus,
        off: 100,
        duration_minutes: 1000000,
        time_start: 200000,
    }
}

export const test_service_launch = async(txb:TransactionBlock, param:any) => {
    let permission = txb.object(param.get('permission::Permission')[0] as string) as PermissionObject;
    let machine = txb.object(param.get('machine::Machine')[0] as string) as MachineObject;
    let s = service(pay_type, txb, permission, 'cup service', ADDR, 'https://wwk.io/') as ServiceObject;

    service_set_machine(pay_type, txb, s, permission, machine);
    service_add_sale(pay_type, txb, s, permission, [service_sales1, service_sales2]);
    service_add_stock(pay_type, txb, s, permission, service_sales1.item, 1000);
    service_set_price(pay_type, txb, s, permission, service_sales2.item, 888);
    service_discount_transfer(pay_type, txb, s, permission, [discount1, discount2]);
    service_publish(pay_type, txb, s, permission);
    service_launch(pay_type, txb, s);
}

export const test_service_order = async(txb:TransactionBlock, param:any) => {
    let permission = txb.object(param.get('permission::Permission')[0] as string) as PermissionObject;
    let machine = txb.object(param.get('machine::Machine')[0] as string) as MachineObject;
    let s = txb.object(param.get('service::Service')[0] as string) as ServiceObject;

    buy(pay_type, txb, s, [service_buy1, service_buy2], txb.splitCoins(txb.gas, [txb.pure(100000)]), param.get('order::Discount')[0] as string, machine);
    buy(pay_type, txb, s, [service_buy1], txb.splitCoins(txb.gas, [txb.pure(10000)]), param.get('order::Discount')[1] as  string, machine);
    buy(pay_type, txb, s, [service_buy2], txb.splitCoins(txb.gas, [txb.pure(100000)]), param.get('order::Discount')[2] as string, machine);
}

export const test_service_withdraw = async(txb:TransactionBlock, param:any) => {
    let permission = param.get('permission::Permission')[0] as string;
    let s = param.get('service::Service')[0] as string;
    let orders = param.get('order::Order') as string[];
    
    orders.forEach((o) => {
        service_withdraw(pay_type, txb, s, permission, o);
    })
}