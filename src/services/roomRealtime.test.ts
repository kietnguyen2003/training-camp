import test from 'node:test';
import assert from 'node:assert/strict';

import { getRoomRealtimeBindings } from './roomRealtime';

test('includes participant and level realtime bindings for a room', () => {
  assert.deepEqual(getRoomRealtimeBindings('room-badminton-camp'), [
    {
      event: '*',
      schema: 'public',
      table: 'participants',
      filter: 'room_id=eq.room-badminton-camp',
    },
    {
      event: '*',
      schema: 'public',
      table: 'levels',
      filter: 'room_id=eq.room-badminton-camp',
    },
  ]);
});
