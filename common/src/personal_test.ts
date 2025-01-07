import { Demand, DemandObject, Entity, Protocol, Resource, Entity_Info} from 'wowok';
import { ERROR, Errors } from 'wowok/src/exception';

export const create_my_resource = (protocol:Protocol) => {
    let wowok_entity =  Entity.From(protocol.CurrentSession());
    wowok_entity.create_resource();
}

export const manage_my_resource =  (protocol:Protocol, param:any) => {
    let res_id = param.get('resource::Resource')[0];
    if (!res_id) ERROR(Errors.InvalidParam, 'manage_my_resource');

    let resource = Resource.From(protocol.CurrentSession(), res_id);
    // add some to my resource
    resource.add('my collection 1',  [res_id]);
    resource.add('my collection 1',  ['0xb31312cabe21e089dcd640fab507e133029528fcbbedfb34b91f849a4dd1383c',
        '0x0b228d3994b147b82f970c399d3c96001442d5cc88bf073617b0957f6d421f09',
        '0x0b228d3994b147b82f970c399d3c96001442d5cc88bf073617b0957f6d421f09'
    ]);
    resource.add('my collection 2',  ['0xb31312cabe21e089dcd640fab507e133029528fcbbedfb34b91f849a4dd1383c',
        '0x0b228d3994b147b82f970c399d3c96001442d5cc88bf073617b0957f6d421f08',
    ]);
    resource.add('my collection 3',  ['0x0b228d3994b147b82f970c399d3c96001442d5cc88bf073617b0957f6d421f09']);
    resource.remove('my collection 2', ['0x0b228d3994b147b82f970c399d3c96001442d5cc88bf073617b0957f6d421f09']);
    resource.remove('my collection 3', [], true);
    resource.rename('my collection 2', 'my collection 5');

    resource.add_tags(res_id, 'i like it.......................', ['a', 'b', 'abc']);
    resource.add_tags('0xb31312cabe21e089dcd640fab507e133029528fcbbedfb34b91f849a4dd1383c', 'i dislike it.......................', ['a', 'b']);
    resource.remove_tags('0xb31312cabe21e089dcd640fab507e133029528fcbbedfb34b91f849a4dd1383c');
}

export const like = (protocol:Protocol, param: any) => {
    let res_id = param.get('resource::Resource')[0];
    if (!res_id) ERROR(Errors.InvalidParam, 'like');

    let resource = Resource.From(protocol.CurrentSession(), res_id);
    let wowok_entity =  Entity.From(protocol.CurrentSession());
    wowok_entity.mark(resource, res_id, 'like'); // like
    wowok_entity.mark(resource, res_id, 'like'); // unlike

    wowok_entity.mark(resource, '0xb31312cabe21e089dcd640fab507e133029528fcbbedfb34b91f849a4dd1383c', 'like'); // like
    wowok_entity.mark(resource, '0x0b228d3994b147b82f970c399d3c96001442d5cc88bf073617b0957f6d421f09', 'like');
    wowok_entity.mark(resource, res_id, 'dislike'); // dislike
}

export const avatar = (protocol:Protocol, param: any) => {
    let wowok_entity =  Entity.From(protocol.CurrentSession());
/*    let personal:Entity_Info = {name:'Jack Chou', description:'hahah', avatar:'https://wowok.ai/0x123.png', twitter:'@Wowok_Ai',
        discord:'https://discord.gg/JbYneRzB8a', homepage:'https://github.com/wowok-ai/sdk/wiki'}*/
    let personal = {name:'hi'}
    wowok_entity.update(personal);
}

export const transfer_resource = (protocol:Protocol, param: any) => {
    let res_id = '';
    if (typeof(param) === 'string') {
        res_id = param as string;
    } else {
        res_id = param.get('resource::Resource')[0];
    }
    if (!res_id) ERROR(Errors.InvalidParam, 'transfer_resource');

    let resource = Resource.From(protocol.CurrentSession(), res_id);
    let wowok_entity =  Entity.From(protocol.CurrentSession());

    // transfer_resource param2 must has resource yet
    wowok_entity.transfer_resource(resource, '0x227b5c82e1e0bae176720fa8803e8c87cb3f8defa6d51150b2388a3270ff1f49');
}

export const destroy_resource = (protocol:Protocol, param: any) => {
    let res_id = '';
    if (typeof(param) === 'string') {
        res_id = param as string;
    } else {
        res_id = param.get('resource::Resource')[0];
    }
    if (!res_id) ERROR(Errors.InvalidParam, 'destroy_resource');

    let resource = Resource.From(protocol.CurrentSession(), res_id);
    let wowok_entity =  Entity.From(protocol.CurrentSession());
    wowok_entity.destroy_resource(resource);
}
