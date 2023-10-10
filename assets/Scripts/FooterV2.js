// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {

        moreButtonNode: {
            default: null,
            type: cc.Node
        },
        moreButtonLayout: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:
    resetFooter() {
        for (var i = 0; i < this.node.children.length; i++) {
            let childNode = this.node.children[i]
            switch (childNode.name) {
                case "l1":
                    childNode.getChildByName("Label").getComponent(cc.Label).string = "建造研究>"
                    break;
                case "l2":
                    childNode.getChildByName("Label").getComponent(cc.Label).string = "军官"
                    break;
                case "l3":
                    childNode.getChildByName("Label").getComponent(cc.Label).string = "军校"
                    break;
                case "l4":
                    childNode.getChildByName("Label").getComponent(cc.Label).string = "军团"
                    break;
                case "r1":
                    childNode.getChildByName("Label").getComponent(cc.Label).string = "军队"
                    break;
                case "r2":
                    childNode.getChildByName("Label").getComponent(cc.Label).string = "军报"
                    break;
                case "r3":
                    childNode.getChildByName("Label").getComponent(cc.Label).string = "消息"
                    break;
                case "r4":
                    childNode.getChildByName("Label").getComponent(cc.Label).string = "任务"
                    break;
            }
        }
    },

    onLoad() {
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }

        this.moreButtonLayoutObj = this.moreButtonLayout.getComponent('VLayout')
        this.moreButtonLayoutObj.init(this)
        this.timeNum = 0
        this.resetFooter()
        this.onFocusList()
    },
    moreButtonMaskButton() {
        this.moreButtonNode.active = false
    },
    onMoreButton(event, btnName) {
        this.moreButtonLayoutObj.cleanChilds()
        this.moreButtonNode.active = true
        this.moreButtonNode.scaleX = 0
        this.moreButtonNode.height = 150
        var _this = this

        switch (btnName) {
            case "officer":
                this.moreButtonLayoutObj.addNewLine("grid_btn_item", "", { "text": `军官`, "page": "Building", "action": "Officer" }, function (data) {
                    _this.skipToPage("Officer")
                })
                this.moreButtonLayoutObj.addNewLine("grid_btn_item", "", { "text": `军校`, "page": "School", "action": "School" }, function (data) {
                    _this.skipToPage("School")
                })
                break
            case "user":

                this.moreButtonLayoutObj.addNewLine("grid_btn_item", "", { "text": `统帅`, "page": "Building", "action": "Owner" }, function (data) {
                    _this.skipToPage("Owner")
                })

                this.moreButtonLayoutObj.addNewLine("grid_btn_item", "", { "text": `宝物`, "page": "Treasure", "action": "Treasure" }, function (data) {
                    _this.skipToPage("Treasure")
                })
                this.moreButtonLayoutObj.addNewLine("grid_btn_item", "", { "text": `玩法`, "page": "Play", "action": "Play" }, function (data) {
                    _this.skipToPage("Play")
                })
                break
            case "building":
                this.moreButtonLayoutObj.addNewLine("grid_btn_item", "", { "text": `军事区`, "page": "Building", "action": "ArmyBuilding" }, function (data) {
                    _this.skipToPage("ArmyBuilding")
                })
                this.moreButtonLayoutObj.addNewLine("grid_btn_item", "", { "text": `资源区`, "page": "Building", "action": "ResBuilding" }, function (data) {
                    _this.skipToPage("ResBuilding")
                })
                this.moreButtonLayoutObj.addNewLine("grid_btn_item", "", { "text": `科技区`, "page": "Building", "action": "Tech" }, function (data) {
                    _this.skipToPage("Tech")
                })
                this.moreButtonLayoutObj.addNewLine("grid_btn_item", "", { "text": `交易所`, "page": "Exchange", "action": "Exchange" }, function (data) {
                    _this.skipToPage("Exchange")
                })
                break
            default:
                this.skipToPage(btnName)
                break
        }
        cc.tween(this.moreButtonNode).to(0.2, { scaleX: 1 }).start();
    },
    onClickButton(event, btnName) {
        if (!event || !event.currentTarget) {
            return
        }
        // var remoteUrl = "https://hero-1251540064.cos.ap-beijing.myqcloud.com/ka.mp3";
        // cc.assetManager.loadRemote(remoteUrl, function (err, audioClip) {
        //     cc.audioEngine.playMusic(audioClip, false);
        // });
        switch (event.currentTarget.name) {
            case "l1":
                this.onMoreButton(event, "building")
                break;
            case "l2":
                this.skipToPage("Officer")
                break;
            case "l3":
                this.skipToPage("School")
                break;
            case "l4":
                this.skipToPage("Group")
                break;
            case "r1":
                this.skipToPage("Army")
                break;
            case "r2":
                this.skipToPage("Report")
                break;
            case "r3":
                this.skipToPage("Msg")
                break;
            case "r4":
                this.skipToPage("Task")
                break;
            case "home":
                this.skipToPage("Main")
                break;



        }
        //清除时间通知标记（底部闪烁状态）
        this.cleanEventStep(btnName)

    },
    skipToPage(btnName) {
        switch (btnName) {
            case "Army":
            case "Officer":
            case "Defense":
            case "ArmyBuilding":
            case "ResBuilding":
            case "Tech":
            case "Owner":
                cc.props.NowPage = btnName
                this.context.NowPage = btnName
                cc.director.loadScene("Building");
                break
            default:
                cc.props.NowPage = btnName
                this.context.NowPage = btnName

                this.setEventNowPage(btnName)
                cc.director.loadScene(btnName);
                break
        }
    },
    onFocusList: function onFocusList() {
        if (cc.props.NowPage) {
            this.setOnfocus(cc.props.NowPage)
        }
    },
    setOfffocus(pageName) {
        var ls = {
            "Officer": "l2",
            "School": "l3",
            "Group": "l4",
            "Treasure": "l4",
            "Army": "r1",
            "Report": "r2",
            "Msg": "r3",
            "Task": "r4"
        };

        if (pageName && ls[pageName]) {
            var btnNode = this.node.getChildByName(ls[pageName]);
            if (!btnNode || !btnNode.getChildByName("Label")) {
                return;
            }
            btnNode.getChildByName("Label").color = new cc.color(91, 192, 222, 255);
        }
    },
    setOnfocus(pageName) {
        var ls = {
            "Officer": "l2",
            "School": "l3",
            "Group": "l4",
            "Treasure": "l4",
            "Army": "r1",
            "Report": "r2",
            "Msg": "r3",
            "Task": "r4"
        };

        if (pageName && ls[pageName]) {
            var btnNode = this.node.getChildByName(ls[pageName]);
            if (!btnNode || !btnNode.getChildByName("Label")) {
                return;
            }
            btnNode.getChildByName("Label").color = new cc.color(47, 113, 241, 255);
        }
    },
    checkEventClose() {
        if (!this.context.EventList) {
            return
        }
        for (var i = 0; i < this.context.EventList.length; i++) {

            // if (!this.ChildMap[this.context.EventList[i].type]) {
            //     continue
            // }
            if (this.context.EventList[i].type == cc.props.NowPage) {
                continue
            }
            this.setOfffocus(this.context.EventList[i].type)
        }
    },
    checkEventOn() {
        if (!this.context.EventList) {
            return
        }
        for (var i = 0; i < this.context.EventList.length; i++) {
            // if (!this.ChildMap[this.context.EventList[i].type]) {
            //     continue
            // }
            if (this.context.EventList[i].type == cc.props.NowPage) {
                continue
            }
            this.setOnfocus(this.context.EventList[i].type)
        }
    },
    setEventNowPage(itemName) {
        if (!this.context.EventStep[itemName]) {
            return
        }
        if (!this.context.EventStep[itemName].list) {
            return
        }
        for (var i = 0; i < this.context.EventStep[itemName].list.length; i++) {
            if (this.context.EventStep[itemName].list[i].content == "report1") {
                this.context.TabName = this.context.EventStep[itemName].list[i].content
                return
            }
            this.context.TabName = this.context.EventStep[itemName].list[i].content
        }
    },
    cleanEventStep(itemName) {

        if (!this.context.EventStep[itemName]) {
            return
        }
        var _context = this.context

        this.context.api.readEvent(cc, this.context.EventStep[itemName].id, itemName, function (res) {
            _context.loopEvent()
            return
        })
    },
    update(dt) {
        this.timeNum++
        if (this.timeNum % 40 == 0) {
            this.checkEventClose()
        } else if (this.timeNum % 20 == 0) {
            this.checkEventOn()
        }

    },
});
