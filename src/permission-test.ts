import { Permission_Entity, permission, add_entity, add_admin, set_guard, PermissionIndex,
    remove_entity, launch, remove_index} from 'wowok/src/permission';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { MachineObject, PermissionObject,  GuardObject, } from 'wowok/src/protocol';
import { TEST_ADDR, TEST_PRIV } from './common'

const permission_entity_1 : Permission_Entity = {
    entity_address: TEST_ADDR(),
    permissions: [{index:PermissionIndex.machine_add_node}, {index:PermissionIndex.machine}],
}
const permission_entity_2 : Permission_Entity = {
    entity_address: '0x07b1e78a99dcb13d2f1411cab294c8a54c44f03f7ab97b0a1bdecec99e1a186c',
    permissions: [{index:PermissionIndex.demand}, {index:PermissionIndex.machine},  
        {index:PermissionIndex.machine},  {index:PermissionIndex.vote_add_guard}],
}
const permission_entity_3 : Permission_Entity = {
    entity_address: '0xe8778267a777a5f4cc1df30c97fa788c5acb7905fab01e1a7429da622efe48a8',
    permissions: [{index:PermissionIndex.demand}, {index:PermissionIndex.machine}],
}


export const test_permission_launch = async(txb:TransactionBlock, param:any) => {
    let p = permission(txb, 'permission test');

    if (!p) {
        console.log('test_permission_launch error 1');
        return 
    }
    let perm_obj = p as PermissionObject;

    add_entity(txb, perm_obj, [permission_entity_1, permission_entity_2]);
    add_entity(txb, perm_obj, [permission_entity_3, permission_entity_2]);
    add_admin(txb, perm_obj, ['0x07b1e78a99dcb13d2f1411cab294c8a54c44f03f7ab97b0a1bdecec99e1a186c', 
        '0x3ce6931306dcfd4eb4be7013caa9077b1a8166b361c9f1e87057eab13bd1b34a']);
    remove_entity(txb, perm_obj, [permission_entity_3.entity_address]) // remove per3
    remove_index(txb, perm_obj, permission_entity_2.entity_address, 
        [permission_entity_2.permissions[0].index, permission_entity_2.permissions[1].index]) // remove per2 indexes
    launch(txb, perm_obj) 
}

export const test_permission_set_guard = async(txb:TransactionBlock, param:any) => {
    let p = txb.object(param.get('permission::Permission')[0] as string) as PermissionObject;
    let g1 = txb.object(param.get('guard::Guard')[0] as string) as GuardObject;
    let g2 = txb.object(param.get('guard::Guard')[1] as string) as GuardObject;

    if (!p || !g1 || !g2) {
        console.log('test_permission_set_guard error 1');
        return 
    }
    set_guard(txb, p, permission_entity_1.entity_address, permission_entity_1.permissions[0].index, g1); // set 
    set_guard(txb, p, permission_entity_1.entity_address, permission_entity_1.permissions[0].index);  // unset
    set_guard(txb, p, permission_entity_1.entity_address, permission_entity_1.permissions[0].index, g2);  // set
}