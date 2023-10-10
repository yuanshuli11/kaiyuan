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
        this.context.AddHeaderUI(this.node)

        if (!UserData.user.logininfo || !UserData.user.logininfo.user_id) {
            cc.director.loadScene("Login");
            return
        }
    }
    SendCode() {
        if (this.FlushNum > 0) {
            return
        }
        if (this.sendLock) {
            return
        }
        this.Lock = true
        var _this = this
        if (!this.accountInput.string) {
            _this.context.Toast("邮箱不能为空")
            return
        }
        this.context.api.sendResetPasswdMailCode(cc, this.accountInput.string, function () {
            _this.FlushNum = 1
            _this.Lock = false
            _this.FlushEndTime = _this.context.getServerTime() + 60
            _this.context.Toast("发送成功,请到邮箱查收")
        }, function (res) {
            _this.context.Toast(res)
            _this.FlushNum = 0
            _this.Lock = false

        })
    }
    onSubmit() {
        var data = {}
        var _this = this
        data.mail = this.accountInput.string
        if (!this.accountInput.string) {
            _this.context.Toast("邮箱不能为空")
            return
        }
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

        this.context.api.requestAPI(cc, "POST", "/user/wx/bindmail", data, function (res) {
            _this.context.Toast("绑定成功")
            cc.director.loadScene("Main");
        }, function (errMsg) {
            _this.context.Toast("绑定失败:" + errMsg)
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
