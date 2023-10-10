// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        prePage: {
            default: null,
            type: cc.Node
        },
        nextPage: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    //page limit self
    resetTurnPage(page, limit, nodeObj, loadFuncName) {
        this.prePage.active = true
        this.nextPage.active = true


        this.dataNode = nodeObj
        this.nowPage = page
        this.setAble(this.prePage)
        this.setAble(this.nextPage)
        this.prePage.on('click', this.clickPrePage, this);
        this.nextPage.on('click', this.clickNextPage, this);
        if (nodeObj.dataInfo && nodeObj.dataInfo.length < limit) {
            this.prePage.active = false
            this.nextPage.active = false
            return
        }
        if (nodeObj.dataInfo && (nodeObj.dataInfo.length - (page + 1) * limit <= 0)) {
            this.setDisable(this.nextPage)
        }
        if (page == 0) {
            this.setDisable(this.prePage)
        }
        this.loadFuncName = loadFuncName
    },
    clickPrePage() {
        if (this.loadFuncName == "loadList") {
            this.dataNode.loadList(this.dataNode.dataInfo, this.nowPage - 1)
        } else if (this.loadFuncName == "ReloadCityArmies") {
            this.dataNode.ReloadCityArmies(this.dataNode.dataInfo, this.nowPage - 1)
        } else if (this.loadFuncName == "LoadPageRank") {
            this.dataNode.loadPageRank("", this.nowPage - 1)
        } else {
            this.dataNode.loadPage(this.nowPage - 1)

        }

    },
    clickNextPage() {

        if (this.loadFuncName == "loadList") {
            this.dataNode.loadList(this.dataNode.dataInfo, this.nowPage + 1)
        } else if (this.loadFuncName == "ReloadCityArmies") {
            this.dataNode.ReloadCityArmies(this.dataNode.dataInfo, this.nowPage + 1)
        } else if (this.loadFuncName == "LoadPageRank") {
            this.dataNode.loadPageRank(this.dataNode.tType, this.nowPage + 1)
        } else {
            this.dataNode.loadPage(this.nowPage + 1)

        }
    },
    setAble(node) {
        node.getComponent(cc.Button).interactable = true
    },
    setDisable(node) {
        node.getComponent(cc.Button).interactable = false
        //   node.off(cc.Node.EventType.TOUCH_END,this.onButtonDo,this)

    },
    nofunc() {

    },
    start() {

    },

    // update (dt) {},
});
