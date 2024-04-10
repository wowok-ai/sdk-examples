import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SUI_TYPE, DemandObject} from 'wowok/src/protocol';
import { launch, demand, deposit, present, demand_yes, demand_set_description } from 'wowok/src/demand';
import { SERVICE_PAY_TYPE } from './service-test'

export const test_demand_launch = async (txb:TransactionBlock, param:any) => {
    let permission_id = param.get('permission::Permission')[0];
    let d = demand(SUI_TYPE, txb, permission_id, 'demand TEST', txb.splitCoins(txb.gas, [10000000])) as DemandObject;
    deposit(SUI_TYPE, txb, d, txb.splitCoins(txb.gas,[200000]));
    launch(SUI_TYPE, txb, d);
}

export const test_demand_yes = async (txb:TransactionBlock, param:any) => {
    let perm = param.get('permission::Permission')[0];
    let service1 = param.get('service::Service')[0];
    let service2 = param.get('service::Service')[1];
    let d = param.get('demand::Demand')[0];

    present(SUI_TYPE, SERVICE_PAY_TYPE, txb, d, service1, 'hello, service here');
    present(SUI_TYPE, SERVICE_PAY_TYPE, txb, d, service2, 'SERVICE 2');
    demand_set_description(SUI_TYPE, txb, d, perm, 'i wanna time time time...');
    demand_yes(SUI_TYPE, txb, d, perm, service2);
}