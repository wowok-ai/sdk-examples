import { OBJECT_QUERY, PERMISSION_QUERY, EVENT_QUERY, CacheType } from "wowok_agent"
import { MultiGetObjectsParams } from '@mysten/sui/client';
import { sleep } from "./common";
import { MemeryCache, WowokCache } from "wowok_agent";

export const test_agent_objects = async () => {
    WowokCache.Instance().set(new MemeryCache());

    while (true) {
        console.log(await OBJECT_QUERY.objects({objects:['0x2f8cc10e3b8392ef191490e66109be91b1e122e94a9d8f3b7f66bcaf56fd7399', 
            '0xabaf133dbe7a06d0434ef7b40e13823f9919315efcf235b684aa931b88079639', '0xfb45e0458c1f4ada0892f842a14febf0da19dd7852851292996c68ed5fb0e75e'
        ], showContent:true}));
        await sleep(2000)
    }
    //console.log(JSON.stringify(await OBJECT_QUERY.table({parent:'0x074b97f7fd056ebf464e167fca74185953e051db3a623b569aac6bdc62c655e4'})));
    //console.log(JSON.stringify(await EVENT_QUERY.newOrderEvents()));
    /*console.log(await OBJECT_QUERY.tableItem(OBJECT_QUERY.tableItemQuery_Repository(
        '0x074b97f7fd056ebf464e167fca74185953e051db3a623b569aac6bdc62c655e4', 
        '0x07b1e78a99dcb13d2f1411cab294c8a54c44f03f7ab97b0a1bdecec99e1a186c',
        '中国')));
    console.log(await OBJECT_QUERY.tableItem(OBJECT_QUERY.tableItemQuery_Permission(
        '0x74124ac3935a777584b17bfaa5e999df726c31c52fb60c4d70a551c8d8e13968', 
        '0xe386bb9e01b3528b75f3751ad8a1e418b207ad979fea364087deef5250a73d3f')));*/
}

const objects = async () => {
    console.log(await OBJECT_QUERY.objects({objects:['0xe1ca9f1379f4068c18c80fa999bb6784e0e7b81eb77001c06e279792f1d85b98', // guard
        '0xbd56b366c0953244ef6418a63096687450b855cd82b27806f9615efcc35350e5', // machine
        '0xbd8e5cd8739ba588f39bdba7a06b4732f2e63a2d4171989cfc09c6c6a4dcf66b', // arbitration
        '0xaa606726e84490c28b684e7954a221aeb0c034ae67cad0906a4e6a1d36969caf', // treasury
        '0x7a447aa6f23934bbb37d7457dcf724227d903121465cee6c8565120bb378c5f4', // permission
        '0x03b1e72cb3fded99161f478f094a208479edc62e29ed83e1902b87fc16ae2dba', // discount
        '0x6947bc5ae39d69d9c652acfc8ba8dcf74525713e28cadcec1a37da0fe0066f0d', // service
        '0xa62c737ae593abd27f690510827fef305bd036696b0abc52f546383281e84976', // order
        '0xfee0f03ebe4a0e6dfe6bf605c75136ff2f7c60ec42eaeb6ef9ad49e4c1e7c654', // arb
        '0xe68d7fa878eced7ae483532a064a9c0ad16a9babd33b7330177088167a3afdbf', // demand
        '0x272e6dd1d8c82b4ff6a4467579e77049505dd3d7f6e4031dbe3d663bd3a1fb02', // repository
        '0x27c3e6eb263af9bc23b4fa8fbb8cee895e6b4bffdc2ac90125647fee5b894454', // payment
        '0x7e2e8e3826a4f653496581da1806492f9734268445b404f3469c1505e44de3d2', // progress
    ], showContent:true, showOwner:true}));
}

const permissions = async () => {
    console.log(await PERMISSION_QUERY.permission({permission_object:'0x7a447aa6f23934bbb37d7457dcf724227d903121465cee6c8565120bb378c5f4',
        address:'0xbdc19ffb6e69c418816aabd8cc56ab2328035bedc91506a0e59beace2d992b62'
    }))
}
