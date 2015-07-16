var vows = require('vows');
var assert = require('assert');

var redisMod = require("../redisMod.js");

var suite = vows.describe("redisMod");

// suite.addBatch({
//     'redisMod.useRedis':{
//         topic: function(){
//             redisMod.useRedis()
//         },
        
//         'expected behavior': function(topic){
            
//         },
//         'expected behavior2': function(topic){
            
//         },
//     }
// });

suite.addBatch({
    'setSession으로 세션을 설정하면': {
        topic: function() {
            redisMod.setSession(0, 600, {
                nickname: "nickname",
                email: "email",
                name: "name",
                picture: "picture",
                bio: "bio",
                karma: 1000000,
                fbId: "fbId",
                fbToken: "fbToken",
                createdAt: "fuck",
                updatedAt: "yeah"
            }, this.callback);
        },
        
        'setSession은 널을 반환한다': function(shouldBeNull) {
            assert.equal(shouldBeNull, 1);
        }
    }
})
.addBatch({
    'redisMod.getSession':{
        topic: function(){
            redisMod.getSession(0, this.callback);
        },
        '어쩌라는 건지 모르겠다': function(obj){
            assert.equal(obj.nickname, null);
        }
        // 'getSession에서 setSession에서 설정한 값을 불러올때': {
        //     topic: function(obj){
        //         return obj
        //     },
        //     '반환된 값이 없다': function(obj){
        //         assert.equal(obj, null);
        //     },
        //     '닉네임이 다르다': function(obj) {
        //         assert.equal(obj.nickname, "nickname");
        //     },
        //     '이메일이 다르다': function(obj) {
        //         assert.equal(obj.email, "email");
        //     },
        //     '이름이 다르다': function(obj) {
        //         assert.equal(obj.name, "name");    
        //     },
        //     '사진이 다르다': function(obj) {
        //         assert.equal(obj.picture, "picture");
        //     },
        //     '잘난척이 다르다': function(obj) {
        //         assert.equal(obj.bio, "bio");
        //     },
        //     '업보가 다르다': function(obj) {
        //         assert.equal(obj.karma, 1000000);
        //     },
        //     'fbId가 다르다': function(obj){
        //         assert.equal(obj.fbId, "fbId");
        //     },
        //     'fbToken이 다르다': function(obj){
        //         assert.equal(obj.fbToekn, "fbToken");
        //     },
        //     'createdAt이 다르다': function(obj){
        //         assert.equal(obj.createdAt, "0000:00:00");
        //     },
        //     'updatedAt이 다르다': function(obj){
        //         assert.equal(obj.updatedAt, "0000:00:00");
        //     }
        // }
    }
}).run();

// suite.addBatch({
//     'when dividing a number by zero': {
//         topic: function () { return 42 / 0 },

//         'we get Infinity': function (topic) {
//             assert.equal (topic, Infinity);
//         }
//     },
//     'but when dividing zero by zero': {
//         topic: function () { return 0 / 0 },

//         'we get a value which': {
//             'is not a number': function (topic) {
//                 assert.isNaN (topic);
//             },
//             'is not equal to itself': function (topic) {
//                 assert.notEqual (topic, topic);
//             }
//         }
//     }
// }); // Run it