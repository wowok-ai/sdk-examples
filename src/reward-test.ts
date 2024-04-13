import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SUI_TYPE, RewardObject, PassportObject} from 'wowok/src/protocol';
import { launch, reward, deposit, claim, reward_set_description, reward_add_guard, RewardGuardPortions, reward_lock_guards, reward_expand_time, allow_repeat_claim } from 'wowok/src/reward';
import { verify, passport_queries, destroy} from 'wowok/src/passport'

export const test_reward_launch = async (txb:TransactionBlock, param:any) => {
    let permission_id = param.get('permission::Permission')[0];
    let w = reward(SUI_TYPE, txb, permission_id, 'reward hhh', 10000) as RewardObject;
    deposit(SUI_TYPE, txb, w, [txb.splitCoins(txb.gas, [111]), txb.splitCoins(txb.gas, [222]), txb.splitCoins(txb.gas, [333])]);
    reward_set_description(SUI_TYPE, txb, w, permission_id, 'reward reward reward!');
    launch(SUI_TYPE, txb, w);
}

export const test_reward_claim = async (txb:TransactionBlock, param:any) => {
    let permission_id = param.get('permission::Permission')[0];
    let w = param.get('reward::Reward')[0];
    claim(SUI_TYPE, txb, w);

    let g1 : RewardGuardPortions = {guard: param.get('guard::Guard')[0], portions:2};
    let g2 : RewardGuardPortions = {guard: param.get('guard::Guard')[1], portions:1};
    reward_add_guard(SUI_TYPE, txb, w, permission_id, [ g1, g2 ])
    reward_expand_time(SUI_TYPE, txb, w, permission_id, 100000)
    reward_lock_guards(SUI_TYPE, txb, w, permission_id)

    
    let objects = await passport_queries([param.get('guard::Guard')[0]]);
    let passport = verify(txb, [param.get('guard::Guard')[0] as string], objects); // use guard0 for passport
    if (!passport) {
        console.log('passport error')
        return
    }
    allow_repeat_claim(SUI_TYPE, txb, w, permission_id, true);
    claim(SUI_TYPE, txb, w, passport as PassportObject);
    destroy(txb, passport as PassportObject) // destory passport while used
}