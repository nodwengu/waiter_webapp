const express = require('express');
const router = express.Router();

const { Pool, Client } = require('pg');

let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local){
  useSSL = true;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/waiterapp_db';

const pool = new Pool({
  connectionString,
  ssl : useSSL
});

const CreateWaiter = require('../createWaiter');
const createWaiter = CreateWaiter(pool);

router.get('/', async (req, res, next) => {
  try {
    res.render('index', {
      days: await createWaiter.getAllDays(),
      waiters: await createWaiter.getAllWaiters()
    });
 

  } catch (error) {
    next(error);
  }
});


router.get('/waiters/:username', async (req, res, next) => {
  try {
    res.render('options', {
      username: req.params.username,
      days: await createWaiter.getAllDays(),
    });
 

  } catch (error) {
    next(error);
  }
});

router.post('/waiters/:username', async (req, res, next) => {
  try {
    //Get values selected by user
    //Insert each value to the days table
    //

    res.json({
      selected: req.body
    })
    
    //console.log(req.params.username);
    console.log(req.body);
 
    res.redirect(`/waiters/${req.params.username}`)
  } 
  catch (error) {
    next(error);
  }
});


module.exports = router;