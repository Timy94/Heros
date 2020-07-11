const fs = require('fs');
const path = require('path');

module.exports = {
    /**
     * @msg: [get 获取数据]
     * @param {object} option [fail失败回调,success成功回调]
     */
    get: function (option) {
        fs.readFile(path.join(__dirname, './data/users.json'), 'utf-8', (err, data) => {
            let method = err ? 'fail' : 'success';
            option[method] && option[method](err || JSON.parse(data));
        });
    },
    /**
     * @msg: [set 写入数据]
     * @param {object} option [fail失败回调,success成功回调]
     */
    set: function (option) { //写入数据
        fs.writeFile(path.join(__dirname, './data/users.json'), option.content, (err) => {
            let method = err ? 'fail' : 'success';
            option[method] && option[method](err);
        })
    },
    /**
     * @msg: [modify 修改数据]
     * @param {object} option [fail失败回调,success成功回调,process数据处理函数]
     */
    modify: function (option) {
        this.get({
            ...option,
            success: arr => {
                arr = option.process(arr); //进行数据处理
                this.set({
                    ...option,
                    content: JSON.stringify(arr, null, 4) //重新写入数据
                });
            }
        });
    },
    /**
     * @msg: [queryUser 查询用户]
     * @param {object} obj 要查询的用户
     * @param {object} option [fail失败回调,success成功回调]
     */
    queryUser: function (obj, option) {
        this.get({
            ...option,
            success: arr => {
                let userData = arr.filter(v => { //查询是否存在相同项
                    let keys = Object.keys(obj); //获取obj所有键
                    return keys.every(k => v[k] == obj[k]); //对obj所有键逐一检测
                })[0];
                option.success && option.success(userData || null); //查询到则传出用户数据，否则传出null
            }
        })
    },
    /**
     * @msg: [registUser 注册用户]
     * @param {object} obj 要注册的用户
     * @param {object} option [fail失败回调,success成功回调]
     */
    registUser: function (obj, option) {
        this.modify({
            ...option,
            process: arr => {
                obj.heros = []; //初始化英雄池    
                arr.unshift(obj); //进入用户列表
                return arr;
            }
        });
    },
    /**
     * @msg: [accessHero 访问指定用户的英雄列表]
     * @param {string} username 指定用户
     * @param {object} option [fail失败回调,success成功回调]
     */
    accessUser: function (username, option) {
        this.modify({
            ...option,
            process: arr => {
                arr.some((user, i) => {
                    if (user.username == username) { //遍历寻找对应username的数据
                        arr[i].heros = option.process(user.heros); //处理该用户英雄列表，并返回结果
                        return true;
                    }
                });
                return arr; //返回数组，存入文件
            }
        })
    },
    /**
     * @msg: [getHeros 获取英雄列表]
     * @param {string} username 指定用户
     * @param {object} option [fail失败回调,success成功回调]
     */
    getHeros: function (username, option) {
        this.get({
            ...option,
            success: arr => {
                arr = arr.filter(v => v.username == username); //筛选出符合条件的用户
                let heros = arr[0] ? arr[0].heros : []; //没有用户则英雄数组为空数组
                if (heros.length) heros = heros.filter(v => !v.isDelete); //过滤掉软删除英雄
                option.success && option.success(heros); //传出英雄列表
            }
        })
    },
    /**
     * @msg: [addHero 实现英雄添加]
     * @param {string} username 指定用户
     * @param {object} hero 英雄信息
     * @param {object} option [fail失败回调,success成功回调]
     */
    addHero: function (username, hero, option) {
        this.accessUser(username, { //访问指定用户
            ...option,
            process: heros => { //处理该用户数据
                hero.id = Math.max(...heros.map(v => +v.id), 1) + 1; //设置新增的英雄id，最大id+1
                heros.unshift(hero); //新增英雄进入英雄列表
                return heros; //返回处理后的英雄列表，存入文件
            }
        })
    },
    /**
     * @msg: [editHero 实现英雄编辑]
     * @param {string} username 指定用户
     * @param {object} hero 英雄信息
     * @param {object} option [fail失败回调,success成功回调]
     */
    editHero: function (username, hero, option) {
        this.accessUser(username, { //访问用户
            ...option,
            process: heros => {
                heros.some((v, i) => { //遍历该用户英雄列表
                    if (v.id == hero.id) {
                        heros[i] = Object.assign(v, hero); //相同id的英雄进行扩展
                        return true; //结束遍历
                    }
                });
                return heros;
            }
        })
    },
    /**
     * @msg: [editHero 实现英雄删除]
     * @param {string} username 指定用户
     * @param {string} id 英雄id
     * @param {object} option [fail失败回调,success成功回调]
     */
    deleteHero: function (username, id, option) {
        this.accessUser(username, { //指定用户
            ...option,
            process: heros => {
                heros.some(v => { //遍历该用户英雄列表
                    if (v.id == id) return v.isDelete = true; //找到对应id英雄进行软删除
                });
                return heros;
            }
        })
    }
}