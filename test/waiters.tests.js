
const assert = require('assert');

const CreateWaiter = require('../createWaiter');

const pg = require("pg");
const Pool = pg.Pool;

const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/waiters_tests';

const pool = new Pool({
  connectionString
});

describe('The Waiters web app', function () {

  beforeEach(async function () {
    pool.query("DELETE FROM waiters;");
    pool.query("DELETE FROM tbldays;");
  });

  it('should be able to return the length ', async () => {
      const createWaiter = CreateWaiter(pool);
console.log(await createWaiter.getAllWaiters());
      let waiters = await createWaiter.getAllWaiters();
      assert.equal(3, waiters.length);
  });

  
  
  after(function(){
    pool.end();
  })
});