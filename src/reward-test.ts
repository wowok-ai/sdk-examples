import { Protocol, RewardObject, PassportObject, RewardGuardPortions, Reward, Passport, GuardParser} from 'wowok';

export const test_reward_launch = async (protocol:Protocol, param:any) => {
    let permission_id = param.get('permission::Permission')[0];
    let reward = Reward.New(protocol, Protocol.SUI_COIN_TYPE, permission_id, 'reward hhh', 10000);
    let txb = protocol.CurrentSession();
    reward.deposit([txb.splitCoins(txb.gas, [111]), txb.splitCoins(txb.gas, [222]), 
        txb.splitCoins(txb.gas, [333]),  txb.splitCoins(txb.gas, [444]),]);
    reward.set_description('reward reward reward!');
    reward.launch();
}

export const test_reward_claim = async (protocol:Protocol, param:any) => {
    let permission_id = param.get('permission::Permission')[0] ;
    let r = param.get('reward::Reward')[0] ;
    let guard1 = param.get('guard::Guard')[0] ;
    let guard2 = param.get('guard::Guard')[1] ;
    let reward = Reward.From(protocol, Protocol.SUI_COIN_TYPE, permission_id, r);
    reward.claim();

    let g1 : RewardGuardPortions = {guard: guard1 as string, portions:2};
    let g2 : RewardGuardPortions = {guard: guard2 as string, portions:1};
    reward.add_guard([ g1, g2 ])
    reward.expand_time(100000)
    reward.lock_guards()
    reward.allow_repeat_claim(true);

    let parser = await GuardParser.CreateAsync(protocol, [guard2]);
    parser.guardlist().forEach(e => {
        console.log(e.futrue_list)
        console.log(e.query_list)
    });

    let query = await parser.done();

    let passport = new Passport(protocol, [guard2], query); // use guard0 for passport
    reward.claim(passport.get_object());
    passport.freeze() // destory or freeze passport while used
}