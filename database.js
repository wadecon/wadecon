database = function(global) {
    var Sqlize = require('Sequelize');
    console.log("DB 접속 정보 : ".cyan, set.db.database, set.db.user, set.db.password);
    var sqlize = new Sqlize(set.db.database, set.db.user, set.db.password, {
        host :'localhost',
        port : 3306,
        dialect: 'mysql',
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
        email: Sqlize.STRING(256),
        name: Sqlize.STRING(256), //실제 이름
        image: Sqlize.STRING(256), //path
        karma: { //업보
            type: Sqlize.INTEGER,
            defaultValue: 10000 }
    });
    Works = sqlize.define('Works', {
        name: {
            type: Sqlize.STRING(256)
        }, //공작 이름
        desc: Sqlize.STRING(256), //plain text
        needs: Sqlize.STRING(256), //path
        frontboard: Sqlize.STRING(256), //path
        dislike: Sqlize.INTEGER // 유저 싫어요의 총합
    });
    Badges = sqlize.define('Badges', {
        name: Sqlize.STRING(256),
        desc: Sqlize.STRING(256), //plain 
        image: Sqlize.STRING(256), //path
        karma: Sqlize.INTEGER // 업보 가감
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
    Works.belongsToMany(Users, {foreignKey: 'workId', through: 'Logs'});
    
    Joins = sqlize.define('Joins', {
        userId: Sqlize.INTEGER,
        workId: Sqlize.INTEGER
    });
    Users.belongsToMany(Works, {foreignKey: 'userId', through: 'Joins'});
    Works.belongsToMany(Users, {foreignKey: 'workId', through: 'Joins'});

    BadgeMaps = sqlize.define('BadgeMaps', {
        userId: Sqlize.INTEGER,
        BadgeId: Sqlize.INTEGER
    });
    Users.belongsToMany(Badges, {foreignKey: 'userId', through: 'BadgeMaps'});
    Badges.belongsToMany(Users, {foreignKey: 'BadgeId', through: 'BadgeMaps'});

    Comments = sqlize.define('Comments', {
        userId: Sqlize.INTEGER,
        workId: Sqlize.INTEGER,
        parentId: Sqlize.INTEGER,
        text: Sqlize.STRING(1024)
    });
    Users.belongsToMany(Works, {foreignKey: 'userId', through: 'Comments'});
    Works.belongsToMany(Users, {foreignKey: 'workId', through: 'Comments'});
    //DB 싱크 : 테이블 없으면 생성 그리고 동기화
    Users.sync();
    Works.sync();
    Badges.sync();
    Logs.sync();
    Joins.sync();
    BadgeMaps.sync();
    Comments.sync();
    // Users.sync({force: true});
    // Works.sync({force: true});
    // Badges.sync({force: true});
    // Logs.sync({force: true});
    // Joins.sync({force: true});
    // BadgeMaps.sync({force: true});
};

module.exports = database;
