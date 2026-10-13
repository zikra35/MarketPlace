// SAFETY: the test files call User.deleteMany({}) etc. Never let them run against the
// real database from .env. They only run when MONGODB_TEST_URI points at a throwaway DB.
if (!process.env.MONGODB_TEST_URI) {
  throw new Error(
    'Refusing to run tests: set MONGODB_TEST_URI to a separate test database. ' +
    'The tests delete all users/products/orders in whatever database they connect to.'
  );
}
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI;

jest.setTimeout(10000);

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  jest.clearAllMocks();
});
