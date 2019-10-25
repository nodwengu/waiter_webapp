const express = require('express');
const router = express.Router();

const authMiddleware = require('../auth/middleware');

const { Pool, Client } = require('pg');

let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
   useSSL = true;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/waiterapp_db';

const pool = new Pool({
   connectionString,
   ssl: useSSL
});

const CreateWaiter = require('../createWaiter');
const createWaiter = CreateWaiter(pool);

router.get('/', async (req, res, next) => {
   try {
      let loggedin = false;

      if (req.signedCookies.userName) {
         loggedin = true;

         let user = await createWaiter.getWaiterByUsername(req.signedCookies.userName);
         if (user.usertype == 'admin') {
            res.redirect(`/days`);
         }
         else {
            res.redirect(`/waiters/${req.signedCookies.userName}`);
         }
      } else {
         res.render('home', {
            waiterDays: await createWaiter.getAllWaiters(),
            loggedin,
         });
      }

   } catch (error) {
      next(error);
   }
});

router.get('/days', authMiddleware.ensureLoggedIn, async (req, res, next) => {
   try {
      if (req.signedCookies.userName) {
         let user = await createWaiter.getWaiterByUsername(req.signedCookies.userName);
         let days = await createWaiter.getAllDays(); 
        
         if (user.usertype === 'admin') {
            res.render('index', {
               days,
               messages: req.flash('info'),
              
            });
         } else {
            res.redirect(`/waiters/${req.signedCookies.userName}`);
         }
      }
   } catch (error) {
      next(error);
   }
});

router.get('/day/:day_name', authMiddleware.ensureLoggedIn, async (req, res, next) => {
   try {
      if (req.signedCookies.userName) {
         let user = await createWaiter.getWaiterByUsername(req.signedCookies.userName);
         if (user.usertype === 'admin') {
            res.render('day', {
               day: req.params.day_name,
               waiterDays: await createWaiter.getAllByDay(req.params.day_name),
               available: await createWaiter.getAllAvailableWaiters(req.params.day_name),
            });
         } else {
            res.redirect(`/waiters/${req.signedCookies.userName}`);
         }
      }
   }
   catch (error) {
      next(error);
   }

});

router.get('/day/:day_name/delete/:username', authMiddleware.ensureLoggedIn, async (req, res, next) => {
   try {
      if (req.signedCookies.userName) {
         let user = await createWaiter.getWaiterByUsername(req.signedCookies.userName);
         if (user.usertype === 'admin') {
            let day = req.params.day_name;
            let name = req.params.username;

            await createWaiter.removeFromDay(day, name);
            await createWaiter.reduceDayCounter({ day_name: day });
            await createWaiter.setColor(day);
            res.redirect(`/day/${day}`);
         } else {
            res.redirect(`/waiters/${req.signedCookies.userName}`);
         }
      }
   } catch (error) {
      next(error);
   }
});

//router.get('/waiters', authMiddleware.ensureLoggedIn, authMiddleware.allowAccess, async (req, res, next) => {
router.get('/waiters', authMiddleware.ensureLoggedIn, async (req, res, next) => {
   try {
      if (req.signedCookies.userName) {
         let user = await createWaiter.getWaiterByUsername(req.signedCookies.userName);
         if (user.usertype === 'admin') {
            res.render('waiters', {
               waiters: await createWaiter.getAllWaiters(),
               messages: req.flash('info')
            });
         } else {
            res.redirect(`/waiters/${req.signedCookies.userName}`);
         }
      }
   }
   catch (error) {
      next(error);
   }
});


router.get('/waiters/:username', authMiddleware.ensureLoggedIn, async (req, res, next) => {
   try {
      let user = await createWaiter.getWaiterByUsername(req.signedCookies.userName);
      
      let waiterDays = await createWaiter.getDaysByName(req.params.username);
      let assignedDays  = waiterDays.map(day =>day.day_name);
      let days = await createWaiter.getAllDays(); 

      await days.forEach(day => {
         if(assignedDays.includes(day.day_name)) {
            day.checked = 'checked';
         } else {
            day.checked = 'undefined';
         }
      });
      // console.log({assignedDays, days});
      
      if ((req.signedCookies.userName == req.params.username) || user.usertype === 'admin') {
         if (user.usertype === 'admin' && (req.signedCookies.userName == req.params.username)) {
            res.redirect('/days');
         } else {
            
            res.render('options', {
               username: req.params.username,
               days,
               waiters: await createWaiter.getAllWaiters(),
               messages: req.flash('info'),
            });
         }
      }

   } catch (error) {
      next(error);
   }
});

router.post('/waiters/:username', authMiddleware.ensureLoggedIn, async (req, res, next) => {
   try {   
      let username = req.params.username;
      let days = await createWaiter.getAllDays();
      
      let waiterSelections;

      if (typeof req.body.days === 'string') {
         waiterSelections = [req.body.days];
      } else {
         waiterSelections = req.body.days;
      }

      //Remove waiter from the table
      await createWaiter.removeWaiterFrom(username);

      for(let i = 0; i < days.length; i++) {
         let day = days[i];

         if(waiterSelections) {
            for(let i = 0; i < waiterSelections.length; i++) {
               let selection = waiterSelections[i];
               
               if(selection === day.day_name) {
                  let isRepeated = await createWaiter.isDayRepeated(username, selection);

                  if(!waiterSelections.includes(day.day_name)) {
                     //delete before
                     await createWaiter.removeFromDay(day.day_name, username);
                     await createWaiter.updateWaiterDays( {username, day_name: day.day_name }); 
                   
                  } else {
                     if(isRepeated) {
                        await createWaiter.removeFromDay(day.day_name, username);
                        await createWaiter.updateWaiterDays( {username, day_name: day.day_name }); 
                     } else {
                        //delete before
                        await createWaiter.removeFromDay(day.day_name, username);
                        await createWaiter.setWaiterDays( {username, day_name: day.day_name });
                     }

                  }
               } 
            }
         } 
         else {
            await createWaiter.removeFromDay(day.day_name, username);
         }
      }
      
      for(let day of days) {
         let value = await createWaiter.countWaiters(day.day_name);

         await createWaiter.updateCounter(day.day_name, value);
         await createWaiter.setColor(day.day_name);
      }
      
      res.redirect(`/waiters/${req.params.username}`);
   }
   catch (error) {
      next(error);
   }
});

router.get('/delete', authMiddleware.ensureLoggedIn, async (req, res, next) => {
   try {
      if (req.signedCookies.userName) {
         let user = await createWaiter.getWaiterByUsername(req.signedCookies.userName);
         if (user.usertype === 'admin') {
            await createWaiter.deleteWaiterDays();
            await createWaiter.resetAll();
         }
      }
      res.redirect(`/`);
   } catch (error) {
      next(error);
   }

});


module.exports = router;