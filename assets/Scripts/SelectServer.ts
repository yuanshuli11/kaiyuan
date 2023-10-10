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
    @property(cc.Node)
    serverSelector: cc.Node = null;
    @property(cc.Node)
    wxButton: cc.Node = null;
    onLoad() {
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }
        this.context.resetFitView(this.node)

    }
    serverSelectorObj: null;
    start() {
        if (!cc.props.ServerList) {
            cc.director.loadScene("Login");
            return
        }
        this.serverSelectorObj = this.serverSelector.getComponent('VLayoutSelectorItem')
        this.serverSelectorObj.init("", {
            "value": cc.props.ServerList
        })
        if (cc.props.logininfo.last_server) {
            this.serverSelectorObj.setSelectedItem(cc.props.logininfo.last_server, cc.props.serverMap[cc.props.logininfo.last_server])

        }
        this.context.AddHeaderUI(this.node)
    }
    // LIFE-CYCLE CALLBACKS: 
    onClick() {
        cc.props.ServerKey = this.serverSelectorObj.getValue()
        if (!cc.props.ServerKey) {
            this.context.Toast("请选择服务器")
            return
        }
        cc.props.ServerName = cc.props.serverMap[cc.props.ServerKey]

        this.context.skipScene("Main");
    }
    // update (dt) {}
}
