import { Protocol, PassportObject, WithholdingGuardPortions, Withholding, Passport, GuardParser} from 'wowok';

export const test_withholding_launch = async (protocol:Protocol, param:any) => {
    let permission_id = param.get('permission::Permission')[0];
    let withholding = Withholding.New(protocol.CurrentSession(), Protocol.SUI_COIN_TYPE, permission_id, 'withholding hhh', true, 10000000000);
    let txb = protocol.CurrentSession();
    withholding.deposit([txb.splitCoins(txb.gas, [111]), txb.splitCoins(txb.gas, [222]), 
        txb.splitCoins(txb.gas, [333]),  txb.splitCoins(txb.gas, [444]),]);
    withholding.set_description('withholding withholding withholding!');
    withholding.allow_claim(true);
    withholding.launch();
}

export const test_withholding_claim = async (protocol:Protocol, param:any) => {
    let permission_id = param.get('permission::Permission')[0] ;
    let r = param.get('withholding::Withholding')[0] ;
    let guard1 = param.get('guard::Guard')[0] ;
    let guard2 = param.get('guard::Guard')[1] ;
    let withholding = Withholding.From(protocol.CurrentSession(), Protocol.SUI_COIN_TYPE, permission_id, r);
    withholding.claim();

    let g1 : WithholdingGuardPortions = {guard: guard1 as string, portions:2};
    let g2 : WithholdingGuardPortions = {guard: guard2 as string, portions:1};
    withholding.add_guard([ g1, g2 ])
    withholding.expand_time(true, 10000000000)
    withholding.lock_guards()
    withholding.allow_repeat_claim(true);

    let parser = await GuardParser.Create([guard1]);

    if (!parser) {
        console.log('test_withholding_claim parser null');
        return 
    }

    let query = await parser!.done();
    console.log(query)
    if (!query) {
        console.log('test_withholding_claim query null');
        return 
    }

    // protocol.CurrentSession().setGasBudget(500000000); // increase gas budget
    let passport = new Passport(protocol.CurrentSession(), query, true); // use guard0 for passport
    withholding.claim(passport.get_object());
    passport.freeze() // destory or freeze passport while used
}