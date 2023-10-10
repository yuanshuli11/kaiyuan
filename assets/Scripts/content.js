// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {

        resTag: {
            default: null,
            type: cc.Node
        },
        officerPage: {
            default: null,
            type: cc.Node
        },
        officerTag: {
            default: null,
            type: cc.Node
        },
        armyTag: {
            default: null,
            type: cc.Node
        },
        defenseTag: {
            default: null,
            type: cc.Node
        },
        commandTag: {
            default: null,
            type: cc.Node
        },
        officerBodyItemFab: {
            default: null,
            type: cc.Prefab
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.NowTag = this.resTag
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
        // var officerObj = JSON.parse(`{"count":10,"offset":0,"list":[{"name":"埃隆·马斯克","star":5,"attack":15,"server":17,"tech":20,"level":1,"status":0},{"name":"埃隆·马斯克","star":5,"attack":15,"server":17,"tech":20,"level":1,"status":0},{"name":"埃隆·马斯克","star":5,"attack":15,"server":17,"tech":20,"level":1,"status":0},{"name":"埃隆·马斯克","star":5,"attack":15,"server":17,"tech":20,"level":1,"status":0}]}`)
        //this.showOfficer(officerObj.count,officerObj.offset,officerObj.list)
    },
    showOfficer(count, offset, listItem) {
        for (var i = 0; i < listItem.length; i++) {
            var newItem = cc.instantiate(this.officerBodyItemFab);
            // 将新增的节点添加到 Canvas 节点下面
            this.officerPage.addChild(newItem);
            newItem.getComponent('Bodyofficer').init(i, listItem[i])
        }

    },
    onTouchStart(event) {
        return true
    },
    onTouchMove(event) {

        var touchLoc = event.getDelta();
        if (this.node.x < -875) {
            this.node.x = -875
            return true
        }
        if (this.node.x > 875) {
            this.node.x = 875
            return true
        }
        this.node.x += touchLoc.x

        return true
    },
    onTouchEnd(event) {

        if (this.node.x < -525) {
            this.changeTag(4)
            cc.tween(this.node).to(0.2, { x: -700 }).start();
            return true
        }
        if (this.node.x > -525 && this.node.x < -175) {
            this.changeTag(3)
            cc.tween(this.node).to(0.2, { x: -350 }).start();
            return true
        }

        if (this.node.x > -175 && this.node.x < 175) {
            this.changeTag(2)
            cc.tween(this.node).to(0.2, { x: 0 }).start();
            return true
        }
        if (this.node.x > 175 && this.node.x < 525) {
            this.changeTag(1)
            cc.tween(this.node).to(0.2, { x: 350 }).start();
            return true
        }
        if (this.node.x > 525) {
            this.changeTag(0)
            cc.tween(this.node).to(0.2, { x: 700 }).start();
            return true
        }

        return true
    },
    changeTag(i) {
        this.NowTag.opacity = 50
        if (i == 0) {
            this.resTag.opacity = 150;
            this.NowTag = this.resTag
        } else if (i == 1) {
            this.officerTag.opacity = 150;
            this.NowTag = this.officerTag
        } else if (i == 2) {
            this.armyTag.opacity = 150;
            this.NowTag = this.armyTag
        } else if (i == 3) {
            this.defenseTag.opacity = 150;
            this.NowTag = this.defenseTag
        } else if (i == 4) {
            this.commandTag.opacity = 150;
            this.NowTag = this.commandTag
        }
    },
    start() {

    },

    // update (dt) {},
});
