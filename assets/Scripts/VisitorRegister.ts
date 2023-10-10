// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import { UserData } from './model/userdata';

@ccclass
export default class NewClass extends cc.Component {


    @property(cc.EditBox)
    accountInput: cc.EditBox = null;
    @property(cc.EditBox)
    passwdInput: cc.EditBox = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        //初始化basseEvent``

        var contextNode = cc.find("context")

        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }
        this.context.resetFitView(this.node)

    }
    flushVisitorAccount() {
        this.accountInput.string = this.getAccountString(8)
        this.passwdInput.string = this.getPasswdString()
    }
    getAccountString(len) {
        let randomNumberString = '';

        for (let i = 0; i < len; i++) {
            const randomNumber = Math.floor(Math.random() * 10); // 生成0到9之间的随机整数
            randomNumberString += randomNumber.toString(); // 将随机整数转换为字符串并添加到字符串末尾
        }
        return randomNumberString
        console.log(randomNumberString); // 输出随机数字字符串
    }
    getPasswdString() {
        let randomString = '';

        // 生成前3位小写英文字符
        for (let i = 0; i < 3; i++) {
            const randomCharCode = Math.floor(Math.random() * 26) + 97; // 生成97到122之间的随机整数，对应小写英文字母的ASCII码
            const randomChar = String.fromCharCode(randomCharCode); // 将随机整数转换为对应的字符
            randomString += randomChar;
        }

        // 生成后7位随机数字
        for (let i = 0; i < 7; i++) {
            const randomNumber = Math.floor(Math.random() * 10); // 生成0到9之间的随机整数
            randomString += randomNumber.toString(); // 将随机整数转换为字符串并添加到字符串末尾
        }
        return randomString
    }
    onBack() {
        cc.director.loadScene("Login");
    }
    start() {
        this.context.AddHeaderUI(this.node)
        this.flushVisitorAccount()
    }
    onRegister() {
        var data = {}
        var _this = this
        data.account = this.accountInput.string
        data.passwd = this.passwdInput.string
        var _this = this
        var t = "78361b0cb24e4b93b739c7e3aa28f013"
        cc.props.logininfo.token = undefined
        this.context.api.encryptData = {
            encryptKey: t.substring(20, 32) + t.substring(0, 20),
            iv: t.substring(10, 26),
        }
        this.context.api.requestAPI(cc, "POST", "/auth/visitor/register", data, function (res) {
            cc.props.logininfo = res
            cc.sys.localStorage.setItem("token", cc.props.logininfo.token)

            _this.context.loginInit(function () {
                cc.sys.localStorage.setItem("lastAccount", _this.accountInput.string)
                cc.sys.localStorage.setItem("lastPasswd", _this.passwdInput.string)
                UserData.init(_this.context, cc.props.logininfo, function () {
                    _this.context.skipScene("SelectServer")
                })
            })
        }, function (errMsg) {
            _this.context.Toast("登录信息错误:" + errMsg)
            return
        })
        // 
    }
    // update (dt) {}
}
