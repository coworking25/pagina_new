-- Actualizar las rutas de imágenes para usar el nuevo bucket property-images
-- Este script limpia las rutas y las ajusta para el nuevo bucket
-- Total de imágenes: 274 distribuidas en 20 propiedades

UPDATE properties SET images = jsonb_build_array(
    'CA-001/CA-001-(1).jpeg', 'CA-001/CA-001-(2).jpeg', 'CA-001/CA-001-(3).jpeg', 
    'CA-001/CA-001-(4).jpeg', 'CA-001/CA-001-(5).jpeg', 'CA-001/CA-001-(6).jpeg', 
    'CA-001/CA-001-(7).jpeg', 'CA-001/CA-001-(8).jpeg', 'CA-001/CA-001-(9).jpeg', 
    'CA-001/CA-001-(10).jpeg', 'CA-001/CA-001-(11).jpeg', 'CA-001/CA-001-(12).jpeg', 
    'CA-001/CA-001-(13).jpeg', 'CA-001/CA-001-(14).jpeg', 'CA-001/CA-001-(15).jpeg',
    'CA-001/CA-001-(16).jpeg', 'CA-001/CA-001-(17).jpeg', 'CA-001/CA-001-(18).jpeg'
) WHERE code = 'CA-001';

UPDATE properties SET images = jsonb_build_array(
    'CA-002/CA-002-(1).jpeg', 'CA-002/CA-002-(2).jpeg', 'CA-002/CA-002-(3).jpeg', 
    'CA-002/CA-002-(4).jpeg', 'CA-002/CA-002-(5).jpeg', 'CA-002/CA-002-(6).jpeg', 
    'CA-002/CA-002-(7).jpeg', 'CA-002/CA-002-(8).jpeg', 'CA-002/CA-002-(9).jpeg', 
    'CA-002/CA-002-(10).jpeg', 'CA-002/CA-002-(11).jpeg', 'CA-002/CA-002-(12).jpeg', 
    'CA-002/CA-002-(13).jpeg', 'CA-002/CA-002-(14).jpeg'
) WHERE code = 'CA-002';

UPDATE properties SET images = jsonb_build_array(
    'CA-003/CA-003-(1).jpeg', 'CA-003/CA-003-(2).jpeg', 'CA-003/CA-003-(3).jpeg', 
    'CA-003/CA-003-(4).jpeg', 'CA-003/CA-003-(5).jpeg', 'CA-003/CA-003-(6).jpeg', 
    'CA-003/CA-003-(7).jpeg', 'CA-003/CA-003-(8).jpeg', 'CA-003/CA-003-(9).jpeg', 
    'CA-003/CA-003-(10).jpeg', 'CA-003/CA-003-(11).jpeg', 'CA-003/CA-003-(12).jpeg', 
    'CA-003/CA-003-(13).jpeg', 'CA-003/CA-003-(14).jpeg', 'CA-003/CA-003-(15).jpeg'
) WHERE code = 'CA-003';

UPDATE properties SET images = jsonb_build_array(
    'CA-004/CA-004-(1).jpeg', 'CA-004/CA-004-(2).jpeg', 'CA-004/CA-004-(3).jpeg', 
    'CA-004/CA-004-(4).jpeg', 'CA-004/CA-004-(5).jpeg', 'CA-004/CA-004-(6).jpeg', 
    'CA-004/CA-004-(7).jpeg', 'CA-004/CA-004-(8).jpeg', 'CA-004/CA-004-(9).jpeg', 
    'CA-004/CA-004-(10).jpeg', 'CA-004/CA-004-(11).jpeg', 'CA-004/CA-004-(12).jpeg', 
    'CA-004/CA-004-(13).jpeg'
) WHERE code = 'CA-004';

UPDATE properties SET images = jsonb_build_array(
    'CA-005/CA-005-(1).jpeg', 'CA-005/CA-005-(2).jpeg', 'CA-005/CA-005-(3).jpeg', 
    'CA-005/CA-005-(4).jpeg', 'CA-005/CA-005-(5).jpeg', 'CA-005/CA-005-(6).jpeg', 
    'CA-005/CA-005-(7).jpeg', 'CA-005/CA-005-(8).jpeg', 'CA-005/CA-005-(9).jpeg', 
    'CA-005/CA-005-(10).jpeg', 'CA-005/CA-005-(11).jpeg', 'CA-005/CA-005-(12).jpeg', 
    'CA-005/CA-005-(13).jpeg', 'CA-005/CA-005-(14).jpeg'
) WHERE code = 'CA-005';

UPDATE properties SET images = jsonb_build_array(
    'CA-006/CA-006-(1).jpeg', 'CA-006/CA-006-(2).jpeg', 'CA-006/CA-006-(3).jpeg', 
    'CA-006/CA-006-(4).jpeg', 'CA-006/CA-006-(5).jpeg', 'CA-006/CA-006-(6).jpeg', 
    'CA-006/CA-006-(7).jpeg', 'CA-006/CA-006-(8).jpeg', 'CA-006/CA-006-(9).jpeg', 
    'CA-006/CA-006-(10).jpeg', 'CA-006/CA-006-(11).jpeg', 'CA-006/CA-006-(12).jpeg', 
    'CA-006/CA-006-(13).jpeg', 'CA-006/CA-006-(14).jpeg'
) WHERE code = 'CA-006';

UPDATE properties SET images = jsonb_build_array(
    'CA-007/CA-007-(1).jpeg', 'CA-007/CA-007-(2).jpeg', 'CA-007/CA-007-(3).jpeg', 
    'CA-007/CA-007-(4).jpeg', 'CA-007/CA-007-(5).jpeg', 'CA-007/CA-007-(6).jpeg', 
    'CA-007/CA-007-(7).jpeg', 'CA-007/CA-007-(8).jpeg', 'CA-007/CA-007-(9).jpeg', 
    'CA-007/CA-007-(10).jpeg'
) WHERE code = 'CA-007';

UPDATE properties SET images = jsonb_build_array(
    'CA-008/CA-008-(1).jpeg', 'CA-008/CA-008-(2).jpeg', 'CA-008/CA-008-(3).jpeg', 
    'CA-008/CA-008-(4).jpeg', 'CA-008/CA-008-(5).jpeg', 'CA-008/CA-008-(6).jpeg', 
    'CA-008/CA-008-(7).jpeg', 'CA-008/CA-008-(8).jpeg', 'CA-008/CA-008-(9).jpeg', 
    'CA-008/CA-008-(10).jpeg', 'CA-008/CA-008-(11).jpeg', 'CA-008/CA-008-(12).jpeg', 
    'CA-008/CA-008-(13).jpeg', 'CA-008/CA-008-(14).jpeg', 'CA-008/CA-008-(15).jpeg'
) WHERE code = 'CA-008';

UPDATE properties SET images = jsonb_build_array(
    'CA-009/CA-009-(1).jpeg', 'CA-009/CA-009-(2).jpeg', 'CA-009/CA-009-(3).jpeg', 
    'CA-009/CA-009-(4).jpeg', 'CA-009/CA-009-(5).jpeg', 'CA-009/CA-009-(6).jpeg', 
    'CA-009/CA-009-(7).jpeg', 'CA-009/CA-009-(8).jpeg', 'CA-009/CA-009-(9).jpeg', 
    'CA-009/CA-009-(10).jpeg', 'CA-009/CA-009-(11).jpeg', 'CA-009/CA-009-(12).jpeg', 
    'CA-009/CA-009-(13).jpeg'
) WHERE code = 'CA-009';

UPDATE properties SET images = jsonb_build_array(
    'CA-010/CA-010-(1).jpeg', 'CA-010/CA-010-(2).jpeg', 'CA-010/CA-010-(3).jpeg', 
    'CA-010/CA-010-(4).jpeg', 'CA-010/CA-010-(5).jpeg', 'CA-010/CA-010-(6).jpeg', 
    'CA-010/CA-010-(7).jpeg', 'CA-010/CA-010-(8).jpeg', 'CA-010/CA-010-(9).jpeg', 
    'CA-010/CA-010-(10).jpeg', 'CA-010/CA-010-(11).jpeg'
) WHERE code = 'CA-010';

UPDATE properties SET images = jsonb_build_array(
    'CA-011/CA-011-(1).jpeg', 'CA-011/CA-011-(2).jpeg', 'CA-011/CA-011-(3).jpeg', 
    'CA-011/CA-011-(4).jpeg', 'CA-011/CA-011-(5).jpeg', 'CA-011/CA-011-(6).jpeg', 
    'CA-011/CA-011-(7).jpeg', 'CA-011/CA-011-(8).jpeg', 'CA-011/CA-011-(9).jpeg', 
    'CA-011/CA-011-(10).jpeg', 'CA-011/CA-011-(11).jpeg', 'CA-011/CA-011-(12).jpeg', 
    'CA-011/CA-011-(13).jpeg', 'CA-011/CA-011-(14).jpeg'
) WHERE code = 'CA-011';

UPDATE properties SET images = jsonb_build_array(
    'CA-012/CA-012-(1).jpeg', 'CA-012/CA-012-(2).jpeg', 'CA-012/CA-012-(3).jpeg', 
    'CA-012/CA-012-(4).jpeg', 'CA-012/CA-012-(5).jpeg', 'CA-012/CA-012-(6).jpeg', 
    'CA-012/CA-012-(7).jpeg', 'CA-012/CA-012-(8).jpeg', 'CA-012/CA-012-(9).jpeg', 
    'CA-012/CA-012-(10).jpeg', 'CA-012/CA-012-(11).jpeg'
) WHERE code = 'CA-012';

UPDATE properties SET images = jsonb_build_array(
    'CA-013/CA-013-(1).jpeg', 'CA-013/CA-013-(2).jpeg', 'CA-013/CA-013-(3).jpeg', 
    'CA-013/CA-013-(4).jpeg', 'CA-013/CA-013-(5).jpeg', 'CA-013/CA-013-(6).jpeg', 
    'CA-013/CA-013-(7).jpeg', 'CA-013/CA-013-(8).jpeg', 'CA-013/CA-013-(9).jpeg', 
    'CA-013/CA-013-(10).jpeg', 'CA-013/CA-013-(11).jpeg', 'CA-013/CA-013-(12).jpeg', 
    'CA-013/CA-013-(13).jpeg'
) WHERE code = 'CA-013';

UPDATE properties SET images = jsonb_build_array(
    'CA-014/CA-014-(1).jpeg', 'CA-014/CA-014-(2).jpeg', 'CA-014/CA-014-(3).jpeg', 
    'CA-014/CA-014-(4).jpeg', 'CA-014/CA-014-(5).jpeg', 'CA-014/CA-014-(6).jpeg', 
    'CA-014/CA-014-(7).jpeg', 'CA-014/CA-014-(8).jpeg', 'CA-014/CA-014-(9).jpeg', 
    'CA-014/CA-014-(10).jpeg'
) WHERE code = 'CA-014';

UPDATE properties SET images = jsonb_build_array(
    'CA-015/CA-015-(1).jpeg', 'CA-015/CA-015-(2).jpeg', 'CA-015/CA-015-(3).jpeg', 
    'CA-015/CA-015-(4).jpeg', 'CA-015/CA-015-(5).jpeg', 'CA-015/CA-015-(6).jpeg', 
    'CA-015/CA-015-(7).jpeg', 'CA-015/CA-015-(8).jpeg', 'CA-015/CA-015-(9).jpeg', 
    'CA-015/CA-015-(10).jpeg'
) WHERE code = 'CA-015';

UPDATE properties SET images = jsonb_build_array(
    'CA-016/CA-016-(1).jpeg', 'CA-016/CA-016-(2).jpeg', 'CA-016/CA-016-(3).jpeg', 
    'CA-016/CA-016-(4).jpeg', 'CA-016/CA-016-(5).jpeg', 'CA-016/CA-016-(6).jpeg', 
    'CA-016/CA-016-(7).jpeg', 'CA-016/CA-016-(8).jpeg', 'CA-016/CA-016-(9).jpeg', 
    'CA-016/CA-016-(10).jpeg', 'CA-016/CA-016-(11).jpeg', 'CA-016/CA-016-(12).jpeg', 
    'CA-016/CA-016-(13).jpeg'
) WHERE code = 'CA-016';

UPDATE properties SET images = jsonb_build_array(
    'CA-017/CA-017-(1).jpeg', 'CA-017/CA-017-(2).jpeg', 'CA-017/CA-017-(3).jpeg', 
    'CA-017/CA-017-(4).jpeg', 'CA-017/CA-017-(5).jpeg', 'CA-017/CA-017-(6).jpeg', 
    'CA-017/CA-017-(7).jpeg', 'CA-017/CA-017-(8).jpeg', 'CA-017/CA-017-(9).jpeg', 
    'CA-017/CA-017-(10).jpeg', 'CA-017/CA-017-(11).jpeg', 'CA-017/CA-017-(12).jpeg', 
    'CA-017/CA-017-(13).jpeg', 'CA-017/CA-017-(14).jpeg'
) WHERE code = 'CA-017';

UPDATE properties SET images = jsonb_build_array(
    'CA-018/CA-018-(1).jpeg', 'CA-018/CA-018-(2).jpeg', 'CA-018/CA-018-(3).jpeg', 
    'CA-018/CA-018-(4).jpeg', 'CA-018/CA-018-(5).jpeg', 'CA-018/CA-018-(6).jpeg', 
    'CA-018/CA-018-(7).jpeg', 'CA-018/CA-018-(8).jpeg', 'CA-018/CA-018-(9).jpeg', 
    'CA-018/CA-018-(10).jpeg', 'CA-018/CA-018-(11).jpeg', 'CA-018/CA-018-(12).jpeg'
) WHERE code = 'CA-018';

UPDATE properties SET images = jsonb_build_array(
    'CA-019/CA-019-(1).jpeg', 'CA-019/CA-019-(2).jpeg', 'CA-019/CA-019-(3).jpeg', 
    'CA-019/CA-019-(4).jpeg', 'CA-019/CA-019-(5).jpeg', 'CA-019/CA-019-(6).jpeg', 
    'CA-019/CA-019-(7).jpeg', 'CA-019/CA-019-(8).jpeg', 'CA-019/CA-019-(9).jpeg', 
    'CA-019/CA-019-(10).jpeg', 'CA-019/CA-019-(11).jpeg', 'CA-019/CA-019-(12).jpeg',
    'CA-019/CA-019-(13).jpeg', 'CA-019/CA-019-(14).jpeg', 'CA-019/CA-019-(15).jpeg',
    'CA-019/CA-019-(16).jpeg', 'CA-019/CA-019-(17).jpeg', 'CA-019/CA-019-(18).jpeg'
) WHERE code = 'CA-019';

UPDATE properties SET images = jsonb_build_array(
    'CA-020/CA-020-(1).jpeg', 'CA-020/CA-020-(2).jpeg', 'CA-020/CA-020-(3).jpeg', 
    'CA-020/CA-020-(4).jpeg', 'CA-020/CA-020-(5).jpeg', 'CA-020/CA-020-(6).jpeg', 
    'CA-020/CA-020-(7).jpeg', 'CA-020/CA-020-(8).jpeg', 'CA-020/CA-020-(9).jpeg', 
    'CA-020/CA-020-(10).jpeg', 'CA-020/CA-020-(11).jpeg', 'CA-020/CA-020-(12).jpeg', 
    'CA-020/CA-020-(13).jpeg', 'CA-020/CA-020-(14).jpeg', 'CA-020/CA-020-(15).jpeg', 
    'CA-020/CA-020-(16).jpeg'
) WHERE code = 'CA-020';
