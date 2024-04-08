import { TransactionBlock } from '@mysten/sui.js/transactions';
import { MachineObject, PermissionObject, GuardObject, RepositoryObject, ValueType, SUI_TYPE, RewardObject} from 'wowok/src/protocol';
import { ADDR } from './common'
import { launch, reward, deposit, claim, reward_set_description, reward_add_guard, RewardGuardPortions, reward_lock_guards, reward_expand_time } from 'wowok/src/reward';
import { stringToUint8Array, numToUint8Array } from 'wowok/src/util'
import { signer_guard } from 'wowok/src/guard';
import { verify, } from 'wowok/src/passport'

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
    let g2 : RewardGuardPortions = {guard: param.get('guard::Guard')[2], portions:100};
    reward_add_guard(SUI_TYPE, txb, w, permission_id, [ g1, g2 ])
    reward_expand_time(SUI_TYPE, txb, w, permission_id, 100)
    reward_lock_guards(SUI_TYPE, txb, w, permission_id)
    // claim(SUI_TYPE, txb, w); // claim with passport!
}