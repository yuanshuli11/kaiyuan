// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        Title: {
            default: null,
            type: cc.Label
        },
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
        this.context.resetFitView(this.node)

        this.VLayoutNewNodeObj = this.VLayoutNode.getComponent('VLayout')
        this.VLayoutNewNodeObj.init(this)
        this.resetBody()
    },
    resetBody() {
        var _this = this
        this.context.api.exchangeInfo(cc, function (res) {

            if (!res || !res.max) {
                _this.VLayoutNewNodeObj.addNewLine("nocontent", "", { "value": "<color=#000000>还未建造交易所,去建造>></c>" }, function (event, attr) {
                    cc.props.NowPage = "ArmyBuilding"
                    _this.context.skipScene("Building");
                })
                return
            }
            _this.Title.string = res.title
            var alertItem = _this.context.newAlertItem()
            alertItem.data = res
            alertItem.context = _this.context
            _this.VLayoutNewNodeObj.addNewLine("text_grid3", "标题", { "align": cc.Label.HorizontalAlign.CENTER, "text1": "资源", "text2": "储量", "text3": "单价" })
            _this.VLayoutNewNodeObj.addNewLine("text_grid3", "资源", { "text1": "黄金", "text2": res.gold, "text3": "--", "attr": { "type": "gold", "price": 0 } })
            _this.VLayoutNewNodeObj.addNewLine("text_grid3", "资源", { "text1": "粮食", "text2": res.food, "text3": res.food_price / 100, "attr": { "type": "food", "has_res": res.food, "price": res.food_price, "has_num": cc.props.cityRes.food }, "eventNodeItem": alertItem, "btn1Func": alertItem.funcs["buyResource"], "btn2Func": alertItem.funcs["sellResource"] })
            _this.VLayoutNewNodeObj.addNewLine("text_grid3", "资源", { "text1": "钢铁", "text2": res.steel, "text3": res.steel_price / 100, "attr": { "type": "steel", "has_res": res.steel, "price": res.steel_price, "has_num": cc.props.cityRes.steel }, "eventNodeItem": alertItem, "btn1Func": alertItem.funcs["buyResource"], "btn2Func": alertItem.funcs["sellResource"] })
            _this.VLayoutNewNodeObj.addNewLine("text_grid3", "资源", { "text1": "石油", "text2": res.oil, "text3": res.oil_price / 100, "attr": { "type": "oil", "has_res": res.oil, "price": res.oil_price, "has_num": cc.props.cityRes.oil }, "eventNodeItem": alertItem, "btn1Func": alertItem.funcs["buyResource"], "btn2Func": alertItem.funcs["sellResource"] })
            _this.VLayoutNewNodeObj.addNewLine("text_grid3", "资源", { "text1": "稀土", "text2": res.rare, "text3": res.rare_price / 100, "attr": { "type": "rare", "has_res": res.rare, "price": res.rare_price, "has_num": cc.props.cityRes.rare }, "eventNodeItem": alertItem, "btn1Func": alertItem.funcs["buyResource"], "btn2Func": alertItem.funcs["sellResource"] })
            _this.VLayoutNewNodeObj.addNewLine("text", "", { "text": "" })

            _this.VLayoutNewNodeObj.addNewLine("text", "", { "text": "   提示:资源价格每15分钟动态调整一次" })

        })



    },

    start() {
        // 显示页面的Footer
        this.context.AddHeaderUI(this.node)
        this.context.AddFooterV3(this.node)
    },

    // update (dt) {},
});
