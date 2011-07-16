# MotherMayI #

MotherMayI is a simple ACL lib/schema using Redis.  
_Mother may who do what to whom?_

It does not keep track of users or groups, leaving that as an exercize for the user, which adds to its flexibility.
You can grant a user slug (who) an action (what) to an object (whom).

The code itself is actually pretty well documented inline, but since you're lazy, I'll document it here as well.

## Installing

    npm install mothermayi

## Running the tests

**WARNING** The tests are destructive. You'll need to edit the testconfig.json to specify a db and enable the tests before running. You should not be able to run the tests without editing this file first.

    node testall.js

> Testing MotherMayI:  
> .......  
> 7 Successful tests.  

## Examples ##

These examples give a "user:Username" and "group:Groupname" schema. You may use whatever schema you want for your "who slugs." This schema just allows for checking permissions on a group or username without risking collisions.

### Starting

    var MotherMayI = require('mothermayi').MotherMayI;
    //host, port, db
    var mayi = new MotherMayI('localhost', 6379, 0); //if not specified, these are the defaults

### Checking Access

    mayi.may('user:Bilbo', 'wear', 'TheOneRing', function(may) {
        if(may) {
            console.log('Bilbo may where the One Ring!');
        } else {
            console.log('Bilbo may NOT wear the One Ring');
        }
    });

### Granting Access

    mayi.grant('user:Bilbo', 'wear', 'TheOneRing', function(success) {});

### Revoking Access
    
    mayi.revoke('user:Bilbo', 'wear', 'TheOneRing', function(success) {});

### Checking Multiple User Slugs at Once

Since you might have users, groups, teams, etc, it is nice to be able to check them in one command and get a `true` back if any are true.

    mayi.mayThey(['user:Gandalf', 'group:'Wizards'], 'wear', 'TheOneRing', function(may) {
        if(may) {
            console.log('Either Gandalf or the Wizards may wear the One Ring.');
        } else {
            console.log('Neither Gandalf nor the Wizards may wear the One Ring.');
        }
    });

### Closing

    mayi.disconnect();
    
## License

Written by Nathan Fritz. Copyright © 2011 by &yet, LLC. Released under the
terms of the MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.