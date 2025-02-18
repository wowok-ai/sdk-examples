import { CallDemand } from 'wowok_agent'
import { sleep, TEST_ADDR } from './common';
import { Account } from 'wowok_agent/src/account';

export const test_call = async () => {
    // await test_account()

    const d = new CallDemand('0x2::coin::Coin<0x2::sui::SUI>', 'new');
    d.guard = {address:'0x7333b947b1467dd43009077baa58154acf8fa8b139636ef0835cd17fdf057e84'};
    d.description = 'test sdk call';
    d.permission = '0x361ed0a9058a25d2b0a28c98066b2973a6329d54bb294d1e1eb8d6c0d1255f72'
    const call = await d.call();
    console.log(call ?? 'complete');
}

export const test_account= async () => {
    Account.Instance().gen('bb', true); await sleep(2000)
    Account.Instance().rename('bb', 'aa') ; await sleep(2000)
    Account.Instance().gen('cc', true) ; await sleep(2000)
    Account.Instance().rename('cc', 'aa', true) ;await sleep(2000)

}