// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Sprite)
    spriteNode: cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        var _this = this
        cc.assetManager.loadRemote(cc.props.iconURL, function (err, texture) {
            if (!_this.spriteNode) {
                return
            }
            var sp = new cc.SpriteFrame(texture);
            _this.spriteNode.spriteFrame = sp;
        });
    }

    start() {


    }

    // update (dt) {}
}
