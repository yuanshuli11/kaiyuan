
export default class FMJava {
    private static lock: boolean = false;
    //关闭的回调
    private static onClose: Function = null;
    //失败的回调
    private static onFailed: Function = null;

    public static InterstitialAdNowTime: number = 0;
    public static InterstitialAdstopTime: number = 0;

    private static IsLookVideo: Boolean = false;
    /**
       * 初始化登录
       */
    public static InitSdk() {
        if (!window.jsb) {
            return
        }
        let _this = this
        window.taptapLoginCallback = () => {
            var result = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "GetAccessToken", "()Ljava/lang/String;");
            if (!result) {
                return
            }
            var tostken = JSON.parse(result)
            _this.taptapLogin(tostken)
        }
        window.appleLoginCallback = (res) => {
            _this.appleLogin({ "access_token": res })
        }
    }
    public static InitCsj() {
        if (!window.jsb) {
            return
        }
        if (window.hasInitAD) {
            return
        }
        window.hasInitAD = true
        let extra = {
            "Token": cc.props.logininfo.token
        }
        if (cc.sys.platform == cc.sys.ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "initCsjAD", "(Ljava/lang/String;Ljava/lang/String;)V", cc.props.logininfo.user_id, JSON.stringify(extra));
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "initCsjAD:addExtra:", cc.props.logininfo.user_id, JSON.stringify(extra));
        }
    }
    public static AppleLogin() {
        if (cc.sys.os === cc.sys.OS_IOS && !this.lock) {
            this.lock = true
            setTimeout(() => { this.lock = false }, 2000);
            jsb.reflection.callStaticMethod("AppController", "AppleLogin");
        }
    }

    public static taptapInit() {
        if (cc.sys.platform == cc.sys.ANDROID && !this.lock) {
            this.lock = true
            setTimeout(() => { this.lock = false }, 2000);
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "taptapInitOnly", "()V");
        }
    }

    /**
     * 播放激励视频
     * @param onClose   播放完成回调
     * @param onFailed  播放失败的回调
     */
    public static showRewardedVideoAd(onClose: Function, onFailed: Function) {
        if (this.IsLookVideo) {
            return;
        }

        this.IsLookVideo = true;
        setTimeout(() => {
            this.IsLookVideo = false;
        }, 3000);
        this.onClose = onClose;
        this.onFailed = onFailed;
        window.show_FullScreenVideo = () => {
            if (cc.sys.platform == cc.sys.ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "show_FullScreenVideo", "()V");
            } else {
                jsb.reflection.callStaticMethod("AppController", "CsjAdRewardOpen");
            }
        }
        window.listener_Video_finish = (res) => {
            if (onClose) {
                onClose(true);
            }
        }
        window.listener_Video_Error = () => {
            if (onFailed) {
                onFailed(true);
            }
        }
        window.listener_Video_Close = () => {
            if (onClose) {
                onClose(false);
            }
        }
        if (cc.sys.platform == cc.sys.ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showRewardedVideoAd", "()V");
        } else {
            // TODO 加上IOS的showRewardedVideoAd
            jsb.reflection.callStaticMethod("AppController", "CsjAdRewardOpen");
        }
    }

    /**
     * 播放全屏视频
     * @param onClose   播放完成回调
     * @param onFailed  播放失败的回调
     */
    public static show_FullScreenVideo(onClose: Function, onFailed: Function) {

    }

    /**
     *  回调  激励视频播放成功
     */
    public static listener_Video_finish(name: string) {
        if (this.onClose) {
            this.onClose(true);
        }
    }


    /**
     *  回调  激励视频关闭
     */
    public static listener_Video_Close(name: string) {

        console.log(" 回调  视频播放关闭3", this.onClose);
        if (this.onClose) {
            this.onClose(false);
        }
    }



    public static appleLogin(taptoken) {
        var context = window.context
        var t = "78361b0cb24e4b93b739c7e3aa28f013"
        cc.props.logininfo.token = undefined
        cc.sys.localStorage.setItem("token", "")

        context.api.encryptData = {
            encryptKey: t.substring(20, 32) + t.substring(0, 20),
            iv: t.substring(10, 26),
        }

        context.api.requestAPI(cc, "POST", "/auth/applelogin", taptoken, function (item) {
            cc.props.logininfo = item
            cc.sys.localStorage.setItem("token", cc.props.logininfo.token)
            context.loginInit(function () {
                window.UserData.init(context, cc.props.logininfo, function () {
                    context.skipScene("SelectServer")
                })
            })
        }, function (errMsg) {
            console.log("api err:", errMsg)
            context.Toast(errMsg)
            setTimeout(function () { context.skipScene("Login") }, 2000);

        })
    }
    public static taptapLogin(taptoken) {
        var context = window.context
        var t = "78361b0cb24e4b93b739c7e3aa28f013"
        cc.props.logininfo.token = undefined
        cc.sys.localStorage.setItem("token", "")

        context.api.encryptData = {
            encryptKey: t.substring(20, 32) + t.substring(0, 20),
            iv: t.substring(10, 26),
        }

        context.api.requestAPI(cc, "POST", "/auth/taplogin", taptoken, function (item) {
            cc.props.logininfo = item
            cc.sys.localStorage.setItem("token", cc.props.logininfo.token)
            context.loginInit(function () {
                window.UserData.init(context, cc.props.logininfo, function () {
                    context.skipScene("SelectServer")
                })
            })
        }, function (errMsg) {
            console.log("api err:", errMsg)
            context.Toast(errMsg)
            setTimeout(function () { context.skipScene("Login") }, 2000);

        })
    }
}
(<any>window).FMJava = FMJava;

