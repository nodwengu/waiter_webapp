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
            loggedin
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
         if (user.usertype === 'admin') {
            res.render('index', {
               days: await createWaiter.getAllDays(),
               messages: req.flash('info')
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
      let user = await createWaiter.getWaiterByUsername(req.signedCookies.userName);

      let username = req.params.username;
      let days = await createWaiter.getAllDays();
      let waiterDays = await createWaiter.getDaysByName(username);
      let waiterSelections;

      if (typeof req.body.days === 'string') {
         waiterSelections = [req.body.days];
      } else {
         waiterSelections = req.body.days;
      }

      if (waiterSelections !== undefined) {
         // if (waiterSelections.length > 7 || waiterDays.length > 7) {
         //    req.flash('info', 'MORE THAN 7 days');
         // } else {
         let exit_loops = false;
         for (let day of days) {
            for (let selection of waiterSelections) {
               let isRepeated = await createWaiter.isDayRepeated(username, selection);
               if (!isRepeated) {
                  if (day.day_name === selection) {
                     //if(day.days_counter < 3) { //Prevent from adding more than 3 waiters
                     await createWaiter.updateDayCounter({ day_name: day.day_name });
                     await createWaiter.setWaiterDays({ username, day_name: selection });
                     await createWaiter.setColor(day.day_name);
                     // } else {   
                     //    exit_loops = true;
                     //    req.flash('info', `${day.day_name} has enough waiters...`);
                     // }
                  }
               }
            }
            if (exit_loops) { break; }
         }
         // }
      } else {
         req.flash('info', 'Please select at least one day from the list');
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

router.get('/waiters/edit/:username', authMiddleware.ensureLoggedIn, async (req, res, next) => {
   try {
      let user = await createWaiter.getWaiterByUsername(req.signedCookies.userName);
      
      let waiterDays = await createWaiter.getDaysByName(req.params.username);
      let assignedDays  = waiterDays.map(day =>day.day_name);
      let days = await createWaiter.getAllDays(); 

      await days.forEach(day => {
         if(assignedDays.includes(day.day_name)) {
            day.checked = 'checked';
         }
      });
      // console.log({assignedDays, days});
      
      if ((req.signedCookies.userName == req.params.username) || user.usertype === 'admin') {
         if (user.usertype === 'admin' && (req.signedCookies.userName == req.params.username)) {
            res.redirect('/days');
         } else {
            
            res.render('edit', {
               username: req.params.username,
               days,
               messages: req.flash('info'),
            });
         }
      }

   } catch (error) {
      next(error);
   }
});

router.post('/waiters/edit/:username', authMiddleware.ensureLoggedIn, async (req, res, next) => {
   try {
      let user = await createWaiter.getWaiterByUsername(req.signedCookies.userName);

      if (req.signedCookies.userName) {
       
         let username = req.params.username;
         let days = await createWaiter.getAllDays();
         let waiterSelections;

         if (typeof waiterSelections === 'string') {
            waiterSelections = [req.body.days];
         } else if(typeof waiterSelections === 'array') {
            waiterSelections = req.body.days;
         } else {
            waiterSelections = "";
         }

         // if (typeof waiterSelections === 'string') {
         //    waiterSelections = [req.body.days];
         // } else {
         //    waiterSelections = req.body.days;
         // } 
       

         if (waiterSelections !== undefined) {
            for (let day of days) {
               for (let selection of waiterSelections) {
                  //if(day.day_name == selection) {
                     await createWaiter.updateWaiterDays({ username, day_name: day.day_name });
                  //}
                  
               }
            }
            
            
         } else {
            console.log("undefined");
            
         }

         
      //    console.log(waiterSelections);

      //    for (let day of days) {
            
      //    for (let selection of waiterSelections) {
      //       if(day.day_name == selection) {
      //       // await createWaiter.decreaseDayCounter({ day_name: selection });
      //        console.log(selection);
            
      //       // await createWaiter.setColor(selection);

      //       // await createWaiter.removeFromDay(selection, username);
      //       // await createWaiter.reduceDayCounter({ day_name: selection });
      //       // await createWaiter.setColor(selection);
      //       // await createWaiter.updateWaiterDays({ username, day_name: selection });
      //       }

            
      //    }     
      //    }
      }


      res.redirect(`/waiters/${req.params.username}`);

   } catch (error) {
      next(error);
   }
});

module.exports = router;