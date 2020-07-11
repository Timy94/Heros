//辅助响应类，用于简化响应输出
let AuxRes = module.exports = function (res, success) {
    if (!AuxRes.prototype.fail) {
        AuxRes.prototype = { //原型初始化
            constructor: AuxRes,
            failObj: { //异常对象
                code: 500,
                msg: '服务器异常'
            },
            fail: function () { //原型挂载异常回调
                res.status(500).json(this.failObj); //响应异常信息
            }
        };
    }
    if (!(this instanceof AuxRes)) return new AuxRes(res, success); //去 new 化
    this.success = success; //实例个性化成功回调
};