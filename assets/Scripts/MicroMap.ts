// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import MicroMapItem from './map/microMapItem';
import { UserData } from './model/userdata';

@ccclass
export default class NewClass extends cc.Component {


    @property(cc.Node)
    bodyNode: cc.Node = null;
    @property(cc.Node)
    mapAreaNode: cc.Node = null;
    @property(cc.Slider)
    sliderHandler: cc.Slider = null;

    // LIFE-CYCLE CALLBACKS:
    startPos: cc.Vec2;
    nodePos: cc.Vec2;

    @property(cc.Prefab)
    areaMap: cc.Prefab;

    context: null;
    onLoad() {

        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }
        this.context.resetFitView(this.node)

    }
    start() {
        var _this = this
        this.nodePos = this.mapAreaNode.getPosition();
        //触摸监听(this.node.parent是屏幕)
        //想达到按住节点，节点才能移动的效果，将监听函数注册到 this.node 上，去掉  .parent 即可
        this.mapAreaNode.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        //想达到按住节点，节点才能移动的效果，将监听函数注册到 this.node 上，去掉  .parent 即可
        this.mapAreaNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.mapAreaNode.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.mapAreaNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this.context.api.MapList(cc, cc.props.sourceID, 0, 0, function (res) {
            var num = _this.resetMapArea(res.list)
            _this.mapAreaNode.width = 66 * (num)
        }, function (err, errorNo) {
            _this.context.Toast(err)
            _this.lock = false
            _this.context.skipScene("Main")
        })
        // 显示页面的Footer
        this.context.AddFooterV3_2(this.node)
    }
    exitMap(ts) {
        var _this = this
        if (!cc.props.sourceID) {
            return
        }
        if (this.lock) {
            return
        }
        this.lock = true
        this.context.api.exitMap(cc, function (res) {
            _this.lock = false

            UserData.reloadHomeInfo("city", null)

            _this.context.skipScene("Main")
        }, function (err, errorNo) {
            _this.lock = false

            _this.context.Toast(err)
        })
    }
    resetMapArea(mapList) {
        this.cleanMap()
        var _this = this
        var d = 0
        for (var i = 0; i < mapList.length; i++) {
            if (mapList[i].lat == 0) {
                if (mapList[i].lng > d) {
                    d = mapList[i].lng
                }
            }
            //解决闭包问题
            (function (mapItem) {


                var newItem = cc.instantiate(_this.areaMap);
                newItem.getComponent(MicroMapItem).init(_this.context, mapItem)
                _this.mapAreaNode.addChild(newItem);
            })(mapList[i])
        }
        return d
    }
    shwoActivityHistory() {
        if (!cc.props.sourceID) {
            return
        }
        var _this = this
        this.context.api.GetActivityHistory(cc, cc.props.sourceID, function (res) {
            var alter2Node = _this.context.NewAlert5()
            alter2Node.InitAlert("战况详情", "关闭")
            var str = ""
            for (var i = 0; i < res.length; i++) {
                str += res[i] + "\n"
            }
            alter2Node.addNewLine("wrap_high_text", "", {
                "text": str
            })
            alter2Node.OnButtonFunc = alter2Node.onButtonCancel
            alter2Node.Alert()
        })

    }
    cleanMap() {
        if (this.mapAreaNode.children) {
            for (var i = 0; i < this.mapAreaNode.children.length; i++) {
                this.mapAreaNode.children[i].destroy()
            }
        }
    }
    onSlider(event) {
        if (this.sliderHandler.progress > 1) {
            this.sliderHandler.progress = 0.8
        } else if (this.sliderHandler.progress < 0.2) {
            this.sliderHandler.progress = 0.2
        }
        this.bodyNode.scale = this.sliderHandler.progress
    }

    //开始触摸移动；
    onTouchStart(event) {
        var touches = event.getTouches();
        this.context.AddHeaderUI(this.node)
        this.startPos = touches[0].getStartLocation()
    }
    //触摸移动；
    onTouchMove(event) {
        // console.log("===aaaaaa", event)
        var self = this;

        // //触摸刚开始的位置
        // var oldPos = self.BodyNode.parent.convertToNodeSpaceAR(touches[0].getStartLocation());
        // //触摸时不断变更的位置
        var touches = event.getTouches();
        var newPos = touches[0].getLocation()
        var nPos = self.mapAreaNode.getPosition(); //节点实时坐标；
        if (Math.abs(this.startPos.x - newPos.x) > 1) {
            nPos.x -= (this.startPos.x - newPos.x) / 2
            this.startPos.x = newPos.x
        }


        if (Math.abs(this.startPos.y - newPos.y) > 1) {
            nPos.y -= (this.startPos.y - newPos.y) / 2
            this.startPos.y = newPos.y
        }
        if (nPos.x < -this.mapAreaNode.width / 2) {
            nPos.x = -this.mapAreaNode.width / 2;
        };
        if (nPos.x > this.mapAreaNode.width / 2) {
            nPos.x = this.mapAreaNode.width / 2;
        };
        if (nPos.y < -this.mapAreaNode.height / 2) {
            nPos.y = -this.mapAreaNode.height / 2;
        };
        if (nPos.y > this.mapAreaNode.height / 2) {
            nPos.y = this.mapAreaNode.height / 2;
        };
        self.mapAreaNode.setPosition(nPos);


        // //var subPos = cc.pSub(oldPos,newPos); 1.X版本是cc.pSub

        // var subPos = oldPos.sub(newPos); // 2.X版本是 p1.sub(p2);

        // self.BodyNode.x = self.nodePos.x - subPos.x;
        // self.BodyNode.y = self.nodePos.y - subPos.y;

        // // 控制节点移不出屏幕; 
        // var minX = -self.BodyNode.parent.width / 2 + self.BodyNode.width / 2; //最小X坐标；
        // var maxX = Math.abs(minX);
        // var minY = -self.BodyNode.parent.height / 2 + self.BodyNode.height / 2; //最小Y坐标；
        // var maxY = Math.abs(minY);

    }
    backToHome() {
        cc.director.loadScene("Main");
    }
    showBattleInfo() {
        this.context.Toast("暂无战况")
    }
    reloadPage() {
        this.context.reloadPage()
    }
    onTouchEnd() {
        this.nodePos = this.mapAreaNode.getPosition(); //获取触摸结束之后的node坐标；
    }
    onTouchCancel() {
        this.nodePos = this.mapAreaNode.getPosition(); //获取触摸结束之后的node坐标；
    }
    // update (dt) {}
}
