/**
 *
 * @authors  Nealyang(nealyang231@gmail.com)
 * @date    2017/12/11
 * @version 1.0.0
 *
 */
@import "MochaJSDelegate.js";


function onRun(context) {


    var panelWidth = 500;
    var panelHeight = 622;

    var threadDictionary = NSThread.mainThread().threadDictionary();
    var identifier = "com.sketchapp.rename";

    if (threadDictionary[identifier]) return;


    var panel = NSPanel.alloc().init();
    panel.setFrame_display(NSMakeRect(0, 0, panelWidth, panelHeight), true);
    var titleBgColor = NSColor.colorWithRed_green_blue_alpha(54 / 255, 54 / 255, 54 / 255, 1);
    panel.setStyleMask(NSTexturedBackgroundWindowMask | NSTitledWindowMask | NSClosableWindowMask | NSFullSizeContentViewWindowMask);
    panel.setBackgroundColor(NSColor.whiteColor());

    panel.title = "";
    panel.titlebarAppearsTransparent = true;

    var titlebarView = panel.titlebarViewController().view();
    titlebarView.setBackgroundColor(titleBgColor);

    panel.setBackgroundColor(titleBgColor);

    panel.center();
    panel.makeKeyAndOrderFront(null);
    panel.setLevel(NSFloatingWindowLevel);

    COScript.currentCOScript().setShouldKeepAround_(true);

    panel.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
    panel.standardWindowButton(NSWindowZoomButton).setHidden(true);

    var vibrancy = NSVisualEffectView.alloc().initWithFrame(NSMakeRect(0, 0, panelWidth, panelHeight));
    vibrancy.setAppearance(NSAppearance.appearanceNamed(NSAppearanceNameVibrantLight));
    vibrancy.setBlendingMode(NSVisualEffectBlendingModeBehindWindow);

    var webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, panelWidth, panelHeight - 44));
    var request = NSURLRequest.requestWithURL(context.plugin.urlForResourceNamed("index.html"));
    webView.mainFrame().loadRequest(request);
    webView.setDrawsBackground(false);

    var windowObject = webView.windowScriptObject();
    var delegate = new MochaJSDelegate({
        "webView:didChangeLocationWithinPageForFrame:": (function (webView, webFrame) {
            var locationHash = windowObject.evaluateWebScript("window.location.hash");
            var hash = parseHash(locationHash);
        }),
        "webView:didFinishLoadForFrame:": (function (webView, webFrame) {
            getAllTextLayer(context);
        })
    });

    webView.setFrameLoadDelegate_(delegate.getClassInstance());

    panel.contentView().addSubview(vibrancy);
    panel.contentView().addSubview(webView);

    threadDictionary[identifier] = panel;

    var closeButton = panel.standardWindowButton(NSWindowCloseButton);

    closeButton.setCOSJSTargetFunction(function (sender) {
        panel.close();

        threadDictionary.removeObjectForKey(identifier);

        COScript.currentCOScript().setShouldKeepAround_(false);
    });

}

// 获取所有TextLayer
function getAllTextLayer(context) {
    var identifier = "com.sketchapp.rename";
    var threadDictionary = NSThread.mainThread().threadDictionary();
    // if(!threadDictionary[identifier]) return;
    var panel = threadDictionary[identifier];
    var webView = panel.contentView().subviews()[1];
    var windowObject = webView.windowScriptObject();

    var doc;
    if (context.document) {
        doc = context.document;
    } else {
        doc = context.actionContext.document;
    }
    var page = doc.currentPage(),
        artboards = page.artboards(),
        artboardEnumerator = artboards.objectEnumerator();
    var textLayerNames = {};
    while (artboard = artboardEnumerator.nextObject()) {
        for (var i = 0; i < artboard.children().count(); i++) {
            if (artboard.children()[i].class().toString() == 'MSTextLayer') {
                var name = artboard.children()[i].name().toString();
                artboard.children()[i].addAttribute_value('oldName', name);
                log(name);
                if (textLayerNames[name]) {
                    textLayerNames[name] += 1;
                } else {
                    textLayerNames[name] = 1;
                }
            }
        }
    }
    windowObject.evaluateWebScript("setAllLayerNames('" + JSON.stringify(textLayerNames) + "')");
}


function parseHash(aURL) {
    aURL = aURL;
    var vars = {};
    var hashes = aURL.slice(aURL.indexOf('#') + 1).split('&');

    for (var i = 0; i < hashes.length; i++) {
        var hash = hashes[i].split('=');

        if (hash.length > 1) {
            vars[hash[0].toString()] = hash[1];
        } else {
            vars[hash[0].toString()] = null;
        }
    }

    return vars;
}

function getHashValue(key) {
    var identifier = "com.sketchapp.rename";
    var threadDictionary = NSThread.mainThread().threadDictionary();
    if (!threadDictionary[identifier]) return;
    var panel = threadDictionary[identifier];

    var webView = panel.contentView().subviews()[1];
    var windowObject = webView.windowScriptObject();
    var locationHash = windowObject.evaluateWebScript("window.location.hash");
    var hash = parseHash(locationHash);

    return hash[key] ? JSON.parse(decodeURIComponent(hash[key])) : null;
}


function clickLayer(context) {
    //插件未打开，不进行操作
    var identifier = "com.sketchapp.rename";
    var threadDictionary = NSThread.mainThread().threadDictionary();
    if (!threadDictionary[identifier]) return;

    var panel = threadDictionary[identifier];
    var windowObject = panel.contentView().subviews()[1].windowScriptObject();
    var globalFlag = getHashValue('globalFlag');
    var oldLayerName = '',newLayerName='';
    var action = context.actionContext;
    if(action.oldSelection && action.oldSelection.objectEnumerator() && action.oldSelection.objectEnumerator().nextObject()){
        var tempLayer = action.oldSelection.objectEnumerator().nextObject();
        if(tempLayer.class()&&tempLayer.class().toString() == 'MSTextLayer'){
            oldLayerName = tempLayer.attributeForKey('oldName');
            newLayerName = tempLayer.name();
           if(oldLayerName != newLayerName){
               windowObject.evaluateWebScript("updateLayerNames('"+oldLayerName+"','"+newLayerName+"')");
               tempLayer.addAttribute_value('oldName', newLayerName);
           }
        }

    }

    var document = action.document;
    var selection = action.newSelection;
    var loop = selection.objectEnumerator();
    var layer = loop.nextObject();
    //判断上一个是否重命名了

    if (layer&&layer.class()&&layer.class().toString() == 'MSTextLayer') {
        if (globalFlag) {
            // 需要进行重命名操作
            log(globalFlag);
            if (globalFlag.changeContent) {
                //需要设置内容
                layer.stringValue = globalFlag.content.value;
            }

            layer.setName(globalFlag.content.key);
            globalFlag = null;
            windowObject.evaluateWebScript("setLayerNamesSuccess()");

        }
    }
}
