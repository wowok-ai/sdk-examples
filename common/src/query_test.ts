import { OBJECT_QUERY, PERMISSION_QUERY, ENTITY_QUERY } from "wowok"
import { MultiGetObjectsParams } from '@mysten/sui/client';

export const test_agent_objects = async () => {
    console.log(JSON.stringify(await OBJECT_QUERY.objects({objects:[
        '0x530ad97f7c559b9eaf2b74b1251ce6052686a5e0a334ab8be1313fcba93e5901',
        /*'0x1ea2ed93e8ff70404a5967dc9e7493985754487ce79b64533698efb46893a074',
        '0xe82f30fd320f7c7b200531f55d35189cdccdd6aaccd7de140fb7fae148302bf7',
        '0x282dba46e0e22dc1be637aaad90d7efd431d16ea9883adcdff9dc14f597a90cc'
        '0x3f040796846f562841dd15c78b4bb93bfa69264f758f34036d3bb676687c1c01'*/], 
        showContent:true, showOwner:true, showType:true})));
    //await objects();
    //await permissions();
    //await entity();
    /*console.log(await ObjectQuery.table_json(JSON.stringify({parent:'0xbfae0980178609bfb148e1ef38ce4f50c99eae7e038293a485275974e9a15947'})));
    console.log(await ObjectQuery.tableItem({parent:'0xbfae0980178609bfb148e1ef38ce4f50c99eae7e038293a485275974e9a15947',
        name:{type:'address', value:'0xb74463d6ab71f98e3637506030592eb23cf03ebef30ee6fc2446e4517e6535d3'}
    }));*/
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
export const entity  = async () => {
    console.log(await ENTITY_QUERY.entity_json(JSON.stringify({address:'0xe386bb9e01b3528b75f3751ad8a1e418b207ad979fea364087deef5250a73d3f', 
        showMarks:true, showTags:true})))
}