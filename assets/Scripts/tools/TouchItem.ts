// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class TouchItem extends cc.Component {




    // LIFE-CYCLE CALLBACKS:
    callback(event, type) {

    }
    init(defaultX, defaultY, callback) {
        if (defaultX || defaultX === 0) {
            this.node.x = defaultX
        }
        if (defaultY || defaultY === 0) {
            this.node.y = defaultY
        }
        this.callback = callback
    }

    start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        //想达到按住节点，节点才能移动的效果，将监听函数注册到 this.node 上，去掉  .parent 即可
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        if (cc.props.TouchNodeLoc && cc.props.TouchNodeLoc[this.node.name]) {
            this.node.y = cc.props.TouchNodeLoc[this.node.name]
        }
    }
    //开始触摸移动；
    onTouchStart(event) {

        var touches = event.getTouches();
        this.startPos = touches[0].getStartLocation()
        this.callback(cc.Node.EventType.TOUCH_START, event)
    }
    //触摸移动；
    onTouchMove(event) {
        var touches = event.getTouches();
        var endPos = touches[0].getStartLocation()

        // //触摸刚开始的位置
        // var oldPos = self.BodyNode.parent.convertToNodeSpaceAR(touches[0].getStartLocation());
        // //触摸时不断变更的位置
        var touches = event.getTouches();
        var newPos = touches[0].getLocation()
        var nPos = event.currentTarget.getPosition(); //节点实时坐标；
        if (Math.abs(this.startPos.x - newPos.x) > 1) {
            nPos.x -= (this.startPos.x - newPos.x)
            this.startPos.x = newPos.x

        }

        if (Math.abs(this.startPos.y - newPos.y) > 1) {
            nPos.y -= (this.startPos.y - newPos.y)
            this.startPos.y = newPos.y
        }

        event.currentTarget.setPosition(nPos);

        if (!this.hasTouch && (Math.abs(this.startPos.x - endPos.x) > 5 || Math.abs(this.startPos.y - endPos.y) > 5)) {
            this.hasTouch = true
        }
        this.callback(cc.Node.EventType.TOUCH_MOVE, event)

    }
    onTouchEnd(event) {
        let nodePos = event.currentTarget.getPosition(); //获取触摸结束之后的node坐标；
        cc.tween(event.currentTarget).to(0.2, { x: cc.view.getVisibleSize().width / 2 - 20 }).start();
        if (!cc.props.TouchNodeLoc) {
            cc.props.TouchNodeLoc = {}
        }
        cc.props.TouchNodeLoc[this.node.name] = nodePos.y
        this.callback(cc.Node.EventType.TOUCH_END, event)

    }

    onTouchCancel() {
        this.callback(cc.Node.EventType.TOUCH_CANCEL, event)

    }
    // update (dt) {}
}
