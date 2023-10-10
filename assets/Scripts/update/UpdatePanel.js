// var customManifestStr = JSON.stringify({
//     "packageUrl": "https://erzhantest-1251540064.cos.ap-nanjing.myqcloud.com/remote-assets/",
//     "remoteManifestUrl": "https://erzhantest-1251540064.cos.ap-nanjing.myqcloud.com/remote-assets/project.manifest",
//     "remoteVersionUrl": "https://erzhantest-1251540064.cos.ap-nanjing.myqcloud.com/remote-assets/version.manifest",
//     "version": "1.0.4",
//     "assets": {
//         "src/cocos2d-jsb.js": {
//             "size": 1861077,
//             "md5": "fa53ddb4516205d21448fcf5f41f4a5a"
//         },
//         "src/physics.js": {
//             "size": 237428,
//             "md5": "e5ba051d402c89d8fabd8c11dfa507a7"
//         },
//         "src/settings.js": {
//             "size": 250,
//             "md5": "40abc0c6cdfef315fbe08af9f95568a1"
//         },
//         "assets/internal/config.json": {
//             "size": 1531,
//             "md5": "7ab06baeaff366f9b2ea0325793aeeb6"
//         },
//         "assets/internal/import/0b/0b6c4470e.json": {
//             "size": 140960,
//             "md5": "9537fa4eebb7bfc5ec324e8e1fd1fb10"
//         },
//         "assets/internal/index.js": {
//             "size": 563,
//             "md5": "17bbe37ff0cf8a423d62b40e327e0b9e"
//         },
//         "assets/internal/native/02/0275e94c-56a7-410f-bd1a-fc7483f7d14a.png": {
//             "size": 82,
//             "md5": "cea68f0d7cba38440224f6f74531e2d8"
//         },
//         "assets/internal/native/60/600301aa-3357-4a10-b086-84f011fa32ba.png": {
//             "size": 7518,
//             "md5": "c3a3a78f9b25e1da1df945e4082e3b58"
//         },
//         "assets/main/config.json": {
//             "size": 4618,
//             "md5": "b446f02e47c520a541439507a0d1779c"
//         },
//         "assets/main/import/0e/0e1737068.json": {
//             "size": 272211,
//             "md5": "a36f3511519f4b13763074bc686a2e22"
//         },
//         "assets/main/index.js": {
//             "size": 1091540,
//             "md5": "f63eef0296cb3568091b13ae2c3cf5af"
//         },
//         "assets/main/native/02/0291c134-b3da-4098-b7b5-e397edbe947f.png": {
//             "size": 1047,
//             "md5": "b7a3e142819a36b25f4a2cfc71237852"
//         },
//         "assets/main/native/12/129afecff.png": {
//             "size": 269430,
//             "md5": "94456c96acd2c6e733a71fde9e23fe28"
//         },
//         "assets/main/native/56/567dcd80-8bf4-4535-8a5a-313f1caf078a.png": {
//             "size": 1675,
//             "md5": "5f1d92d4416374a0500f336771a68366"
//         },
//         "assets/main/native/61/617323dd-11f4-4dd3-8eec-0caf6b3b45b9.png": {
//             "size": 1187,
//             "md5": "6d707a7a357fe9eb17dce608a8255e7d"
//         },
//         "assets/main/native/71/71561142-4c83-4933-afca-cb7a17f67053.png": {
//             "size": 1050,
//             "md5": "c06a93f5f1a8a1c6edc4fd8b52e96cbf"
//         },
//         "assets/main/native/7a/7ac8413e-bb3d-4cca-a15f-925d6ec49e11.manifest": {
//             "size": 2650,
//             "md5": "aa1303481df46eb92597f389f5ced2c2"
//         },
//         "assets/main/native/9d/9d60001f-b5f4-4726-a629-2659e3ded0b8.png": {
//             "size": 2066,
//             "md5": "e023432881e710d140a2704f9e146b3c"
//         },
//         "assets/main/native/b4/b43ff3c2-02bb-4874-81f7-f2dea6970f18.png": {
//             "size": 1114,
//             "md5": "83fcc9912e01ae5411c357651fb8b1cf"
//         },
//         "assets/main/native/d6/d6d3ca85-4681-47c1-b5dd-d036a9d39ea2.png": {
//             "size": 1047,
//             "md5": "d55c2eb11156ee03fcc4549419c7f61b"
//         },
//         "assets/main/native/d8/d81ec8ad-247c-4e62-aa3c-d35c4193c7af.png": {
//             "size": 158,
//             "md5": "cdbc996e9ab38bf90c517c528459810e"
//         },
//         "assets/main/native/e8/e851e89b-faa2-4484-bea6-5c01dd9f06e2.png": {
//             "size": 1082,
//             "md5": "90cf45d059d0408bec327f66eae5764c"
//         }
//     },
//     "searchPaths": [

//     ]
// });
var customManifestStr = ""
module.exports = cc.Class({
    extends: cc.Component,

    properties: {
        info: cc.Label,
        info2: cc.Label,
        pannelNode: {
            type: cc.Node,
            default: null
        },
        manifestUrl: {
            type: cc.Asset,
            default: null
        },
        fileProgress: cc.ProgressBar,
        fileLabel: cc.Label,
        close: cc.Node,
        checkButton: cc.Node,
        retryButton: cc.Node,
        updateButton: cc.Node,
        _updating: false,
        _canRetry: false,
        _storagePath: ''
    },

    checkCb: function (event) {
        console.log('Code: ' + event.getEventCode());
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.info.string = "No local manifest file found, hot update skipped.";
                this.node.active = false
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.info.string = "Fail to download manifest file, hot update skipped.";
                this.node.active = false

                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.info.string = "Already up to date with the latest remote version.";
                this.node.active = false
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                this.info.string = 'New version found, please try to update. (' + this._am.getTotalBytes() + ')';
                this.checkButton.active = false;
                this.fileProgress.progress = 0;
                break;
            default:
                return;
        }

        this._am.setEventCallback(null);
        this._checkListener = null;
        this._updating = false;
    },
    onClose() {
        if (this._updating) {
            return
        }
        this.node.active = false

    },
    updateCb: function (event) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.info.string = 'No local manifest file found, hot update skipped.';
                this.node.active = false
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                this.pannelNode.active = true
                this.fileProgress.progress = event.getPercentByFile();

                this.fileLabel.string = event.getDownloadedFiles() + ' / ' + event.getTotalFiles();

                var msg = event.getMessage();
                if (msg) {
                    this.info.string = 'Updated file: ' + msg;
                    console.log(event.getPercent() / 100 + '% : ' + msg);
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.info.string = 'Fail to download manifest file, hot update skipped.';
                failed = true;
                this.node.active = false

                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.info.string = 'Already up to date with the latest remote version.';
                failed = true;
                this.node.active = false
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.info.string = '更新完成，请重新启动游戏' + event.getMessage();
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                this.info.string = 'Update failed. ' + event.getMessage();
                this.retryButton.active = true;
                this._updating = false;
                this._canRetry = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                this.info.string = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.info.string = event.getMessage();
                break;
            default:
                break;
        }

        if (failed) {
            this._am.setEventCallback(null);
            this._updateListener = null;
            this._updating = false;
        }
        if (needRestart) {
            this._am.setEventCallback(null);
            this._updateListener = null;
            // Prepend the manifest's search path
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            console.log(JSON.stringify(newPaths));
            for (var i = 0; i < newPaths.length; i++) {
                if (searchPaths.indexOf(newPaths[i]) == -1) {
                    Array.prototype.unshift.apply(searchPaths, [newPaths[i]]);
                }
            }
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);
            cc.audioEngine.stopAll();
            cc.game.restart();
        }
    },

    loadCustomManifest: function () {

        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            var manifest = new jsb.Manifest(customManifestStr, this._storagePath);
            this._am.loadLocalManifest(manifest, this._storagePath);
            this.info.string = 'Using custom manifest';
        }
    },

    retry: function () {
        if (!this._updating && this._canRetry) {
            this.retryButton.active = false;
            this._canRetry = false;

            this.info.string = 'Retry failed Assets...';
            this._am.downloadFailedAssets();
        }
    },
    start() {
        if (window.wx) {
            return
        }
        this.hotUpdate()
    },
    checkUpdate: function () {
        if (this._updating) {
            return;
        }
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            // Resolve md5 url
            var url = this.manifestUrl.nativeUrl;
            if (cc.loader.md5Pipe) {
                url = cc.loader.md5Pipe.transformURL(url);
            }
            this._am.loadLocalManifest(url);
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            this.info.string = 'Failed to load local manifest ...';
            return;
        }
        this._am.setEventCallback(this.checkCb.bind(this));

        this._am.checkUpdate();
        this._updating = true;

    },

    hotUpdate: function () {
        if (this._am && !this._updating) {

            this._am.setEventCallback(this.updateCb.bind(this));

            if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {

                // Resolve md5 url
                var url = this.manifestUrl.nativeUrl;
                if (cc.loader.md5Pipe) {
                    url = cc.loader.md5Pipe.transformURL(url);
                }
                this._am.loadLocalManifest(url);
            }

            this._failCount = 0;

            this._am.update();

            this.updateButton.active = false;
            this._updating = true;
        }
    },

    // use this for initialization
    onLoad: function () {

        //初始化basseEvent``
        // Hot update is only available in Native build
        if (!cc.sys.isNative || window.wx) {
            this.node.active = false
            return;
        }
        var contextNode = cc.find("context")
        if (contextNode) {
            this.context = contextNode.getComponent('Ctx')
        }
        this._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'yourwar-remote-asset');

        console.log('Storage path for remote asset : ' + this._storagePath);
        this.info2.string = this._storagePath
        // Setup your own version compare handler, versionA and B is versions in string
        // if the return value greater than 0, versionA is greater than B,
        // if the return value equals 0, versionA equals to B,
        // if the return value smaller than 0, versionA is smaller than B.
        this.versionCompareHandle = function (versionA, versionB) {
            console.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                }
                else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            }
            else {
                return 0;
            }
        };

        // Init with empty manifest url for testing custom manifest
        this._am = new jsb.AssetsManager('', this._storagePath, this.versionCompareHandle);

        var panel = this;
        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this._am.setVerifyCallback(function (path, asset) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            if (compressed) {
                panel.info.string = "Verification passed : " + relativePath;
                return true;
            }
            else {
                panel.info.string = "Verification passed : " + relativePath + ' (' + expectedMD5 + ')';
                return true;
            }
        });

        this.info.string = 'Hot update is ready, please check or directly update.';

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // Some Android device may slow down the download process when concurrent tasks is too much.
            // The value may not be accurate, please do more test and find what's most suitable for your game.
            this._am.setMaxConcurrentTask(2);
            this.info.string = "Max concurrent tasks count have been limited to 2";
        }

        this.fileProgress.progress = 0;
    },

    onDestroy: function () {
        if (this._updateListener) {
            this._am.setEventCallback(null);
            this._updateListener = null;
        }
    }
});
