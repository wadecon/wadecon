var vows = require('vows');
var assert = require('assert');

var dbbadgemaps = require("../dbmodules/dbbadgemaps.js");

var suite = vows.describe("dbModules");

suite.addBatch({
    'dbbadgemaps.js':{
        topic: function(){
            
        },
        
        'expected behavior': function(topic){
            
        },
        'expected behavior2': function(topic){
            
        },
    }
});

suite.addBatch({
    
});

suite.addBatch({
    
});

suite.addBatch({
    
});

suite.addBatch({
    
});

suite.addBatch({
    
});

suite.addBatch({
    
});

suite.addBatch({
    
});

// Create a Test Suite
vows.describe('Division by Zero').addBatch({
    'when dividing a number by zero': {
        topic: function () { return 42 / 0 },

        'we get Infinity': function (topic) {
            assert.equal (topic, 1);
        }
    },
    'but when dividing zero by zero': {
        topic: function () { return 0 / 0 },

        'we get a value which': {
            'is not a number': function (topic) {
                assert.isNaN (topic);
            },
            'is not equal to itself': function (topic) {
                assert.notEqual (topic, topic);
            }
        }
    }
}).run();