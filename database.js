module.exports = function(global) {
    var mysql = require("mysql");
    var Sqlize = require('Sequelize');
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
            type: Sqlize.STRING(256)
        }, //닉네임
        email: {
            type: Sqlize.STRING(256),
            allowNull: true
        },
        name: {
            type: Sqlize.STRING(256),
            allowNull: false
        }, //실제 이름
        picture: Sqlize.STRING(256), //path
        karma: { //업보
            type: Sqlize.INTEGER,
            defaultValue: 10000 },
        fbId: {
            type: Sqlize.STRING(20)
        },
        fbToken: {
            type: Sqlize.STRING(256)
        }
    });
    Works = sqlize.define('Works', {
        name: {
            type: Sqlize.STRING(256),
            allowNull: false
        }, //공작 이름
        desc: {
            type: Sqlize.STRING(256),
            allowNull: false
        }, //plain text
        needs: {
            type: Sqlize.STRING(256),
            allowNull: true
        }, //path
        frontboard: Sqlize.STRING(256) //path
    });
    Badges = sqlize.define('Badges', {
        name: {
            type: Sqlize.STRING(256),
            allowNull: false
        },
        desc: {
            type: Sqlize.STRING(256),
            allowNull: false
        }, //plain 
        picture: Sqlize.STRING(256), //path
        karma: {
            type: Sqlize.INTEGER,
            allowNull: false,
            defaultValue: 0
        }, // 업보 가감
    });
    
    // M:N 테이블의 정의와 관계 설정
    Logs = sqlize.define('Logs', {
        userId: {
            type: Sqlize.INTEGER,
            primaryKey: true
        },
        workId: {
            type: Sqlize.INTEGER,
            primaryKey: true
        },
        text: Sqlize.STRING(141), //트위터보다 1자 더 지원합니다
    });
    Users.belongsToMany(Works, {foreignKey: 'userId', through: 'Logs'});
    Works.belongsToMany(Users, {foreignKey: ['workId', 'name'], through: 'Logs'});
    
    Joins = sqlize.define('Joins', {
        userId: {
            type: Sqlize.INTEGER,
            primaryKey: true
        },
        workId: {
            type: Sqlize.INTEGER,
            primaryKey: true
        }
    });
    Users.belongsToMany(Works, {foreignKey: 'userId', through: 'Joins'});
    Works.belongsToMany(Users, {foreignKey: ['workId', 'name'], through: 'Joins'});

    BadgeMaps = sqlize.define('BadgeMaps', {
        userId: {
            type: Sqlize.INTEGER,
            primaryKey: true
        },
        badgeId: {
            type: Sqlize.INTEGER,
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
