var TestObject = require("./testcore").TestObject,
    MotherMayI = require('../mothermayi').MotherMayI;

var tests = new TestObject([
    'grant_Beatrix_kill_Bill',
    'may_Beatrix_kill_Bill',
    'revoked_Beatrix_kill_Bill',
    'fail_Beatrix_kill_Bill2',
    'HobbitsCan',
    'GandalfCannot',
    'SmeagulCan',
], 'MotherMayI', function(config) {
    var mayi = new MotherMayI(config.host, config.port, config.db);
    mayi.redis.flushdb();
    mayi.grant('group:Hobbits', 'wear', 'TheOneRing');
    mayi.grant('user:Smeagul', 'wear', 'TheOneRing', function() {
        mayi.mayThey(['user:Bilbo', 'group:Hobbits'], 'wear', 'TheOneRing', function(may) {
            if(may) {
                tests.should('HobbitsCan');
            } else {
                tests.should('HobbitsCannot');
            }
        });
        mayi.mayThey(['user:Gandalf', 'group:Wizards'], 'wear', 'TheOneRing', function(may) {
            if(may) {
                tests.should('GandalfCan');
            } else {
                tests.should('GandalfCannot');
            }
        });
        mayi.mayThey(['user:Smeagul', 'group:Ancients'], 'wear', 'TheOneRing', function(may) {
            if(may) {
                tests.should('SmeagulCan');
            } else {
                tests.should('SmeagulCannot');
            }
            mayi.grant('Beatrix', 'kill', 'Bill', function(may) {
                if(may) { tests.should('grant_Beatrix_kill_Bill'); }
                mayi.may('Beatrix', 'kill', 'Bill', function(may) {
                    if(may) {
                        tests.should('may_Beatrix_kill_Bill');
                    } else {
                        tests.should('fail_Beatrix_kill_Bill');
                    }
                    mayi.revoke('Beatrix', 'kill', 'Bill', function(success) {
                        if(success) {
                            tests.should('revoked_Beatrix_kill_Bill');
                        }
                        mayi.may('Beatrix', 'kill', 'Bill', function(may) {
                            if(may) {
                                tests.should('may_Beatrix_kill_Bill2');
                            } else {
                                tests.should('fail_Beatrix_kill_Bill2');
                            }
                            mayi.close();
                        });
                    });
                });
            });
        });
    });
});

exports.tests = tests;
