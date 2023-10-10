// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {

    context: null;

    onLoad() {
        cc.props = {}
        cc.props.base = {}
        cc.props.NowPage = "Login"
        cc.props.logininfo = {}
        if (cc.sys.platform == cc.sys.ANDROID) {
            cc.props.showAd = true
        }
        cc.props.fenxiangBegin = -1
        cc.props.homeInfo = {}
        cc.props.ServerKey = ""
        cc.props.AlowDestroy = false

        cc.game.setFrameRate(30);
        this.initInfo()

        //初始化basseEvent``
        var contextNode = cc.find("context")
        if (contextNode) {
            this.context = contextNode.getComponent('Ctx')
        } else {
            cc.director.loadScene("Loading");
        }
        this.context.init()

        window.context = this.context
        this.context.inini18("zh")

    }

    start() {
        if (this.context) {
            cc.director.loadScene("Login");
        }

    }
    // LIFE-CYCLE CALLBACKS:
    initInfo() {

        if (window.tt) {
            const { appId } = TMAConfig;
            cc.props.appID = appId
        } else if (window.qq) {
            cc.props.appID = "1112179633"
        } else if (window.wx) {
            cc.props.appID = window.wx.getAccountInfoSync().miniProgram.appId
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            cc.props.appID = "ios.game.wenzi.online"
        } else if (cc.sys.platform == cc.sys.ANDROID) {
            cc.props.appID = "android.game.wenzi.online"
        } else {
            cc.props.appID = "default"
        }
        cc.props.showAd = true //展示广告

        if (cc.sys.isBrowser || cc.props.appID == "wx9d7a39310aef047e" || cc.props.appID == "1112179633" || cc.props.appID == "android.game.wenzi.online") {
            cc.props.gameName = "家园二战"
            cc.props.iconURL = "https://cdn.wenzi.online/png/jiayuan_zidan.png"
            cc.props.host = "https://herogame.yuanshuli.com:8443"
            cc.props.fuwuxieyi = "https://cdn.wenzi.online/text/erzhan_fuwuxieyi.txt"
            cc.props.yinsixieyi = "https://cdn.wenzi.online/text/erzhan_yinsi.txt"
            cc.props.showLeiChong = true //展示充值

        } else {
            cc.props.gameName = "指尖二战"
            cc.props.iconURL = "https://cdn.wenzi.online/png/zhijian_zidan.png"
            cc.props.host = "https://game.wenzi.online"
            cc.props.fuwuxieyi = "https://cdn.wenzi.online/text/zhijian_fuwuxieyi.txt"
            cc.props.yinsixieyi = "https://cdn.wenzi.online/text/zhijian_yinsi.txt"
            cc.props.showLeiChong = false //展示充值
        }
        // IOS 特殊设置
        if (cc.sys.os === cc.sys.OS_IOS) {
            cc.props.AlowDestroy = true
        }

    }

}
