module.exports = function(global) {
    var set = require('./setting.json');
    var Sqlize = require('Sequelize');
    
    var DOMAIN = {
        SHORT_CHAR  : Sqlize.STRING(64),
        MIDDLE_CHAR : Sqlize.STRING(141),
        LONG_CHAR   : Sqlize.STRING(256),
        URL         : Sqlize.STRING(64),
        INT32       : Sqlize.INTEGER(32)
    };  // domain macros
    
    console.log("DB 접속 정보 : ".cyan, set.db.database, set.db.user, set.db.password);
    var sqlize = new Sqlize(set.db.database, set.db.user, set.db.password, {
        host :'localhost',
        port : 3306,
        log: false,
        define: {
            charset: 'utf8',
            timestamps: true,
            freezeTableName: true,
            id: true
        }
    });
    
    sqlize
      .authenticate()
      .then(function(err) {
        if(err) {
          console.log("DB 연결 실패".red, err);
        } else {
          console.log("DB 연결 성공".green);
        }
      });

    // 테이블들
    Users = sqlize.define('Users', {
        nickname: {
            type: DOMAIN.SHORT_CHAR
        }, //닉네임
        email: {
            type: DOMAIN.SHORT_CHAR,
            allowNull: true
        },
        name: {
            type: DOMAIN.SHORT_CHAR,
            allowNull: false
        }, //실제 이름
        picture: DOMAIN.URL, //path
        karma: { //업보
            type: DOMAIN.INT32,
            defaultValue: 1000000 },
        fbId: {
            type: DOMAIN.SHORT_CHAR
        },
        fbToken: {
            type: DOMAIN.LONG_CHAR
        }
    });
    Works = sqlize.define('Works', {
        name: {
            type: DOMAIN.SHORT_CHAR,
            allowNull: false
        }, //공작 이름
        desc: {
            type: DOMAIN.MIDDLE_CHAR,
            allowNull: false
        }, //plain text
        needs: {
            type: DOMAIN.MIDDLE_CHAR,
            allowNull: true
        }, //path
        frontboard: DOMAIN.URL //path
    });
    Badges = sqlize.define('Badges', {
        name: {
            type: DOMAIN.SHORT_CHAR,
            allowNull: false
        },
        desc: {
            type: DOMAIN.MIDDLE_CHAR,
            allowNull: false
        }, //plain 
        picture: DOMAIN.URL, //path
        karma: {
            type: DOMAIN.INT32,
            allowNull: false,
            defaultValue: 0
        }, // 업보 가감
    });
    
    // M:N 테이블의 정의와 관계 설정
    Logs = sqlize.define('Logs', {
        userId: {
            type: DOMAIN.INT32,
            primaryKey: true
        },
        workId: {
            type: DOMAIN.INT32,
            primaryKey: true
        },
        text: DOMAIN.MIDDLE_CHAR, //트위터보다 1자 더 지원합니다
    });
    Users.belongsToMany(Works, {foreignKey: 'userId', through: 'Logs'});
    Works.belongsToMany(Users, {foreignKey: ['workId', 'name'], through: 'Logs'});
    
    Joins = sqlize.define('Joins', {
        userId: {
            type: DOMAIN.INT32,
            primaryKey: true
        },
        workId: {
            type: DOMAIN.INT32,
            primaryKey: true
        }
    });
    Users.belongsToMany(Works, {foreignKey: 'userId', through: 'Joins'});
    Works.belongsToMany(Users, {foreignKey: ['workId', 'name'], through: 'Joins'});

    BadgeMaps = sqlize.define('BadgeMaps', {
        userId: {
            type: DOMAIN.INT32,
            primaryKey: true
        },
        badgeId: {
            type: DOMAIN.INT32,
            primaryKey: true
        }
    });
    Users.belongsToMany(Badges, {foreignKey: 'userId', through: 'BadgeMaps'});
    Badges.belongsToMany(Users, {foreignKey: 'badgeId', through: 'BadgeMaps'});

    
    //DB 싱크 : 테이블 없으면 생성 그리고 동기화
    Users.sync();
    Works.sync();
    Badges.sync();
    Logs.sync();
    Joins.sync();
    BadgeMaps.sync();
    // Users.sync({force: true});
    // Works.sync({force: true});
    // Badges.sync({force: true});
    // Logs.sync({force: true});
    // Joins.sync({force: true});
    // BadgeMaps.sync({force: true});
};
