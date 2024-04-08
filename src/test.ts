 //@ts-ignore 
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { machine, Machine_Node, INITIAL_NODE_NAME, machine_remove_node, MachineNodeObject, 
    machine_add_node, machine_set_endpoint, machine_publish, launch as machine_launch} from 'wowok/src/machine';
import { Permission_Entity, permission, add_entity, add_admin, set_guard, PermissionIndex,
    remove_entity, launch as permission_launch } from 'wowok/src/permission';
import { hold, next } from 'wowok/src/progress';
import { service, service_add_sale, service_publish, service_pause, launch as service_launch, DicountDispatch,
    service_discount_transfer, Service_Discount_Type, Service_Buy, Service_Sale,
    service_set_price, service_set_machine, service_add_stock, buy} from 'wowok/src/service';
import { MachineObject, PermissionObject, ProgressObject, OperatorType, ContextType, DemandObject, RewardObject,
    ServiceObject, DiscountObject, OrderObject, ValueType,RepositoryObject, 
 } from 'wowok/src/protocol';
import { SenseMaker, Guard_Creation, Guard_Sense, Guard_Sense_Binder, 
    launch as guard_launch, signer_guard } from 'wowok/src/guard';
import { demand, launch as demand_launch, deposit as demand_deposit } from 'wowok/src/demand';
import { reward, launch as reward_launch, deposit as reward_deposit, claim } from 'wowok/src/reward';
import { repository, launch as repository_launch, Repository_Policy, add_data, Repository_Policy_Mode, Repository_Policy_Data, repository_add_policies} from 'wowok/src/repository'
import { stringToUint8Array } from 'wowok/src/util'
import { ADDR, SENDER_PRIV } from './common'


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

