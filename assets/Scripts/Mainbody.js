// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        resPage: {
            default: null,
            type: cc.Node
        },
        homePageFab: {
            default: null,
            type: cc.Prefab
        },
        tabPage: {
            default: null,
            type: cc.Node
        },
        contentNode: {
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
        shareNode: {
            default: null,
            type: cc.Node
        },
        shareText: {
            default: null,
            type: cc.Label
        }
    },


    onLoad() {
        this.contentItem = this.node.getChildByName("content")
        if (window.tt) {
            this.shareNode.active = true
        } else {
            this.shareNode.active = false
        }
    },
    flushLupinButton() {
        if (cc.props.fenxiangBegin >= 0) {
            var remaining = cc.props.fenxiangBegin - this.context.getServerTime()
            if (remaining < 0) {
                remaining = 0
            }
            if (remaining > 0) {
                this.shareText.string = "录屏中(" + remaining + ")"
            } else {
                this.shareText.string = "录屏中"
            }
            this.shareNode.interactable = false
        } else {
            this.shareText.string = "录屏分享"
            this.shareNode.interactable = true
        }
    },
    reloadLupinButton() {
        if (!this.shareNode) {
            return
        }
        if (cc.props.childPage != 0) {
            this.shareNode.active = false
            return
        }
        if (window.tt) {
            this.shareNode.active = true
        } else {
            this.shareNode.active = false
        }
        this.flushLupinButton()
    },
    onClickLuping() {
        var _this = this
        var context = this.context
        if (cc.props.fenxiangBegin > 0) {
            _this.reloadLupinButton()
            return
        } else if (cc.props.fenxiangBegin == -1) {
            if (window.tt) {
                tt.getSystemInfo({
                    success(res) {
                        const screenWidth = res.screenWidth;
                        const screenHeight = res.screenHeight;
                        const recorder = tt.getGameRecorderManager();
                        const clipIndexList = []; // 剪辑索引列表

                        var maskInfo = recorder.getMark();
                        var x = (screenWidth - maskInfo.markWidth) / 2;
                        var y = (screenHeight - maskInfo.markHeight) / 2;

                        recorder.onStart((res) => {
                            cc.props.fenxiangBegin = context.getServerTime() + 30
                            console.log("录屏开始");
                            // do something;
                            _this.reloadLupinButton()
                        });
                        //添加水印并且居中处理
                        recorder.start({
                            duration: 30,
                            isMarkOpen: true,
                            locLeft: x,
                            locTop: y,
                        });
                        recorder.onStop((recorderRes) => {
                            cc.props.fenxiangBegin = -1

                            if (_this && _this.reloadLupinButton) {
                                _this.reloadLupinButton()
                            }
                            var alter2Node = context.NewAlert2()
                            alter2Node.InitAlert("录屏完成", "分享")
                            alter2Node.addNewLine("text", "", { "text": "" })
                            alter2Node.addNewLine("text_mid", "录频时长:", { "text": "30s" })
                            alter2Node.addNewLine("wrap_text", "提示:", { "text": "欢迎分享录屏，让更多小伙伴看到你的精彩瞬间！\n\n\n点击分享后，可以编辑视频。做出更精彩的效果哦!" })

                            alter2Node.OnButtonFunc = function () {
                                tt.shareAppMessage({
                                    title: "我的游戏分享",
                                    channel: "video",
                                    extra: {
                                        videoTopics: ["小兵爱登顶", "带你起飞，和我一起统帅千军吧"], // 抖音或头条小视频话题列表
                                        videoPath: recorderRes.videoPath,
                                        withVideoId: true,
                                    },
                                    success(res) {
                                        tt.showModal({
                                            title: "分享成功",
                                            content: "也许下一个明星统帅就是你哦～",
                                        });
                                    },
                                    fail(e) {
                                        console.log("分享失败:", e)
                                        tt.showModal({
                                            title: "分享失败",
                                            content: "点击分享按钮再试一试",
                                        });
                                    },
                                });
                            }
                            alter2Node.Alert()
                        });
                    },
                });
            }
        }
    },





    onTouchStart(event) {
        this.moveBeginX = this.contentNode.x
        return true
    },
    onTouchMove(event) {

        var touchLoc = event.getDelta();
        if (this.contentNode.x < -875) {
            this.contentNode.x = -875
            return true
        }
        if (this.contentNode.x > 875) {
            this.contentNode.x = 875
            return true
        }
        this.contentNode.x += touchLoc.x

        return true
    },
    onTouchEnd(event) {
        var gap = 30
        if (this.contentNode.x - this.moveBeginX > gap) {
            this.nowHomePage--
        } else if (this.contentNode.x - this.moveBeginX < -gap) {
            this.nowHomePage++
        }
        if (this.nowHomePage < 0) {
            this.nowHomePage = 0
        } else if (this.nowHomePage > 4) {
            this.nowHomePage = 4
        }

        this.tweenToPage(this.nowHomePage)

        return true
    },
    tweenToPage(i) {
        this.nowHomePage = i

        this.changeTag(i)
        cc.tween(this.contentNode).to(0.1, { x: 700 - i * 350 }).start();
    },
    skipToPage(i) {
        this.nowHomePage = i
        this.changeTag(i)
        cc.tween(this.contentNode).to(0.01, { x: 700 - i * 350 }).start();
    },
    changeTag(i) {
        // this.setTagLoseFocus(this.NowTag)
        // this.setTagOnFocus(this.tabPage.children[i])
        this.NowTag.getChildByName("bg").opacity = 50
        this.tabPage.children[i].getChildByName("bg").opacity = 150
        this.NowTag = this.tabPage.children[i]
        cc.props.childPage = i

        this.reloadLupinButton()
    },


});
