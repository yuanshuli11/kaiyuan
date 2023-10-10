// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {

        flagNode: {
            default: null,
            type: cc.Node
        },
        nameNode: {
            default: null,
            type: cc.Node
        },

        areaNode: {
            default: null,
            type: cc.Node
        },
        campNode: {
            default: null,
            type: cc.Node
        },
        contextNode: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:
    setRandName() {
        var _this = this
        if (this.randNum != undefined && this.randNames && this.randNum < this.randNames.length) {
            this.nameNode.getComponent('VLayoutInputItem').setInputValue(this.randNames[this.randNum])
            this.randNum++
            return
        }
        this.context.api.getRandNames(cc, "user", 0, function (res) {
            if (!res || res.length <= 0) {
                return
            }
            _this.randNum = 0
            _this.randNames = res
            _this.setRandName()
        })
    },
    onLoad() {
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }
        this.context.resetFitView(this.node)

        var nodeObj = this.areaNode.getComponent('VLayoutSelectorItem')
        var areaData = { "value": [{ "value": 0, "text": "西方大陆" }, { "value": 1, "text": "东方大陆" }, { "value": 2, "text": "中洋大陆" }, { "value": 3, "text": "酋北大陆" }, { "value": 4, "text": "南澳大陆" }, { "value": 5, "text": "美西大陆" }] }
        nodeObj.init("区域:", areaData)
        this.areaNode.zIndex = 100

        var nodeObj = this.campNode.getComponent('VLayoutRadioItem')
        var campData = { "list": [{ "text": "盟军", "value": 0 }, { "text": "轴心", "value": 1 }] }
        nodeObj.init("阵营:", campData)

        this.setRandName()
    },
    start() {
        this.context.AddHeaderUIUI(this.node)
    },
    onSubmit() {
 

        var name = this.nameNode.getComponent('VLayoutInputItem').getValue()
        var camp = this.campNode.getComponent('VLayoutRadioItem').getValue()
        var flag = this.flagNode.getComponent('VLayoutInputItem').getValue()
        var area = this.areaNode.getComponent('VLayoutSelectorItem').getValue()
        if (!name) {
            this.context.Toast("昵称不能为空")
            return
        }
        if (!flag) {
            this.context.Toast("旗号不能为空")
            return
        }
        if (area === "") {
            this.context.Toast("请选择区域")
            return
        }
       
        this.context.api.initUser(cc, name, flag, area, camp, () => {
            cc.props.IsNew = true
            this.context.skipScene("Main")
        }, (errMsg) => {
            this.context.Toast(errMsg)
        })

    },
   
    // LIFE-CYCLE CALLBACKS:
    onFlush() {
        this.setRandName()
    },
    // update (dt) {},
});
