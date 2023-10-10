// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import { UserData } from './model/userdata';
const i18n = require('LanguageData');
import { ApiUtil } from "./model/apiutil";
import { AlertFunc } from "./model/alertfunc";
import { AListFunc } from "./model/alistfunc";
import { AdUtils } from "./model/ad"
cc.Class({
    extends: cc.Component,

    properties: {
        // alert1Fab: {
        //     default: null,
        //     type: cc.Prefab
        // },

        alert2Fab: {
            default: null,
            type: cc.Prefab
        },
        HeaderFab: {
            default: null,
            type: cc.Prefab
        },
        FooterV3Fab: {
            default: null,
            type: cc.Prefab
        },
        FooterV3_2Fab: {
            default: null,
            type: cc.Prefab
        },
        alert3Fab: {
            default: null,
            type: cc.Prefab
        },
        alert4Fab: {
            default: null,
            type: cc.Prefab
        },
        alert5Fab: {
            default: null,
            type: cc.Prefab
        },
        toastFab: {
            default: null,
            type: cc.Prefab
        },
        buildingItemFab: {
            default: null,
            type: cc.Prefab
        },
        numkeysFab: {
            default: null,
            type: cc.Prefab
        },
    },
    inini18(lan) {
        if (!window.wx) {
            i18n.init(lan);
        }
    },
    NewNumberKeys(title, maxLength, callback) {
        let initNumbers = cc.instantiate(this.numkeysFab);
        initNumbers.zIndex = 100000
        this.node.addChild(initNumbers)

        let numkeys = initNumbers.getComponent('numkeys.prefabjs')
        numkeys.set_title(title)
        numkeys.set_callback(callback)
        numkeys.set_max_length(maxLength)
        return numkeys
    },
    ReplaceI18NText(str) {
        const regex = /\${(.*?)}/g;
        const matches = str.match(regex);
        if (matches) {
            let i18nKeys = matches.map(match => match.slice(2, -1));
            for (var i in i18nKeys) {
                let itemKey = i18nKeys[i]
                let newText = i18n.t("label." + itemKey);
                let reg = new RegExp("\\${" + itemKey + "}", "g");
                str = str.replace(reg, newText);
            }
        }
        return str
    },
    Toast(text, time) {

        if (window.qq) {
            window.qq.showToast({
                title: text,
                icon: 'success',
                duration: time ? time : 500
            })
            return
        }
        if (!this.toastNode) {
            var newAlert1 = cc.instantiate(this.toastFab);
            this.toastNode = newAlert1.getComponent('Toast')
            this.node.addChild(this.toastNode.node)
        }
        this.toastNode.Toast(text)
    },
    // Alert1() {
    //     if (!this.alterNewNode) {
    //         var newAlert1 = cc.instantiate(this.alert1Fab);
    //         this.alterNewNode = newAlert1.getComponent('Alert1')
    //         this.alterNewNode.init(this)
    //         this.node.addChild(this.alterNewNode.node)
    //     }
    //     return this.alterNewNode
    // },
    resetFitView(node) {
        this.Ad.DestroyBanner()
        let c = node.getComponent(cc.Canvas);
        if (cc.view.getVisibleSize().width / cc.view.getVisibleSize().height > 0.5) {
            c.fitHeight = true;
            c.fitWidth = false;
        } else {
            c.fitHeight = false;
            c.fitWidth = true;
        }
    },
    HotUpdate() {
        if (window.wx || cc.props.alreadyUpdate) {
            return
        }
        cc.resources.load("./fab/update_panel", (err, prefab) => {
            if (prefab) {
                var newAlert1 = cc.instantiate(prefab);
                this.updateNode = newAlert1.getComponent('UpdatePanel')
                this.node.addChild(this.updateNode.node)
            }

        });
    },
    Alert2() {
        var newAlert1 = cc.instantiate(this.alert2Fab);
        this.alert2Node = newAlert1.getComponent('Alert2')
        this.alert2Node.init(this)
        this.node.addChild(this.alert2Node.node)
        return this.alert2Node
    },
    AddHeaderUI(node) {

        if (!this.headerNode) {
            // this.headerNode = cc.instantiate(this.HeaderFab);
            // this.headerNode.zIndex = -1
            // node.addChild(this.headerNode)
        }
        this.headerNode = cc.instantiate(this.HeaderFab);
        this.headerNode.zIndex = -1
        node.addChild(this.headerNode)

    },
    AddFooterV3(node) {
        var newFooter = cc.instantiate(this.FooterV3Fab);
        //var newFooterNode = newFooter.getComponent('FooterV3')
        node.addChild(newFooter)
    },
    AddFooterV3_2(node) {
        var newFooter = cc.instantiate(this.FooterV3_2Fab);
        node.addChild(newFooter)
    },
    // NewAlert1() {
    //     if (!this.alert1Pool || this.alert1Pool.length == 0) {
    //         for (var i = 0; i < 3; i++) {
    //             var newAlert1 = cc.instantiate(this.alert1Fab);
    //             var alterNewNode = newAlert1.getComponent('Alert1')
    //             alterNewNode.init(this)
    //             this.node.addChild(alterNewNode.node)
    //             this.alert1Pool.push(alterNewNode)
    //             this.alert1PoolAll.push(alterNewNode)

    //         }
    //     }
    //     return this.alert1Pool.shift();
    // },
    NewAlert2() {
        var newAlert1 = cc.instantiate(this.alert2Fab);
        var alterNewNode = newAlert1.getComponent('Alert2')
        alterNewNode.init(this)
        this.node.addChild(alterNewNode.node)
        return alterNewNode
    },
    NewAlert4() {
        var newAlert1 = cc.instantiate(this.alert4Fab);
        var alterNewNode = newAlert1.getComponent('Alert4')
        alterNewNode.init(this)
        this.node.addChild(alterNewNode.node)
        return alterNewNode
    },
    NewAlert5() {
        var newAlert1 = cc.instantiate(this.alert5Fab);
        var alterNewNode = newAlert1.getComponent('Alert2')
        alterNewNode.init(this)
        this.node.addChild(alterNewNode.node)
        return alterNewNode
    },
    NewAlert3() {
        if (!this.alert3Pool || this.alert3Pool.length == 0) {
            for (var i = 0; i < 3; i++) {
                var newAlert3 = cc.instantiate(this.alert3Fab);
                var alterNewNode = newAlert3.getComponent('Alert3')
                alterNewNode.init(this)
                this.node.addChild(alterNewNode.node)
                this.alert3Pool.push(alterNewNode)
                this.alert3PoolAll.push(alterNewNode)
            }
        }
        return this.alert3Pool.shift();
    },
    newAlertItem() {
        var eventNodeItem = {}
        eventNodeItem.context = this
        eventNodeItem.funcs = this.AlertFunc.getFuncByName(eventNodeItem)
        return eventNodeItem
    },
    yindao() {
        var context = this
        var alterNewNode = context.NewAlert5()
        alterNewNode.InitAlert("新人引导", "");
        alterNewNode.setImage("https://hero-1251540064.cos.ap-beijing.myqcloud.com/yindao/0001.jpeg")
        alterNewNode.Alert();
        var eventNodeItem = context.newAlertItem()
        eventNodeItem.index = 0
        var images = [
            "https://hero-1251540064.cos.ap-beijing.myqcloud.com/yindao/0001.jpeg",
            "https://hero-1251540064.cos.ap-beijing.myqcloud.com/yindao/0010.jpeg",
            "https://hero-1251540064.cos.ap-beijing.myqcloud.com/yindao/0020.jpeg",
            "https://hero-1251540064.cos.ap-beijing.myqcloud.com/yindao/0030.jpeg",
            "https://hero-1251540064.cos.ap-beijing.myqcloud.com/yindao/0040.jpeg",
            "https://hero-1251540064.cos.ap-beijing.myqcloud.com/yindao/0050.jpeg",
            "https://hero-1251540064.cos.ap-beijing.myqcloud.com/yindao/0060.jpeg",
            "https://hero-1251540064.cos.ap-beijing.myqcloud.com/yindao/0070.jpeg",
            "https://hero-1251540064.cos.ap-beijing.myqcloud.com/yindao/0080.jpeg",
            "https://hero-1251540064.cos.ap-beijing.myqcloud.com/yindao/0090.jpeg",
            "https://hero-1251540064.cos.ap-beijing.myqcloud.com/yindao/0100.jpeg",
            "https://hero-1251540064.cos.ap-beijing.myqcloud.com/yindao/0110.jpeg",
        ]
        alterNewNode.AddButtons({
            "func": function (alterNewNode, context, eventNodeItem) {
                eventNodeItem.index++
                if (eventNodeItem.index < images.length) {
                    alterNewNode.setImage(images[eventNodeItem.index])

                } else {
                    context.Toast("已经是最后一张啦~")
                    alterNewNode.onButtonCancel()
                }
            },
            "eventNodeItem": eventNodeItem,
            "btnText": "下一页"
        })
        alterNewNode.AddButtons({
            "func": function (alterNewNode, context, eventNodeItem) {
                eventNodeItem.index--
                if (eventNodeItem.index < 0) {
                    eventNodeItem.index = 0
                    context.Toast("已经是第一张啦~")

                }
                if (eventNodeItem.index < images.length) {
                    alterNewNode.setImage(images[eventNodeItem.index])

                }
            },
            "eventNodeItem": eventNodeItem,
            "btnText": "上一页"
        })
        if (window.wx && window.wx.reportEvent) {
            wx.reportEvent('expt_user_yindao', { expt_data: 1 })
        }
    },
    WebCopyString: function (context, str) {

        if (window.wx) {
            // console.log('复制---微信小游戏--cc.sys.platform=', cc.sys.platform);
            wx.setClipboardData({
                data: str,
                success: function (res) {
                    // wx.getClipboardData({
                    //     success: function(res) {
                    //         console.log("复制成功：", res.data);
                    //         return true;
                    //     }
                    // });
                    if (window.qq) {
                        context.Toast(str + "复制成功")
                    } else if (window.wx && window.wx.reportEvent) {
                        wx.reportEvent('expt_copy_my_wxinfo', { expt_data: 1 })
                    }
                    console.log("success复制成功：", res.data);
                    return true;
                }
            });

            return;
        } else {
            console.log(str)
            this.Toast("复制成功")
            return ""
        }
    },
    numToString(num) {
        if (num < 100000) {
            return num
        } else if (num < 1000000) {
            num = Math.floor((num / 1000) * 100) / 100
            return num + "K"
        } else if (num < 1000000000) {
            num = Math.floor((num / 1000000) * 100) / 100
            return num + "M"
        } else if (num < 1000000000000) {
            num = Math.floor((num / 1000000000) * 100) / 100
            return num + "B"
        } else {
            num = Math.floor((num / 1000000000000) * 100) / 100
            return num + "KB"
        }
    },
    init() {
        ApiUtil.context = this
        this.api = ApiUtil
        this.AlertFunc = AlertFunc
        this.ListFunc = AListFunc

        if (window.qg) {
            cc.assetManager.loadRemote('https://hero-1251540064.cos.ap-beijing.myqcloud.com/oppo_game_bg.mp3', (err, audioClip) => console.log(audioClip));
            var remoteUrl = "https://hero-1251540064.cos.ap-beijing.myqcloud.com/oppo_game_bg.mp3";
            cc.assetManager.loadRemote(remoteUrl, function (err, audioClip) {
                cc.audioEngine.playMusic(audioClip, true);
            });

        }

        // cc.assetManager.loadRemote('https://hero-1251540064.cos.ap-beijing.myqcloud.com/ka.mp3', function (err, audioClip) {
        //     return console.log(audioClip);
        // });

        AdUtils.Init(this)
        this.Ad = AdUtils
        cc.game.addPersistRootNode(this.node);
        this.timeNum = 0
        this.gapTime = 0
        this.EventList = Array()
        this.EventStep = {}
        this.alert1Pool = Array()
        this.alert2Pool = Array()
        this.alert3Pool = Array()

        this.alert1PoolAll = Array()
        this.alert2PoolAll = Array()
        this.alert3PoolAll = Array()


        this.buildingItemPool = new cc.NodePool();
        let initCount = 10;
        for (let i = 0; i < initCount; ++i) {
            let item = cc.instantiate(this.buildingItemFab); // 创建节点
            this.buildingItemPool.put(item); // 通过 put 接口放入对象池
        }
        this.levelColor = {
            1: new cc.color(0, 132, 68, 255),
            2: new cc.color(69, 146, 249, 255),
            3: new cc.color(217, 81, 245, 255),
            4: new cc.color(225, 137, 38, 255),
        }
    },
    getLocStr(lng, lat) {
        return "(" + lng + "," + lat + ")"
    },
    setServerTime(serverTime) {

        var clientTime = Date.parse(new Date()) / 1000;
        //防止服务器时间和用户时间出现时间差
        this.gapTime = serverTime - clientTime
        return
    },
    loginInit(callback) {
        var _this = this
        window.context.api.getCfgDict(cc, function (res) {
            _this.dict = res
            callback()
        }, function (err) {
            console.log("===getCfgDict", err)

        })
    },
    getServerTime() {
        return this.gapTime + Date.parse(new Date()) / 1000
    },
    getDictByCode(ktype, code) {
        if (!this.dict) {
            this.Toast("数据异常，请刷新页面恢复")
            return ""
        }
        if (this.dict.name && ktype in this.dict.name) {
            return this.dict.name[ktype][code]
        }
        return ""
    },
    getObjectDetail(nameType) {
        if (!this.dict || !this.dict.buildings) {
            this.Toast("数据异常，请刷新页面恢复")
            return ""
        }
        if (!this.dict.buildings[nameType] || !this.dict.buildings[nameType].detail) {
            //  this.Toast("获取单位详情失败")
            return ""
        }
        return this.dict.buildings[nameType]
    },
    getObjectLevelDetail(nameType, level) {
        if (!this.dict || !this.dict.buildings) {
            this.Toast("数据异常，请刷新页面恢复")
            return ""
        }
        if (!this.dict.buildings[nameType] || !this.dict.buildings[nameType].detail) {
            //  this.Toast("获取单位详情失败")
            return ""
        }
        return this.dict.buildings[nameType].detail[level]
    },
    getArmyByNameType(name_type) {
        if (!this.dict) {
            this.Toast("数据异常，请刷新页面恢复")
            return ""
        }
        if (this.dict.army && name_type in this.dict.army) {
            return this.dict.army[name_type]
        }
        return ""
    },
    getDictName(rType, resCode) {
        if (!this.dict) {
            this.Toast("数据异常，请刷新页面恢复")
            return ""
        }
        if (this.dict.name && rType in this.dict.name && resCode in this.dict.name[rType]) {
            return this.dict.name[rType][resCode]
        }
        return ""
    },
    skipScene(name) {
        if (!name) {
            name = "Main"
        }
        if (cc.props.NowPage != "") {
            cc.props.LastPage = cc.props.NowPage
        } else {
            cc.props.LastPage = name
        }
        for (var i = 0; i < this.alert2PoolAll.length; i++) {
            this.alert2PoolAll[i].onButtonCancel()
        }
        for (var i = 0; i < this.alert1PoolAll.length; i++) {
            this.alert1PoolAll[i].onButtonCancel()
        }
        for (var i = 0; i < this.alert3PoolAll.length; i++) {
            this.alert3PoolAll[i].onButtonCancel()
        }
        cc.props.NowPage = name
        this.sceneName = name
        //  cc.director.loadScene(name);

        this.reloadPage()
    },
    changeToMap() {
        if (UserData.city.info.source_id && UserData.city.info.source_id > 0) {
            this.changeToMicroMap()
        } else {
            cc.director.loadScene("Map");
        }
    },
    goBack() {
        cc.props.NowPage = cc.props.LastPage
        cc.props.LastPage = ""

        cc.director.loadScene(cc.props.NowPage);
    },
    start() {

    },
    timeTostr(timeint) {
        if (timeint <= 0) {
            return "00:00:00"
        }
        var h = parseInt(timeint / 3600);
        var m = parseInt(timeint % 3600 / 60);
        var s = parseInt(timeint % 3600 % 60);
        if (h.length < 10) {
            h = '0' + h;
        }

        if (m < 10) {
            m = '0' + m;
        }
        if (s < 10) {
            s = '0' + s;
        }
        return h + ':' + m + ':' + s;
    },
    loopEvent() {
        if (!cc.props.logininfo.token || !cc.props.ServerKey) {
            return
        }
        var _this = this
        if (!cc.props.logininfo.loop_times) {
            cc.props.logininfo.loop_times = 0
        }
        this.api.loopEvent(cc, function (res) {
            cc.log("loop event ", res.list)
            cc.props.logininfo.loop_times += 1
            _this.EventList = res.list
            for (var i = 0; i < res.list.length; i++) {
                if (!_this.EventStep[res.list[i].type]) {
                    _this.EventStep[res.list[i].type] = {
                        "id": res.list[i].id,
                        "list": [res.list[i]]

                    }
                }
                if (_this.EventStep[res.list[i].type].id < res.list[i].id) {
                    _this.EventStep[res.list[i].type].id = res.list[i].id
                    _this.EventStep[res.list[i].type].list.push(res.list[i])
                }
            }
        })
    },
    getResText(res) {
        if (!res) {
            return ""
        }
        var str = ""
        if (res.gold > 0) {
            str += `黄金:${res.gold}\n`
        }
        if (res.food > 0) {
            str += `粮食:${res.food}\n`
        }
        if (res.steel > 0) {
            str += `钢铁:${res.steel}\n`
        }
        if (res.oil > 0) {
            str += `石油:${res.oil}\n`
        }
        if (res.rare > 0) {
            str += `稀土:${res.rare}\n`
        }
        return str
    },
    changeToMicroMap(sourceId) {
        if (sourceId) {
            cc.props.sourceID = Number(sourceId)

        }
        cc.props.NowPage = "MicroMap"
        cc.director.loadScene("MicroMap");
    },
    reloadPage() {
        if (cc.props.NowPage == "ResBuilding" || cc.props.NowPage == "Officer" || cc.props.NowPage == "Army" || cc.props.NowPage == "Owner" || cc.props.NowPage == "ArmyBuilding" || cc.props.NowPage == "Tech" || cc.props.NowPage == "Tech") {
            cc.director.loadScene("Building");
        } else {
            cc.director.loadScene(cc.props.NowPage);
        }
    },
    checkNumber(theObj) {
        var reg = /^[0-9]+.?[0-9]*$/;
        if (reg.test(theObj)) {
            return true;
        }
        return false;
    },
    TimestampToTime(timestamp) {
        var date = new Date(timestamp * 1000); // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
        // var Y = date.getFullYear() + '-';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        var D = date.getDate() + ' ';
        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();

        if (D < 10) {
            D = "0" + D
        }
        if (h < 10) {
            h = "0" + h
        }
        if (m < 10) {
            m = "0" + m
        }
        if (s < 10) {
            s = "0" + s
        }
        return `${M}-${D} ${h}:${m}:${s}`;
    },
    update(dt) {
        if (!cc.props || !cc.props.logininfo.token || !cc.props.ServerKey) {
            return
        }
        this.timeNum++
        if (this.timeNum == 1 || this.timeNum % 400 == 0) {
            this.loopEvent()
        }
    },
});
