/*
 * Written by Nathan Fritz. Copyright © 2011 by &yet, LLC. 
 * Released under the terms of the MIT License
 */

var Redis = require("redis");

/*
 * MotherMayI is a simple ACL lib/schema using Redis. 
 * Specify a Redis host, port, and db to use.
 * Then you can check/grant/revoke ACL for any user/group-slug (who) any action
 * (what) to any object (whom).
 * Ex:
 * var mayi = new MotherMayI('localhost', 6379, 10);
 * mayi.may('group:work', 'edit', 'userbobsstuff', function(can) { });
 *
 * @param host - ip or dns name for redis host, defaults to localhost
 * @param port - numerical port of redis host, defaults to 6379
 * @param db - numberical db # for redis host, defaults to 0
 */

var MotherMayI = function(host, port, db) {
    if (host == undefined) {
        host = 'localhost';
    }
    if (port == undefined) {
        port = 6379;
    }
    if (db == undefined) {
        db = 0;
    }
    this.redis = Redis.createClient(port, host);
    this.redis.select(db);
};

MotherMayI.prototype = new (function() {

    /*
     * BoolCollector is a helper object for MotherMayI.they.
     * It collects boolean callback responses and aggregates them into one
     * response for your main callback.
     */
    var BoolCollector = function(goal_count, callback) {
        this.goal_count = goal_count;
        this.callback = callback;
        this.count = 0;
        this.passed = false;
    };

    BoolCollector.prototype = new (function() {
        
        /*
         * set is used to do the work of aggregating the boolean results from
         * callbacks
         *
         * @param abool -- true/false
         */
        this.set = function(abool) {
            this.count += 1;
            if(!this.passed) {
                if(abool) {
                    this.passed = true;
                    this.callback(true);
                } else if (this.count == this.goal_count) {
                    this.callback(false);
                }
            }
        };

    });

    /*
     * Mother, may who do what to whom?
     * may group/user-slug (who) do (what) to object (whom)
     *
     * @param who: group/user slug like group:workteam user:bill or your own
     *      schema.
     *  @param what: action like edit, delete, publish, kill, boil, whatever
     *  @param whom: object that you would like to do the action to.
     */
    this.may = function(who, what, whom, callback) {
        this.redis.sismember('acl::' + what + '::' + whom, who, function(err, reply) {
            if(reply) {
                callback(true);
            } else {
                callback(false);
            }
        });
    };

    //alias
    this.check = this.may;

    /*
     * Grant access for slug to do action to object.
     *
     * @param who: group/user slug like group:workteam user:bill or your own
     *      schema.
     *  @param what: action like edit, delete, publish, kill, boil, whatever
     *  @param whom: object that you would like to do the action to.
     */
    this.grant = function(who, what, whom, callback) {
        this.redis.sadd('acl::' + what + '::' + whom, who, function(err, reply) {
            if(callback != undefined) {
                if(!err) {
                    callback(true);
                } else {
                    callback(false);
                }
            }
        });
    };

    /*
     * Revoke access for slug to do action to object.
     *
     * @param who: group/user slug like group:workteam user:bill or your own
     *      schema.
     *  @param what: action like edit, delete, publish, kill, boil, whatever
     *  @param whom: object that you would like to do the action to.
     */
    this.revoke = function(who, what, whom, callback) {
        this.redis.srem('acl::' + what + '::' + whom, who, function(err, reply) {
            if(reply) {
                callback(true);
            } else {
                callback(false);
            }
        });
    };

    /*
     * Check access for several slugs to do action to object. If one of them
     * comes back true, then the callback will get true.
     *
     * @param who: group/user slug like group:workteam user:bill or your own
     *      schema.
     *  @param what: action like edit, delete, publish, kill, boil, whatever
     *  @param whom: object that you would like to do the action to.
     */
    this.mayThey = function(they, what, whom, callback) {
        var bc = new BoolCollector(they.length, callback);
        they.forEach(function(who, idx) {
            this.may(who, what, whom, bc.set.bind(bc));
        }.bind(this));
    };

    /*
     * Disconnect from Redis.
     */
    this.quit = function() {
        this.redis.quit();
    }

    this.disconect = this.quit;
    this.close = this.quit;

});

exports.MotherMayI = MotherMayI;
