
import { call_object, CallDemand_Data, CallGuard_Data, CallPermission_Data, CallTreasury_Data, ResponseData } from 'wowok_agent'
import { sleep } from './common';
import { Account } from 'wowok_agent/src/account';
import { CallResponse, OperatorType, Protocol, ValueType } from '../../../wowok/src';

export const airdrop = async () => {
    var res: any; 
    var permission_id: string | undefined;

    // new permission
    const permission : CallPermission_Data = {};
    res = await call_object({type:'Permission', data:permission});
    if (res?.digest) {
        const r = ResponseData(res as CallResponse);
        if (r) {
            console.log(r);
            permission_id = r.find(v => v.type === 'Permission')?.object;
        }
    }

    // treasury
    var desp = 'This airdrop treasury adds three withdrawal guards to define claiming operation criteria:\n';
    desp += 'Guard 1. Freshman who have never claimed can claim 300 at a time; \n';
    desp += 'Guard 2. Everyone can claim 100 for every more than 1 day; \n';
    desp += 'Guard 3. Everyone can claim 200 for every more than 1 day, if claimed already more than 10 times.'
    const treasury : CallTreasury_Data = { description: desp, 
        type_parameter: Protocol.SUI_TOKEN_TYPE, 
        permission:permission_id,

    }
}
/*
const treasury = async () => {
    const treasury = param.get('treasury::Treasury')[0] ;
    const permission = param.get('permission::Permission')[0] ;
    const guards = param.get('guard::Guard');
    const tr = Treasury.From(protocol.sessionCurrent(), Protocol.SUI_TOKEN_TYPE, permission, treasury);
    guards.forEach((v:string, index:number) => {
        tr.add_withdraw_guard(v, BigInt(100*(index+1)));
    });
    tr.set_withdraw_mode(Treasury_WithdrawMode.GUARD_ONLY_AND_IMMUTABLE);
    var desp = 'This airdrop treasury adds three withdrawal guards to define claiming operation criteria:\n';
    desp += 'Guard 1. Freshman who have never claimed can claim 300 at a time; \n';
    desp += 'Guard 2. Everyone can claim 100 for every more than 1 day; \n';
    desp += 'Guard 3. Everyone can claim 200 for every more than 1 day, if claimed already more than 10 times.'
    tr.set_description(desp);
}

export const day_guard = async () => {
    const data : CallGuard_Data = {description:desp, table:[
        {identifier:1, bWitness:true, value_type:ValueType.TYPE_STRING}
    ], root: {logic:OperatorType.TYPE_LOGIC_EQUAL, parameters:[
            {value_type:ValueType.TYPE_STRING, value:'aa'},
            {identifier:1}
        ]}
    }
    const r = await call_object({data:data, type:'Guard'})
    if ((r as any)?.digest) {
        console.log(ResponseData(r as CallResponse))
    }
}*/