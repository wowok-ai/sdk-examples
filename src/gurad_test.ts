import { GuardMaker, Guard, MODULES, OperatorType, Protocol,
    Passport, ValueType, ConstantType, ContextType, GuardParser, GuardObject} from 'wowok';
import { graphql_object, graphql_objects } from './graphql_query';

export const test_guard_launch_creator_equal = async(protocol:Protocol, param:any) => {
    let permission_id1 = param.get('permission::Permission')[0];
    let permission_id2 = param.get('permission::Permission')[1];

    let maker = new GuardMaker();
    maker.add_query(MODULES.permission, 'builder', permission_id1); // permission1 builder
    maker.add_query(MODULES.permission, 'builder', permission_id2); // permission2 builder
    maker.add_logic(OperatorType.TYPE_LOGIC_EQUAL); // equal

    const sense1 = maker.build() ;
    Guard.launch(protocol, 'two permissions\' creator equal', sense1); // guard1
}

export const test_guard_launch_signer = async(protocol:Protocol, param:any) => {
    Guard.signer_guard(protocol)
}

export const test_guard_launch_everyone = async(protocol:Protocol, param:any) => {
    Guard.everyone_guard(protocol)
}

export const test_guard_launch_substring = async(protocol:Protocol, param:any) => {
    let maker = new GuardMaker();
    maker.add_param(ValueType.TYPE_VEC_U8, "i love WOWOK"); 
    maker.add_param(ValueType.TYPE_VEC_U8, "WOWOK"); 
    maker.add_logic(OperatorType.TYPE_LOGIC_HAS_SUBSTRING); // substring
    const sense1 = maker.build() ;
    Guard.launch(protocol, 'sub string', sense1)
}

export const test_guard_future_object = async(protocol:Protocol, param:any) => {
    let permission =  param.get('permission::Permission') ? param.get('permission::Permission')[0] : undefined;
    let machine = param.get('machine::Machine')? param.get('machine::Machine')[0] : undefined;
    if (!machine || !permission) {
        console.log('test_future_object machine undefined');
        return 
    }

    let maker = new GuardMaker();
    let identifer = maker.add_constant(ContextType.TYPE_WITNESS_ID, machine);
    maker = maker.add_query(MODULES.progress, 'has_parent', identifer, true)
                .build(true);// BE FALSE

    let maker2 = new GuardMaker();
    identifer = maker2.add_constant(ContextType.TYPE_WITNESS_ID, machine);
    maker2 = maker2.add_param(ContextType.TYPE_CONSTANT, identifer)
            .add_query(MODULES.permission, 'builder', permission)
            .add_logic(OperatorType.TYPE_LOGIC_EQUAL) // machine's  futrue progress-id equals permission's builder[always false]4
            .build(); // BE TRUE: !(machine object's progress id == permission object's builder)

    // launch 2 guards
    Guard.launch(protocol, 'future progress has parent?', maker) // BE FALSE
    Guard.launch(protocol, 'future progress has parent? OR !(machine object\'s progress id == permission object\'s builder)', 
        maker.combine(maker2, false)) // BE TRUE: sense(FALSE) or sense2(TRUE)
}

export const test_guard_to_object = async (protocol:Protocol, param:any) =>  {
    let g1 = param.get('guard::Guard')?  param.get('guard::Guard')[0] : undefined;
    let g2 = param.get('guard::Guard')?  param.get('guard::Guard')[1] : undefined;

    if (g1) {
        let r = await GuardParser.DeGuardObject(protocol, g1);
        console.log(JSON.stringify(r.object, null , 2));
        console.log(r.constant);
    }
    if (g2) {
        let r = await GuardParser.DeGuardObject(protocol, g2);
        console.log(JSON.stringify(r.object, null , 2));
        console.log(r.constant);
    }
}

export const test_guard_passport = async(protocol:Protocol, param:any) => {
    let g1 = param.get('guard::Guard')?  param.get('guard::Guard')[0] : undefined;
    let g2 = param.get('guard::Guard')?  param.get('guard::Guard')[1] : undefined;

    let progress = param.get('progress::Progress')?  param.get('progress::Progress')[0] : undefined;
    if (!g1 || !g2  || !progress) {
        console.log('test_guard_passport guard undefined')
        return 
    }

    let parser = await GuardParser.CreateAsync(protocol, [g1, g2]);
    parser.guardlist().forEach(g => {
        // hardcode here: see guard rules
        g.input_witness.forEach((f => {f.future  = progress; }))
        g.query_list.forEach((f => { 
            if (typeof(f) !== 'string') {
                f.future = progress;
        }}));

        g.constant.forEach((f => {f.future  = progress; }))
    });

    let query = await parser.done();
    protocol.CurrentSession().setGasBudget(500000000); // increase gas budget
    let passport = new Passport(protocol, query)
    passport.freeze()
}

export const test_guard_launch_number = async(protocol:Protocol, param:any) => {
    let permission_id1 = param.get('permission::Permission')[0];
    let maker = new GuardMaker();
    maker.add_query(MODULES.permission, 'entity_count', permission_id1); // entity address count
    maker.add_param(ValueType.TYPE_U64, 2); 
    maker.add_logic(OperatorType.TYPE_LOGIC_AS_U256_GREATER); // GREATER than 2
    const sense1 = maker.build();
    Guard.launch(protocol, 'entity adress count > 2', sense1);
}

export const test_guard_launch_permission_builder = async(protocol:Protocol, param:any) => {
    let permission_id = param.get('permission::Permission')[0];

    let maker = new GuardMaker();
    maker.add_query(MODULES.permission, 'builder', permission_id); // permission builder address
    maker.add_param(ContextType.TYPE_SIGNER); // signer
    maker.add_logic(OperatorType.TYPE_LOGIC_EQUAL); // SINGER MUST BE perssion_id's builder
    const sense1 = maker.build();
    Guard.launch(protocol, 'permission builder address equals singer address', sense1);
}

export const test_constant_launch_creator_equal = async (protocol:Protocol, param:any) => {
    let permission_id1 = param.get('permission::Permission')[0];
    let permission_id2 = param.get('permission::Permission')[1];

    let maker = new GuardMaker();
    let id1 = maker.add_constant(ValueType.TYPE_ADDRESS, permission_id1);
    let id2 = maker.add_constant(ValueType.TYPE_ADDRESS, permission_id2);
    maker.add_query(MODULES.permission, 'builder', id1); // permission1 builder
    maker.add_query(MODULES.permission, 'builder', id2); // permission2 builder
    maker.add_logic(OperatorType.TYPE_LOGIC_EQUAL); // BE TRUE: equal

    let sense1 = maker.build(true) ; // BE FALSE: !(permission1 builder == permission2 builder)
    Guard.launch(protocol, 'two permissions\' creator NOT equal', sense1.combine(sense1, true, true)); // BE FALSE: sense1 and sense1
}
