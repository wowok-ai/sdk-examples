import { launch_guard, CallBase, CallDemand, GuardData, ResponseData } from 'wowok_agent'
import { sleep } from './common';
import { Account } from 'wowok_agent/src/account';
import { OperatorType, ValueType } from '../../../wowok/src';

export const test_call = async () => {
    //await test_account()
    await guard()
}

export const account = async () => {
    Account.Instance().gen('bb', true); await sleep(2000)
    Account.Instance().rename('bb', 'aa') ; await sleep(2000)
    Account.Instance().gen('cc', true) ; await sleep(2000)
    Account.Instance().rename('cc', 'aa', true) ;await sleep(2000)
    console.log(Account.Instance().list())
    console.log(Account.Instance().get_pair('aa'))
}

export const guard = async () => {
    const data : GuardData = {description:'launch a guard', table:[
        {identifier:1, bWitness:true, value_type:ValueType.TYPE_STRING}
    ], root: {logic:OperatorType.TYPE_LOGIC_EQUAL, parameters:[
            {value_type:ValueType.TYPE_STRING, value:'aa'},
            {identifier:1}
        ]}
    }

    console.log(ResponseData(await launch_guard(data)));
}

export const demand = async () => {
    Account.Instance().faucet();
    console.log(Account.Instance().list());
    const d = new CallDemand('0x2::coin::Coin<0x2::sui::SUI>', 'new');
    d.guard = {address:'0x7333b947b1467dd43009077baa58154acf8fa8b139636ef0835cd17fdf057e84'};
    d.description = 'test sdk call';
    //d.permission = '0x361ed0a9058a25d2b0a28c98066b2973a6329d54bb294d1e1eb8d6c0d1255f72'
    const r = await d.call();
    if (!Array.isArray(r) && r)  {
       console.log(ResponseData(r)) 
    } 
    await sleep(5000)
}