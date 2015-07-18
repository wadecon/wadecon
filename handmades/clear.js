// 글로벌 스코프에서 실행
// (주로 테스트를 위한) 디렉토리 초기화 작업
module.exports = function(global) {
    var set = require('../setting.json');
    var fs = require("fs-extra");
    set.clearData = true;

    try {
        fs.remove(__dirname + '/../public/images/users/*', function(err) {
            if(err) throw err;
            else console.log('public/images/users/* 삭제'.cyan);
        });
        fs.remove(__dirname + '/../public/userbios/*', function(err) {
            if(err) throw err;
            else console.log('public/userbios/* 삭제'.cyan);
        });
        fs.remove(__dirname + '/../public/workpage/*', function(err) {
            if(err) throw err;
            else console.log('public/workpage/* 삭제'.cyan);
        });
    } catch(err) {
        console.error("  ㄴERROR".red, err);
    }
};