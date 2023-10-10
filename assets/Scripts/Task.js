// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        VLayoutNode: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.nowPage = 0
        var contextNode = cc.find("context")
        this.context = contextNode.getComponent('Ctx')
        if (!this.context) {
            cc.director.loadScene("Login");
        }
        this.context.resetFitView(this.node)

        this.VLayoutNewNodeObj = this.VLayoutNode.getComponent('VLayout')
        this.VLayoutNewNodeObj.init(this)

        this.resetPage()
    },
    resetPage() {
        var _this = this
        this.dataInfo = []
        this.context.api.getTaskList(cc, function (res) {
            for (var i = 0; i < res.list.length; i++) {
                if (!res.list[i].detail) {
                    continue
                }
                _this.dataInfo.push(res.list[i])
            }

            _this.loadPage(-1)
        }, function (errMsg) {
            _this.context.Toast("提示:" + errMsg)
        })
    },

    loadPage(page) {


        if (page == -1) {
            page = this.nowPage
        } else {
            this.nowPage = page
        }
        this.cleanContent()
        var pageNum = 8
        var offset = page * pageNum
        var _this = this
        for (var i = 0; i < this.dataInfo.length; i++) {
            //解决闭包问题
            (function (item) {
                var title = "【" + item.detail.category_text + "】" + item.detail.name
                var flag = ""
                if (item.finished_at > 0 && item.is_reward == 0) {
                    flag = "√"
                } else if (item.has_read == 0) {
                    flag = "!"
                }
                var dataItem = item
                _this.VLayoutNewNodeObj.addNewLine("text", "", { "text": title, "data": dataItem, "flag": flag, "textClick": true }, function (event, attr) {
                    _this.showDetail(attr)
                })
            })(this.dataInfo[i])

        }

    },
    showDetail(attr) {
        if (!attr.data.detail) {
            this.context.Toast("任务已经不存在啦，请重新刷新页面")
            return
        }
        var alterNewNode = this.context.NewAlert2()
        var eventNodeItem = this.context.newAlertItem()
        alterNewNode.eventNodeItem = eventNodeItem
        eventNodeItem.attr = attr
        alterNewNode.InitAlert("任务详情");
        alterNewNode.addNewLine("text_mid", "类型:", { "text": attr.data.detail.category_text });
        if (attr.data.is_reward == 1) {
            alterNewNode.addNewLine("text_mid", "状态:", { "text": "已领取奖励" });
        } else if (attr.data.finished_at > 0 && attr.data.detail.category != 100) {
            alterNewNode.addNewLine("text_mid", "状态:", { "text": "已完成，未领取奖励" });
        } else if (attr.data.detail.category == 100) {
            if (attr.data.task_info && attr.data.task_info.hasOwnProperty("attr") && attr.data.task_info.attr.hasOwnProperty("finish")
                && attr.data.task_info.attr.finish) {
                alterNewNode.addNewLine("text_mid", "状态:", { "text": "已完成，未领取奖励" });
            } else if (!attr.data.task_info || !attr.data.task_info.hasOwnProperty("attr")) {
                alterNewNode.addNewLine("text_mid", "状态:", { "text": "未观看广告" });
            } else (attr.data.task_info && attr.data.task_info.hasOwnProperty("attr") && attr.data.task_info.attr.hasOwnProperty("nums"))
            {

                alterNewNode.addNewLine("text_mid", "状态:", { "text": "观看" + attr.data.task_info.attr.nums + "次广告" });

            }

        } else {
            alterNewNode.addNewLine("text_mid", "状态:", { "text": "未领取奖励" });

        }

        alterNewNode.addNewLine("text_mid", "名称:", { "text": attr.data.detail.name });
        alterNewNode.addNewLine("wrap_text", "详情:", { "text": attr.data.detail.desc });

        if (attr.data.detail.reward && attr.data.detail.reward.resource) {
            var resArr = attr.data.detail.reward.resource
            var gridText = Array()
            for (var i = 0; i < resArr.length; i++) {
                var item = {}
                item.name = resArr[i].text
                item.text = resArr[i].num
                gridText.push(item)
            }
            alterNewNode.addNewLine("grid", "奖励:", { "grid": gridText });
        } else if (attr.data.detail.reward && attr.data.detail.reward.props) {
            var rewd = ""
            for (var i = 0; i < attr.data.detail.reward.props.length; i++) {
                rewd += `${attr.data.detail.reward.props[i].text} * ${attr.data.detail.reward.props[i].num}\n\n `
            }
            alterNewNode.addNewLine("wrap_text", "宝物奖励:", { "text": rewd });

        } else if (attr.data.detail.reward && attr.data.detail.reward.diamonds) {
            alterNewNode.addNewLine("wrap_text", "钻石奖励:", { "text": "+" + attr.data.detail.reward.diamonds });
        }

        if (attr.data.task_info) {
            alterNewNode.addNewLine("wrap_text", "说明:", { "text": attr.data.task_info.text });

        }


        // for (var i = 0; i < res.armies.length; i++) {
        //     var objItem = _alterNewNode.addNewLine("battleItem", res.armies[i].name, res.armies[i]);

        //     itemList.push(objItem);
        // }
        var _this = this
        //广告
        if (attr.data.detail.category == 100) {
            if (attr.data.task_info && attr.data.task_info.hasOwnProperty("attr") && attr.data.task_info.attr.hasOwnProperty("finish")
                && attr.data.task_info.attr.finish) {
                alterNewNode.SetConfirmText("领取奖励")
                alterNewNode.OnButtonFunc = function () {
                    alterNewNode.context.api.finishTask(cc, attr.data.id, 0, function (data) {
                        attr.data = data
                        alterNewNode.context.Toast("领取奖励成功!")
                        alterNewNode.onButtonCancel()
                        _this.resetPage()
                    }, function (errorMsg) {
                        alterNewNode.context.Toast(errorMsg)
                        alterNewNode.onButtonCancel()
                        _this.resetPage()
                    })

                }
            } else {
                alterNewNode.SetConfirmText("观看广告")
                alterNewNode.OnButtonFunc = function () {
                    alterNewNode.context.Ad.ShowAd("Activity", function () {

                        _this.context.api.finishTask(cc, attr.data.id, 0, function (data) {

                            attr.data = data
                            alterNewNode.onButtonCancel()
                            _this.resetPage()
                        }, function (errorMsg) {
                            _this.resetPage()
                            alterNewNode.context.Toast(errorMsg)
                            alterNewNode.onButtonCancel()
                        })
                    }, function (err) {
                        _this.resetPage()
                        alterNewNode.context.Toast(err)
                        alterNewNode.onButtonCancel()
                    })
                }
                // alterNewNode.AddButton(eventNodeItem.funcs["adTask"])
            }
            alterNewNode.Alert();
            return
        }
        if (attr.data.is_reward == 0 && attr.data.finished_at > 0) {
            alterNewNode.OnButtonFunc = function () {
                alterNewNode.context.api.finishTask(cc, attr.data.id, 0, function (data) {
                    attr.data = data

                    if (data.finished_at > 0) {
                        _this.showDetail(attr)

                    } else {
                        _this.resetPage()
                    }
                    alterNewNode.context.Toast("获得奖励!")
                    alterNewNode.onButtonCancel()
                }, function (errorMsg) {
                    alterNewNode.context.Toast(errorMsg)
                    alterNewNode.onButtonCancel()
                })
            };
            alterNewNode.SetConfirmText("领取奖励")
            if (cc.props.showAd == true) {
                alterNewNode.AddButton(eventNodeItem.funcs["adTask"])
            }

        } else {
            alterNewNode.OnButtonFunc = function () {
                alterNewNode.onButtonCancel()
            };
            alterNewNode.SetConfirmText("  关闭  ")
        }


        alterNewNode.Alert();
    },
    cleanContent() {
        for (var i = 0; i < this.VLayoutNode.children.length; i++) {
            this.VLayoutNode.children[i].destroy()
        }
    },
    start() {
        // 显示页面的Footer
        this.context.AddHeaderUI(this.node)

        this.context.AddFooterV3(this.node)
    }
    // update (dt) {},
});
