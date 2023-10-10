// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

class mapItem {
    id: number;
    city: string;
    lng: number;
    lat: number;
    map_type: number;
    level: number;
    source_id: number;
    city_info: {
        map: {
            group_name: "",
        }
    };
}
@ccclass
export default class MicroMapItem extends cc.Component {
    @property(cc.Label)
    flag: cc.Label = null;
    @property(cc.Label)
    text: cc.Label = null;
    @property(cc.Label)
    groupText: cc.Label = null;
    @property(cc.Node)
    bgSprite: cc.Node = null;

    data: mapItem;
    info: {
        flag: string,
        text: string,
        color: string,
    };
    context: null;
    init(context, data) {
        this.context = context
        this.info = {
            text: ""
        }
        this.data = data
        if (data) {
            var text = `(${this.data.lng},${this.data.lat})`
            if (this.data.map_type == 10) {
                text = `(${this.data.lng},${this.data.lat})`
            }
            this.info.flag = this.data.city
            this.info.text = text
            if (this.data.city_info && this.data.city_info.map && this.data.city_info.map.group_name) {
                this.info.text = `(${this.data.city_info.map.group_name})`
            }
            this.info.color = data.color
            if (!this.info.color) {
                this.info.color = "#5BC0DE"
            }
        }
        this.text.node.active = false
        this.groupText.node.active = false

    }
    showDetail() {
        if (this.data.map_type == 90) {
            return
        }
        var eventNodeItem = this.context.newAlertItem()
        var fn = eventNodeItem.funcs['showMapDetailAlert'].func
        fn(null, this.context, this.data.id, this.data.source_id)
    }
    start() {

        // 空白
        if (this.data.map_type == 90) {
            this.node.opacity = 10
            this.bgSprite.color = new cc.Color().fromHEX("#acb9ca");
        } else {
            if (this.info) {
                if (this.data.city_info && this.data.city_info.map && this.data.city_info.map.group_name) {
                    this.groupText.string = this.info.text
                    this.groupText.node.active = true
                } else {
                    this.text.string = this.info.text
                    this.text.node.active = true
                }

                if (this.flag) {
                    this.flag.string = this.info.flag
                }
                this.bgSprite.color = new cc.Color().fromHEX(this.info.color);
            }
        }
    }

    // update (dt) {}
}
