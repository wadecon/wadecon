module.exports = function(global) {
    var Sqlize = require('sequelize');
    var set = require('./setting.json');
    
    var DOMAIN = {
        SHORT_CHAR  : Sqlize.STRING(32),
        MIDDLE_CHAR : Sqlize.STRING(141),
        LONG_CHAR   : Sqlize.STRING(256),
        URL         : Sqlize.STRING(64),
        INT32       : Sqlize.INTEGER(32),
        INT         : Sqlize.INTEGER,
        BOOLEAN     : Sqlize.BOOLEAN,
        DATE        : Sqlize.DATE
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
        bio: {
            type: DOMAIN.URL,
            allowNull: true
        },
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
            allowNull: false,
            unique: true
        }, //공작 이름
        desc: {
            type: DOMAIN.MIDDLE_CHAR,
            allowNull: false
        }, //plain text
        dislikes:{
            type: DOMAIN.INT,
            defaultValue: 0,
            allowNull: false
        },
        startTime: {
            type: DOMAIN.DATE,
            allowNull: true
        },
        endTime: {
            type: DOMAIN.DATE,
            allowNull: true
        }
    });
    Badges = sqlize.define('Badges', {
        name: {
            type: DOMAIN.SHORT_CHAR,
            unique: true,
            primaryKey: true
        },
        desc: {
            type: DOMAIN.MIDDLE_CHAR,
            allowNull: false
        }, //plain 
        karma: {
            type: DOMAIN.INT,
            allowNull: false,
            defaultValue: 0
        }, // 업보 가감
        multi: {
            type: DOMAIN.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
    
    // M:N 테이블의 정의와 관계 설정
    Logs = sqlize.define('Logs', {
        // logId:{
        //     type: DOMAIN.INT,
        //     primaryKey: true,
        //     autoIncrement: true    
        // },
        userId: {
            type: DOMAIN.INT,
            primaryKey: true
        },
        workId: {
            type: DOMAIN.INT,
            primaryKey: true
        },
        text: {
            type: DOMAIN.MIDDLE_CHAR //트위터보다 1자 더 지원합니다
        }
    });
    
    Dislikes = sqlize.define('Dislikes', {
        userId: {
            type: DOMAIN.INT,
            primaryKey: true
        },
        workId: {
            type: DOMAIN.INT,
            primaryKey: true
        }
    });
    
    Joins = sqlize.define('Joins', {
        userId: {
            type: DOMAIN.INT,
            primaryKey: true
        },
        workId: {
            type: DOMAIN.INT,
            primaryKey: true
        },
        owns: {
            type: DOMAIN.BOOLEAN,
            allowNull: false
        },
        roles: {
            type: DOMAIN.SHORT_CHAR,
            allowNull: true
        }
    });

    BadgeMaps = sqlize.define('BadgeMaps', {
        userId: {
            type: DOMAIN.INT,
            primaryKey: true
        },
        badgeId: {
            type: DOMAIN.INT,
            primaryKey: true
        },
        count: {
            type: DOMAIN.INT,
            defaultValue: 1
        }
    });

    Notices = sqlize.define('Notices', {
        userId: {
            type: DOMAIN.INT,
            primaryKey: true
        },
        // msgId:{
        //     type: DOMAIN.INT,
        //     primaryKey: true,
        //     autoIncrement: true
        // },
        msg: {
            type: DOMAIN.MIDDLE_CHAR,
            allowNull: false
        },
        unread: {
            type: DOMAIN.BOOLEAN,
            defaultValue: true,
            allowNull: false
        }
    });
    
    Users.belongsToMany(Works, {foreignKey: 'userId', through: 'Logs'});
    Works.belongsToMany(Users, {foreignKey: 'workId', through: 'Logs'});
    
    Users.belongsToMany(Works, {foreignKey: 'userId', through: 'Dislikes'});
    Works.belongsToMany(Users, {foreignKey: 'workId', through: 'Dislikes'});
    
    Users.belongsToMany(Works, {foreignKey: 'userId', through: 'Joins'});
    Works.belongsToMany(Users, {foreignKey: 'workId', through: 'Joins'});
    
    Users.belongsToMany(Badges, {foreignKey: 'userId', through: 'BadgeMaps'});
    Badges.belongsToMany(Users, {foreignKey: 'badgeId', through: 'BadgeMaps'});
    
    Users.belongsToMany(Notices, {foreignKey: 'userId', through: 'Notices'});
    
    //DB 싱크 : 테이블 없으면 생성 그리고 동기화
    Users.sync();
    Works.sync();
    Joins.sync();
    Badges.sync();
    Logs.sync();
    Dislikes.sync();
    BadgeMaps.sync();
    Notices.sync();
    // Users.sync({force: true});
    // Works.sync({force: true});
    // Badges.sync({force: true});
    // Dislikes.sync({force: true});
    // Joins.sync({force: true});
    // Logs.sync({force: true});
    // BadgeMaps.sync({force: true});
    // Notices.sync({force: true});
};
