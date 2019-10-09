DROP TABLE IF EXISTS waiters, weekdays, waiterdays;

CREATE TABLE waiters(
    waiter_id SERIAL NOT NULL,
    username TEXT NOT NULL PRIMARY KEY 
);

CREATE TABLE weekdays(
    day_name TEXT NOT NULL  PRIMARY KEY,
    days_counter INT NOT NULL DEFAULT 0,
    curr_day INT NOT NULL DEFAULT 0, 
    availability TEXT NOT NULL DEFAULT 'less'

);

CREATE TABLE waiterdays(
    id SERIAL NOT NULL PRIMARY KEY,
    username TEXT NOT NULL,
    day_name TEXT NOT NULL,
    FOREIGN KEY (username) REFERENCES waiters(username),
    FOREIGN KEY (day_name) REFERENCES weekDays(day_name)
);

INSERT INTO waiters(username) VALUES('Thando'),('Johno'),('Vuyo'),('Mark'),('James');
INSERT INTO weekdays(day_name, curr_day) VALUES('Sunday', 0),('Monday', 1),('Tuesday', 2),('Wednesday', 3),('Thursday', 4),('Friday', 5),('Saturday', 6);

