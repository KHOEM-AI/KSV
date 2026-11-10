// Run: npm run test:panel
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload, defaultValue, describeState, errorText, FALLBACK_TYPE, isConfirmRequired, isOptional, parseType } from './catalogPanel.logic.ts';

test('defaults: int is the middle, enum the first value, hex a colour, bool false', () => {
  assert.equal(defaultValue({ type: 'int', min: 16, max: 30 }), 23);
  assert.equal(defaultValue({ type: 'enum', values: ['cool', 'heat'] }), 'cool');
  assert.match(String(defaultValue({ type: 'hex' })), /^#[0-9a-f]{6}$/);
  assert.equal(defaultValue({ type: 'bool' }), false);
  assert.equal(defaultValue({}), '');
});

test('optional works for both gateway spellings', () => {
  assert.equal(isOptional({ optional: true }), true);
  assert.equal(isOptional({ required: false }), true);
  assert.equal(isOptional({ required: true }), false);
  assert.equal(isOptional({}), false);
});

test('buildPayload: types, optional params only when touched, numeric enums keep their type', () => {
  const params = {
    mode: { type: 'enum', values: ['rice', 'soup'], required: true },
    durationMinutes: { type: 'int', min: 1, max: 480, required: true },
    temperature: { type: 'int', min: 40, max: 250, required: false, optional: true },
  };
  assert.deepEqual(buildPayload(params, {}), { mode: 'rice', durationMinutes: 241 });
  assert.deepEqual(buildPayload(params, { mode: 'soup', durationMinutes: '30' as unknown as number, temperature: 90 }), { mode: 'soup', durationMinutes: 30, temperature: 90 });
  assert.deepEqual(buildPayload({ value: { type: 'enum', values: [0, 180] } }, { value: '180' }), { value: 180 });
  assert.deepEqual(buildPayload({ hex: { type: 'hex' } }, { hex: '#ff8800' }), { hex: '#ff8800' });
  assert.deepEqual(buildPayload({ on: { type: 'bool' } }, { on: true }), { on: true });
  assert.deepEqual(buildPayload(undefined, {}), {});
});

test('parseType accepts the gateway shape and rejects anything else', () => {
  const ok = parseType({ type: 'light', km: 'អំពូល', safetyClass: 'light', commands: [{ command: 'ON', km: 'បើក' }, { nope: 1 }, { command: 'SET_BRIGHTNESS', params: { value: { type: 'int', min: 0, max: 100, required: true } } }] });
  assert.deepEqual([ok?.type, ok?.km, ok?.commands.length], ['light', 'អំពូល', 2]);
  assert.equal(parseType(null), null);
  assert.equal(parseType({ commands: 'x' }), null);
  assert.equal(parseType({ commands: [] }), null);
  assert.equal(parseType({ error: 'UNKNOWN_TYPE' }), null);
});

test('fallback type has on / off / status', () => {
  assert.deepEqual(FALLBACK_TYPE.commands.map((c) => c.command), ['ON', 'OFF', 'GET_STATUS']);
});

test('confirmation is detected from the gateway 428 answer', () => {
  assert.equal(isConfirmRequired(new Error('428 ពាក្យបញ្ជានេះត្រូវការការបញ្ជាក់')), true);
  assert.equal(isConfirmRequired(new Error('400 CONFIRMATION_REQUIRED')), true);
  assert.equal(isConfirmRequired(new Error('409 GUARD_BLOCKED')), false);
  assert.equal(isConfirmRequired(new Error('4281 other')), false);
  assert.equal(errorText('plain'), 'plain');
});

test('describeState hides lastCommand/updatedAt and shows booleans as on/off', () => {
  assert.deepEqual(describeState({ lastCommand: 'ON', updatedAt: 'x', power: true, brightness: 60 }), ['power: on', 'brightness: 60']);
  assert.deepEqual(describeState(undefined), []);
});
