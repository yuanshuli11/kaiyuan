// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        VLayoutNode: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.timeNum = 0

        this.nowPage = 0
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }
        this.context.resetFitView(this.node)


        this.VLayoutNewNodeObj = this.VLayoutNode.getComponent('VLayout')
        this.VLayoutNewNodeObj.init(this)
        this.resetBody()
    },
    resetBody() {
        var _this = this

        if (window.qg) {

            this.VLayoutNewNodeObj.addNewLine("text", "", { "text": "    点击查看《隐私协议》" }, function () {
                const { XIEYI } = require("./yinsi/text")

                var alter2Node = _this.context.NewAlert2()
                let eventNodeItem = _this.context.newAlertItem()
                alter2Node.InitAlert("隐私协议", "关闭")
                alter2Node.addNewLine("wrap_high_text", "", { "text": XIEYI })

                alter2Node.OnButtonFunc = function () {
                    alter2Node.onButtonCancel()
                }
                alter2Node.btnCancel.active = false
                //alter2Node.AddButton(eventNodeItem.funcs["refuseXieyi"])
                alter2Node.Alert()
            })


        }
        if (window.qq) {
            this.VLayoutNewNodeObj.addNewLine("text", "", { "text": "欢迎加入玩家群:" })
            this.VLayoutNewNodeObj.addNewLine("text", "", { "text": "点击进群>>", "cusButtonText": "复制", "textClick": true }, function () {
                qq.openGroupProfile({
                    groupId: '669795039',
                    success(res) {
                        console.log("openGroupProfile success", res)
                    },
                    fail(res) {
                        console.log("openGroupProfile fail", res)

                    },
                    complete(res) {
                        console.log("openGroupProfile complete", res)

                    }
                });
            })

            // } else if (!window.tt && !window.qg && !window.qq) {
            //     this.VLayoutNewNodeObj.addNewLine("text", "", { "text": "欢迎联系我加入玩家群" })

            //     this.VLayoutNewNodeObj.addNewLine("text", "", { "text": "点击复制我的微信号>>", "cusButtonText": "复制", "textClick": true }, function () {
            //         _this.context.WebCopyString(_this.context, "onegame2022")
            //     })
            // } else if (window.tt) {
            //     // this.VLayoutNewNodeObj.addNewLine("text", "", { "text": "欢迎联系我加入玩家群" })

            //     // this.VLayoutNewNodeObj.addNewLine("text", "", { "text": "点击复制我的QQ号>>", "cusButtonText": "复制", "textClick": true }, function () {
            //     //     _this.context.WebCopyString(_this.context, "onegame2022")
            //     // })
            // }
        }
        this.VLayoutNewNodeObj.addNewLine("wrap_high_text", "玩法", { "text": this.context.dict.play })


        this.VLayoutNewNodeObj.addNewLine("footer", "footer", { "doButtonText": "" }, function () {
        })

    },

    start() {
        if (window.wx && window.wx.reportEvent) {
            wx.reportEvent('expt_playpage_show', { expt_data: 1 })
        }
        // 显示页面的Footer
        this.context.AddHeaderUI(this.node)
        this.context.AddFooterV3(this.node)
    },

    // update (dt) {},
});
