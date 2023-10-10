// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        textNode: {
            default: null,
            type: cc.Label
        },
    },

    // LIFE-CYCLE CALLBACKS:
    Toast(text) {
        if (this.lock) {
            return
        }
        var _this = this
        this.lock = true
        this.node.active = true
        this.node.opacity = 255
        this.textNode.string = text
        this.node.zIndex = cc.macro.MAX_ZINDEX
        cc.tween(this.node)
            .to(2, { opacity: 0 })
            .call(() => {
                _this.node.active = false
                _this.lock = false
            })
            .start()

    },

    // update (dt) {},
});
