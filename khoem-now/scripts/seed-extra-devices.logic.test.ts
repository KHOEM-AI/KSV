// Run: npm run test:seed
import test from 'node:test';
import assert from 'node:assert/strict';
import { dbTypeFor, deviceRecordFor } from './seed-extra-devices.logic.ts';
import { EXTRA_DEVICES } from '../src/components/extraDevices.ts';

test('heating and kitchen devices become appliance, vehicles stay vehicle, ac becomes hvac', () => {
  assert.equal(dbTypeFor('cooker'), 'appliance');
  assert.equal(dbTypeFor('dishwasher'), 'appliance');
  assert.equal(dbTypeFor('motorcycle'), 'vehicle');
  assert.equal(dbTypeFor('car'), 'vehicle');
  assert.equal(dbTypeFor('ac'), 'hvac');
  assert.equal(dbTypeFor('light'), 'light');
  assert.equal(dbTypeFor('subwoofer'), 'subwoofer');
});

test('records: offline, consumer by default, heavy machines are robot_mobile', () => {
  assert.deepEqual(deviceRecordFor({ id: 'rice-cooker-1', name: 'Rice Cooker', type: 'cooker' }), {
    name: 'Rice Cooker', deviceCode: 'rice-cooker-1', type: 'appliance', status: 'offline', criticality: 'consumer',
  });
  assert.equal(deviceRecordFor({ id: 'forklift-1', name: 'Forklift', type: 'motor' }).criticality, 'robot_mobile');
});

test('all 36 extra devices produce valid, unique device codes', () => {
  assert.equal(EXTRA_DEVICES.length, 36);
  const codes = EXTRA_DEVICES.map((d) => deviceRecordFor(d).deviceCode);
  assert.equal(new Set(codes).size, 36);
  for (const c of codes) assert.match(c, /^[a-z0-9]+(-[a-z0-9]+)*-1$/);
  for (const d of EXTRA_DEVICES) assert.ok(deviceRecordFor(d).name && deviceRecordFor(d).type);
});
