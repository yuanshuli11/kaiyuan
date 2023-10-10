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

    @property(cc.Label)
    accountInput: cc.Label = null;
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
        cc.director.loadScene("Main");
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
        this.accountInput.string = UserData.user.logininfo.account
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
        this.context.api.sendResetPasswdMailCode(cc, this.accountInput.string, function () {
            _this.FlushNum = 1
            _this.FlushEndTime = _this.context.getServerTime() + 60
            _this.context.Toast("发送成功,请到邮箱查收")
        }, function (res) {
            _this.context.Toast(res)

        })
    }
    onSubmit() {
        var data = {}
        var _this = this
        data.passwd = this.passwdInput.string
        if (!this.codeInput.string) {
            _this.context.Toast("验证码必填")
            return
        }
        data.code = this.codeInput.string
        if (this.passwdInput.string != this.rePasswdInput.string) {
            _this.context.Toast("两次密码不一致，请重新输入")
            return
        }

        this.context.api.requestAPI(cc, "POST", "/user/passwd/reset", data, function (res) {
            _this.context.Toast("修改成功")

            cc.director.loadScene("Login");
        }, function (errMsg) {
            _this.context.Toast("重置密码失败:" + errMsg)
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
