// Run: npm run test:panel
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPractice, buildPayload, defaultValue, describeState, errorInfo, needsConfirm } from './catalogPanel.logic.ts';

test('defaults: int is the middle, enum the first value, hex a colour', () => {
  assert.equal(defaultValue({ type: 'int', min: 16, max: 30 }), 23);
  assert.equal(defaultValue({ type: 'enum', values: ['cool', 'heat'] }), 'cool');
  assert.match(String(defaultValue({ type: 'hex' })), /^#[0-9a-f]{6}$/);
});

test('buildPayload: types, optional params only when touched, numeric enums keep their type', () => {
  const params = {
    mode: { type: 'enum', values: ['rice', 'soup'] },
    durationMinutes: { type: 'int', min: 1, max: 480 },
    temperature: { type: 'int', min: 40, max: 250, optional: true },
  } as const;
  assert.deepEqual(buildPayload(params, {}), { mode: 'rice', durationMinutes: 241 });
  assert.deepEqual(buildPayload(params, { mode: 'soup', durationMinutes: '30', temperature: 90 }), { mode: 'soup', durationMinutes: 30, temperature: 90 });
  assert.deepEqual(buildPayload({ value: { type: 'enum', values: [0, 180] } }, { value: '180' }), { value: 180 });
  assert.deepEqual(buildPayload({ hex: { type: 'hex' } }, { hex: '#ff8800' }), { hex: '#ff8800' });
  assert.deepEqual(buildPayload(undefined, {}), {});
});

test('needsConfirm: heating, fridge off, vehicle unlock, robot move', () => {
  assert.equal(needsConfirm('cooker', 'START'), true);
  assert.equal(needsConfirm('cooker', 'STOP'), false);
  assert.equal(needsConfirm('fridge', 'OFF'), true);
  assert.equal(needsConfirm('fridge', 'SET_TEMPERATURE'), false);
  assert.equal(needsConfirm('car', 'UNLOCK'), true);
  assert.equal(needsConfirm('robot', 'MOVE'), true);
  assert.equal(needsConfirm('light', 'ON'), false);
  assert.equal(needsConfirm('unknown', 'ON'), false);
});

test('applyPractice mirrors commands and never stores "confirmed"', () => {
  let s = applyPractice({}, 'ON', {});
  assert.equal(s.power, true);
  s = applyPractice(s, 'SET_BRIGHTNESS', { value: 60 });
  assert.equal(s.brightness, 60);
  s = applyPractice(s, 'SET_COLOR_TEMP', { value: 3000 });
  assert.equal(s.colorTemp, 3000);
  s = applyPractice(s, 'SET_COLOR', { hex: '#ff8800' });
  assert.equal(s.color, '#ff8800');
  s = applyPractice(s, 'START', { mode: 'rice', durationMinutes: 30, confirmed: true });
  assert.deepEqual([s.running, s.mode, s.durationMinutes, 'confirmed' in s], [true, 'rice', 30, false]);
  s = applyPractice(s, 'TOGGLE', {});
  assert.equal(s.power, false);
  s = applyPractice(s, 'OPEN', {});
  assert.equal(s.open, true);
  s = applyPractice(s, 'EMERGENCY_STOP', {});
  assert.deepEqual([s.estopped, s.running], [true, false]);
  assert.equal(applyPractice({ a: 1 }, 'GET_STATUS', {}).a, 1);
});

test('describeState hides lastCommand and shows booleans as on/off', () => {
  assert.deepEqual(describeState({ lastCommand: 'ON', power: true, brightness: 60 }), ['power: on', 'brightness: 60']);
});

test('errorInfo: 401/404/network = offline (practice); SAFETY_BLOCKED with confirm = ask; others are real errors', () => {
  assert.equal(errorInfo({ status: 401, code: 'UNAUTHENTICATED', message: 'x' }).offline, true);
  assert.equal(errorInfo({ status: 404, code: 'DEVICE_NOT_FOUND', message: 'x' }).offline, true);
  assert.equal(errorInfo(new TypeError('Failed to fetch')).offline, true);
  const c = errorInfo({ status: 403, code: 'SAFETY_BLOCKED', message: 'Blocked', details: { reason: 'CONFIRM_REQUIRED' } });
  assert.deepEqual([c.confirm, c.offline], [true, false]);
  const e = errorInfo({ status: 423, code: 'EMERGENCY_STOP_ACTIVE', message: 'Emergency stop' });
  assert.deepEqual([e.confirm, e.offline, e.code], [false, false, 'EMERGENCY_STOP_ACTIVE']);
});
