import { Protocol, ENTRYPOINT, TxbObject, RpcResultParser, GuardParser, Wowok, Machine_Node, Machine, Permission_Entity, 
    PermissionIndex, Permission, Service, Service_Sale, DicountDispatch, Service_Discount_Type, Service_Discount, Guard,
    GuardMaker, MODULES,
    ContextType,
    ValueType,
    OperatorType,
    Machine_Forward,
    Treasury,
    Demand,
    IsValidAddress, 
} from 'wowok';
import { TEST_PRIV, TEST_ADDR, TESTOR, sleep, PROTOCOL, PAY_TYPE } from './common'
import { TransactionResult } from '@mysten/sui/transactions';
import { ERROR, Errors } from 'wowok/src/exception';

// token for pay
const CUSTOMER_IDS = new Map<string, TxbObject[]>();

const permission = async (protocol:Protocol, param:any) => {
    Permission.New(protocol.sessionCurrent(), 'traveller permission').launch();
}

const demand = async (protocol:Protocol, param:any) => {
    const permission = param.get('permission::Permission')[0] ;
    const txb = protocol.sessionCurrent();
    // 3 days
    Demand.New(txb, PAY_TYPE, true, 259200000, permission, '', txb.splitCoins(txb.gas, [1000])).launch();
}

export const customer_yes = async (service_addr:string) => {
    if (!IsValidAddress(service_addr))  ERROR(Errors.IsValidAddress, 'demand.yes.service_addr');
    
    const permission = CUSTOMER_IDS.get('permission::Permission');
    const demand = CUSTOMER_IDS.get('demand::Demand');
    if (!permission || permission.length === 0) ERROR(Errors.Fail, 'demand.yes.permission');
    if (!demand || demand.length === 0) ERROR(Errors.Fail, 'demand.yes.demand');

    const txb = PROTOCOL.sessionCurrent();
    Demand.From(txb, PAY_TYPE, permission![0], demand![0]).yes(service_addr);
}

export const customer_demand = async () => {
    RpcResultParser.objectids_from_response(PROTOCOL, await PROTOCOL.sign_excute([permission], TEST_PRIV(), CUSTOMER_IDS), CUSTOMER_IDS);
    console.log('customer permission id: ' + CUSTOMER_IDS.get('permission::Permission'));  await sleep(2000);

    RpcResultParser.objectids_from_response(PROTOCOL, await PROTOCOL.sign_excute([demand], TEST_PRIV(), CUSTOMER_IDS), CUSTOMER_IDS);
    console.log('customer demand id: ' + CUSTOMER_IDS.get('permission::Permission'));  await sleep(2000);
}