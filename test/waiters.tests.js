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
    pool.query("DELETE FROM waiterdays;");
    pool.query(`UPDATE weekdays SET days_counter = 0, avail_status = 'less'`)
  });

  it('should be able to return a list of week days from weekdays table', async () => {
    const createWaiter = CreateWaiter(pool);

    let days = await createWaiter.getAllDays();

    assert.equal(7, days.length);
  });

  it('should be able to return a list of waiters from waiters table', async () => {
    const createWaiter = CreateWaiter(pool);

    let waiters = await createWaiter.getAllWaiters();
    let results = [ 
      { waiter_id: 1, username: 'Thando' },
      { waiter_id: 2, username: 'Johno' },
      { waiter_id: 3, username: 'Vuyo' },
      { waiter_id: 4, username: 'Mark' },
      { waiter_id: 5, username: 'James' } ]
  
    assert.equal(5, waiters.length);
    assert.deepEqual(results, await createWaiter.getAllWaiters());
  });

  it('should be able to store new waiter days in a waiterdays table', async () => {
    const createWaiter = CreateWaiter(pool);

    await createWaiter.setWaiterDays({username: 'Thando', day_name: 'Tuesday'});
    await createWaiter.setWaiterDays({username: 'Vuyo', day_name: 'Monday'});
    await createWaiter.setWaiterDays({username: 'Mark', day_name: 'Friday'});

    let allWaiterDays = await createWaiter.getAllWaiterDays()
    
    assert.equal(3, allWaiterDays.length);
  });

  it('should be able to update day counter on week day table ', async () => {
    const createWaiter = CreateWaiter(pool);

    let results = [ 
      { day_name: 'Sunday',days_counter: 0,avail_status: 'less',curr_day: 0,curr_date: 0 },
      { day_name: 'Monday',days_counter: 0,avail_status: 'less',curr_day: 1,curr_date: 0 },
      { day_name: 'Tuesday',days_counter: 0,avail_status: 'less',curr_day: 2,curr_date: 0 },
      { day_name: 'Wednesday',days_counter: 0,avail_status: 'less',curr_day: 3,curr_date: 0 },
      { day_name: 'Thursday',days_counter: 0,avail_status: 'less',curr_day: 4,curr_date: 0 },
      { day_name: 'Friday',days_counter: 0,avail_status: 'less',curr_day: 5,curr_date: 0 },
      { day_name: 'Saturday',days_counter: 0,avail_status: 'less',curr_day: 6,curr_date: 0 } 
    ]

     
    assert.deepEqual(results, await createWaiter.getAllDays());

    await createWaiter.updateDayCounter({day_name: 'Monday'});

    let newResults = [ 
      { day_name: 'Sunday',days_counter: 0,avail_status: 'less',curr_day: 0,curr_date: 0 },
      { day_name: 'Monday',days_counter: 1,avail_status: 'less',curr_day: 1,curr_date: 0 },
      { day_name: 'Tuesday',days_counter: 0,avail_status: 'less',curr_day: 2,curr_date: 0 },
      { day_name: 'Wednesday',days_counter: 0,avail_status: 'less',curr_day: 3,curr_date: 0 },
      { day_name: 'Thursday',days_counter: 0,avail_status: 'less',curr_day: 4,curr_date: 0 },
      { day_name: 'Friday',days_counter: 0,avail_status: 'less',curr_day: 5,curr_date: 0 },
      { day_name: 'Saturday',days_counter: 0,avail_status: 'less',curr_day: 6,curr_date: 0 } 
    ]
    
    assert.deepEqual(newResults, await createWaiter.getAllDays());
  });

  it('should be able to return day counter for a specific day', async () => {
    const createWaiter = CreateWaiter(pool);

    assert.deepEqual({ days_counter: 1 }, await createWaiter.getCounterByDayName('Monday'));
    assert.deepEqual({ days_counter: 0 }, await createWaiter.getCounterByDayName('Friday'));
    assert.deepEqual({ days_counter: 0 }, await createWaiter.getCounterByDayName('Sunday'));
  });

  it('should be able to reset availability status and counter to their default values', async () => {
    const createWaiter = CreateWaiter(pool);

    createWaiter.resetAll();

    let results = [ 
      { day_name: 'Sunday',days_counter: 0,avail_status: 'less',curr_day: 0,curr_date: 0 },
      { day_name: 'Monday',days_counter: 0,avail_status: 'less',curr_day: 1,curr_date: 0 },
      { day_name: 'Tuesday',days_counter: 0,avail_status: 'less',curr_day: 2,curr_date: 0 },
      { day_name: 'Wednesday',days_counter: 0,avail_status: 'less',curr_day: 3,curr_date: 0 },
      { day_name: 'Thursday',days_counter: 0,avail_status: 'less',curr_day: 4,curr_date: 0 },
      { day_name: 'Friday',days_counter: 0,avail_status: 'less',curr_day: 5,curr_date: 0 },
      { day_name: 'Saturday',days_counter: 0,avail_status: 'less',curr_day: 6,curr_date: 0 } 
    ]
    assert.deepEqual(results, await createWaiter.getAllDays());
  });


  after(function () {
    //pool.query("DELETE FROM waiterdays;");
    pool.end();
  })
});