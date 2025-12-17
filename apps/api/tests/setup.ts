import { unlinkSync } from 'node:fs';
import { afterAll, beforeAll } from 'vitest';

const TEST_DB_PATH = './test.db';

beforeAll(() => {
  process.env.DATABASE_URL = TEST_DB_PATH;
});

afterAll(() => {
  try {
    unlinkSync(TEST_DB_PATH);
    unlinkSync(`${TEST_DB_PATH}-shm`);
    unlinkSync(`${TEST_DB_PATH}-wal`);
  } catch (error) {
    // Ignore errors
  }
});
