// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
const { ccclass, property } = cc._decorator;

@ccclass
export default class Notice extends cc.Component {

    /**Mask组件 */
    @property(cc.Node)
    mask: cc.Node = null;

    /**公告label*/
    @property(cc.RichText)
    noticeLabel: cc.RichText = null;

    @property(cc.Node)
    notice: cc.Node;
    /**公告数组
    *notices 公告数组每个元素结构是{content,priority,times} content:string,     priority:number,times:number  文本内容，优先级，重复次数
    */


    private speed: number = 100;



    onLoad() {
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }
    }
    readNotice(id) {
        cc.sys.localStorage.setItem("readNotice_" + id, "1")
        this.notice.active = false
    }
    alertNotice() {
        var alter2Node = this.context.NewAlert2()
        alter2Node.InitAlert("系统通知", "已阅")

        alter2Node.addNewLine("text_rich", "提示:", { "text": cc.props.notice.text })
        alter2Node.OnButtonFunc = () => {
            alter2Node.onButtonCancel()
            this.readNotice(cc.props.notice.id)
        }
        alter2Node.Alert()
    }
    showNotice() {
        if (!cc.props.notice) {
            return
        }
        if (cc.sys.localStorage.getItem("readNotice_" + cc.props.notice.id)) {
            return
        }
        if (cc.props.notice.show_alert) {
            this.alertNotice()
        } else {
            let str = cc.props.notice.text
            this.noticeLabel.string = str;
            let contentSize = this.noticeLabel.node.getBoundingBox();
            this.startx = this.mask.width * this.mask.anchorX;
            this.endx = -this.mask.width * this.mask.anchorX - contentSize.size.width;
            this.noticeLabel.node.x = this.startx;
            this.notice.active = true
            this.notice.zIndex = 1000
        }
    }
    start() {
        if (!cc.props.notice || cc.props.notice.has_read) {
            return
        }
        this.showNotice()
    }

    setSpeed(speed: number) {
        this.speed = speed;
    }

    update(dt) {
        //移动循环展示消息的位置
        if (this.noticeLabel.node.x <= this.endx) {
            this.noticeLabel.node.x = this.startx;
        }
        this.noticeLabel.node.x -= this.speed * dt;

    }
}