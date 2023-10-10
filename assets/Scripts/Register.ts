// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html
import { UserData } from './model/userdata';

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    accountInput: cc.EditBox = null;
    @property(cc.EditBox)
    codeInput: cc.EditBox = null;
    @property(cc.EditBox)
    passwdInput: cc.EditBox = null;
    @property(cc.EditBox)
    rePasswdInput: cc.EditBox = null;
    @property(cc.Button)
    sendCodeButton: cc.Button = null;
    FlushNum: 0;
    @property(cc.Label)
    sendText: cc.Label = null;
    onBack() {
        cc.director.loadScene("Login");
    }

    onLoad() {
        //初始化basseEvent``
        this.FlushNum = 0
        this.FlushEndTime = 0

        var contextNode = cc.find("context")

        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }
        this.context.resetFitView(this.node)


    }

    start() {
        this.context.AddHeaderUI(this.node)
    }
    SendCode() {
        if (!this.accountInput.string) {
            this.context.Toast("请填写邮箱地址")
            return
        }
        if (this.FlushNum > 0) {
            return
        }
        var _this = this
        this.context.api.sendMailCode(cc, this.accountInput.string, function () {
            _this.FlushNum = 1
            _this.FlushEndTime = _this.context.getServerTime() + 60
            _this.context.Toast("发送成功,请到邮箱查收")
        }, function (res) {
            _this.context.Toast(res)

        })
    }
    onRegister() {
        var data = {}
        var _this = this
        data.account = this.accountInput.string
        data.passwd = this.passwdInput.string
        if (!this.accountInput.string || !this.codeInput.string) {
            _this.context.Toast("账号和验证码必填")
            return
        }
        data.code = this.codeInput.string
        if (this.passwdInput.string != this.rePasswdInput.string) {
            _this.context.Toast("两次密码不一致，请重新输入")
            return
        }
        var _this = this
        var t = "78361b0cb24e4b93b739c7e3aa28f013"
        cc.props.logininfo.token = undefined
        this.context.api.encryptData = {
            encryptKey: t.substring(20, 32) + t.substring(0, 20),
            iv: t.substring(10, 26),
        }
        this.context.api.requestAPI(cc, "POST", "/auth/register", data, function (res) {
            cc.props.logininfo = res
            _this.context.loginInit(function () {
                cc.sys.localStorage.setItem("lastAccount", this.accountInput.string)
                cc.sys.localStorage.setItem("lastPasswd", this.passwdInput.string)
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
    flushCodeButton() {
        var gap = this.FlushEndTime - this.context.getServerTime()
        if (gap <= 0) {
            this.FlushNum = 0
            this.sendText.string = "发送"
        } else {
            //this.sendCodeButton.node = ""
            this.sendText.string = gap + "s"
        }
    }
    update(dt) {

        if (this.FlushNum > 0) {
            this.FlushNum++
            if (this.FlushNum % 30 == 0) {
                this.flushCodeButton()
            }
        }
    }
}
