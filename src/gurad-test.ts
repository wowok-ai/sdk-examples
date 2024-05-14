import { GuardInputMaker, Guard_Creation, Guard, MODULES, OperatorType, Protocol, GuardVariableMaker,
    Passport, ValueType, VariableType, ContextType, GuardParser, GuardObject} from 'wowok';
import { graphql_object, graphql_objects } from './graphql_query';

export const test_guard_launch_creator_equal = async(protocol:Protocol, param:any) => {
    let permission_id1 = param.get('permission::Permission')[0];
    let permission_id2 = param.get('permission::Permission')[1];

    let maker = new GuardInputMaker();
    maker.add_query(MODULES.permission, 'builder', permission_id1); // permission1 builder
    maker.add_query(MODULES.permission, 'builder', permission_id2); // permission2 builder
    maker.add_logic(OperatorType.TYPE_LOGIC_OPERATOR_EQUAL); // equal

    const sense1 = maker.make() ;
    let guard_creation1:Guard_Creation = {
        description: 'two permissions\' creator equal',
        input: sense1,
    };
    Guard.launch(protocol, guard_creation1); // guard1
}

export const test_guard_launch_signer = async(protocol:Protocol, param:any) => {
    Guard.signer_guard(protocol)
}

export const test_guard_launch_everyone = async(protocol:Protocol, param:any) => {
    Guard.everyone_guard(protocol)
}

export const test_guard_launch_substring = async(protocol:Protocol, param:any) => {
    let maker = new GuardInputMaker();
    maker.add_param(ValueType.TYPE_STATIC_vec_u8, "i love WOWOK"); 
    maker.add_param(ValueType.TYPE_STATIC_vec_u8, "WOWOK"); 
    maker.add_logic(OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING); // substring
    const sense1 = maker.make() ;
    let guard_creation1:Guard_Creation = {
        description: 'sub string',
        input: sense1
    };
    Guard.launch(protocol, guard_creation1)
}

export const test_guard_future_object = async(protocol:Protocol, param:any) => {
    let permission =  param.get('permission::Permission') ? param.get('permission::Permission')[0] : undefined;
    let machine = param.get('machine::Machine')? param.get('machine::Machine')[0] : undefined;
    if (!machine || !permission) {
        console.log('test_future_object machine undefined');
        return 
    }

    let maker = new GuardInputMaker();
    let variable : VariableType = new Map();
    GuardVariableMaker.add_future_variable(variable, 0, OperatorType.TYPE_FUTURE_QUERY, machine);
    maker.add_future_query(0, MODULES.progress, 'has_parent', variable);

    const sense = maker.make() ;
    if (!sense) {
        console.log('test_future_object sense undifined')
        return 
    }

    let maker2 = new GuardInputMaker();
    GuardVariableMaker.add_future_variable(variable, 1, ContextType.TYPE_CONTEXT_FUTURE_ID, machine);
    maker2.add_param(ContextType.TYPE_CONTEXT_FUTURE_ID, 1, variable); // from variable: identifier 1
    maker2.add_query(MODULES.permission, 'builder', permission);
    maker2.add_logic(OperatorType.TYPE_LOGIC_OPERATOR_EQUAL); // machine's  futrue progress-id equals permission's builder[always false]
    const sense2 = maker2.make(true); // CHECK: !(machine object's progress id == permission object's builder)
    if (!sense2) {
        console.log('test_future_object sense2 undifined')
        return 
    }

    let guard_creation1:Guard_Creation = {
        description: 'future progress has parent?',
        variables: variable, // must include variables for guard
        input: GuardInputMaker.combine(sense, sense2, false) // true
    };

    // launch 2 guards
    Guard.launch(protocol, guard_creation1)
    Guard.launch(protocol, guard_creation1)
}

export const test_guard_passport = async(protocol:Protocol, param:any) => {
    let g1 = param.get('guard::Guard')?  param.get('guard::Guard')[0] : undefined;
    let g2 = param.get('guard::Guard')?  param.get('guard::Guard')[1] : undefined;

    let progress = param.get('progress::Progress')?  param.get('progress::Progress')[0] : undefined;
    if (!g1 || !g2  || !progress) {
        console.log('test_guard_passport guard undefined')
        return 
    }
    // MUST declare guard1 & guard2 above queries! SUI BUG.
    let guard1 = protocol.CurrentSession().object(g1) as GuardObject;
    let guard2 = protocol.CurrentSession().object(g2) as GuardObject;

    let parser = await GuardParser.CreateAsync(protocol, [g1, g2]);
    parser.guardlist().forEach(g => {
        console.log(g.futrue_list)
        console.log(g.query_list)
        // hardcode here: see g1, g2 rules
        g.futrue_list.forEach((f => {
            f.futrue  = progress;
        }))
    });

    let query = await parser.done();
    protocol.CurrentSession().setGasBudget(500000000); // must increase gas budget: 1 SUI
    let passport = new Passport(protocol, [guard1, guard2], query)
    passport.freeze()
}

export const test_guard_launch_number = async(protocol:Protocol, param:any) => {
    let permission_id1 = param.get('permission::Permission')[0];
    let maker = new GuardInputMaker();
    maker.add_query(MODULES.permission, 'entity_count', permission_id1); // entity address count
    maker.add_param(ValueType.TYPE_STATIC_u64, 2); 
    maker.add_logic(OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER); // less than 2
    const sense1 = maker.make();
    let guard_creation1:Guard_Creation = {
        description: 'entity adress count > 2',
        input: sense1
    };
    Guard.launch(protocol, guard_creation1)
}

export const test_guard_launch_permission_builder = async(protocol:Protocol, param:any) => {
    let permission_id = param.get('permission::Permission')[0];

    let maker = new GuardInputMaker();
    maker.add_query(MODULES.permission, 'builder', permission_id); // permission builder address
    maker.add_param(ContextType.TYPE_CONTEXT_SIGNER); // signer
    maker.add_logic(OperatorType.TYPE_LOGIC_OPERATOR_EQUAL);
    const sense1 = maker.make(true);
    let guard_creation1:Guard_Creation = {
        description: 'permission builder address equals singer address',
        input: sense1
    };
    Guard.launch(protocol, guard_creation1);
}

export const test_context_launch_creator_equal = async (protocol:Protocol, param:any) => {
    let permission_id1 = param.get('permission::Permission')[0];
    let permission_id2 = param.get('permission::Permission')[1];
    
    let variables:VariableType = new Map();
    GuardVariableMaker.add_variable(variables, 0, OperatorType.TYPE_QUERY_FROM_CONTEXT, permission_id1); // query_from_context, NOT TYPE_CONTEXT_address
    GuardVariableMaker.add_variable(variables, 1, OperatorType.TYPE_QUERY_FROM_CONTEXT, permission_id2);

    let maker = new GuardInputMaker();
    maker.add_query(MODULES.permission, 'builder', 0); // permission1 builder
    maker.add_query(MODULES.permission, 'builder', 1); // permission2 builder
    maker.add_logic(OperatorType.TYPE_LOGIC_OPERATOR_EQUAL); // equal

    const sense1 = maker.make() ;
    let guard_creation1:Guard_Creation = {
        description: 'two permissions\' creator equal',
        variables:variables,
        input: GuardInputMaker.combine(sense1, sense1, false)
    };
    Guard.launch(protocol, guard_creation1); // guard1
}

export const test_guard_graphql_senses_objects = async (protocol:Protocol, guards:string[]) : Promise<string[]>=> {
    let res = await graphql_objects(guards);
    
    let arr : string[] = [];
    res.data.objects.nodes.forEach((n: any) => {
        // arr = arr.concat(parse_graphql_senses(n.asMoveObject.contents.json.senses));
    }); 
    return arr
}