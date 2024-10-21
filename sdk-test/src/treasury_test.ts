
import { Protocol, PermissionObject, TxbObject, Treasury} from 'wowok';
import { TEST_ADDR } from './common'

export const test_treasury_launch = async(protocol:Protocol, param:any) => {
    const permission = param.get('permission::Permission')[0] ;
    if (!permission) {
        console.log('test_treasury_launch param error')
        return ;
    }

    const treasury = Treasury.New(protocol.CurrentSession(), Protocol.SUI_TOKEN_TYPE, permission, 'test treasury', true) ;
    const txb = protocol.CurrentSession();

    treasury.deposit(txb.splitCoins(txb.gas, [txb.pure.u64(10000)]), 'deposit.........................', permission, BigInt(1));
    txb.transferObjects([treasury.withdraw(BigInt(200), 'withdraw.........................................', undefined, BigInt(2), permission)], TEST_ADDR());
    treasury.launch()
}