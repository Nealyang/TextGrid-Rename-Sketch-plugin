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

    // Create an NSThread dictionary with a specific identifier
    var threadDictionary = NSThread.mainThread().threadDictionary();
    var identifier = "com.sketchapp.rename";

    // If there's already a panel, prevent the plugin from running
    if (threadDictionary[identifier]) return;


    var panel = NSPanel.alloc().init();
    panel.setFrame_display(NSMakeRect(0, 0, panelWidth, panelHeight), true);
    var titleBgColor = NSColor.colorWithRed_green_blue_alpha(54 / 255, 54 / 255, 54 / 255, 1);
    panel.setStyleMask(NSTexturedBackgroundWindowMask | NSTitledWindowMask | NSClosableWindowMask | NSFullSizeContentViewWindowMask);
    panel.setBackgroundColor(NSColor.whiteColor());

    // Set the panel's title and title bar appearance
    panel.title = "";
    panel.titlebarAppearsTransparent = true;

    var titlebarView = panel.titlebarViewController().view();
    titlebarView.setBackgroundColor(titleBgColor);

    panel.setBackgroundColor(titleBgColor);

    // Center and focus the panel
    panel.center();
    panel.makeKeyAndOrderFront(null);
    panel.setLevel(NSFloatingWindowLevel);

    // Make the plugin's code stick around (since it's a floating panel)
    COScript.currentCOScript().setShouldKeepAround_(true);

    // Hide the Minimize and Zoom button
    panel.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
    panel.standardWindowButton(NSWindowZoomButton).setHidden(true);

    // Create the blurred background
    var vibrancy = NSVisualEffectView.alloc().initWithFrame(NSMakeRect(0, 0, panelWidth, panelHeight));
    vibrancy.setAppearance(NSAppearance.appearanceNamed(NSAppearanceNameVibrantLight));
    vibrancy.setBlendingMode(NSVisualEffectBlendingModeBehindWindow);

    // Create the WebView with a request to a Web page in Contents/Resources/
    var webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, panelWidth, panelHeight - 44));
    var request = NSURLRequest.requestWithURL(context.plugin.urlForResourceNamed("index.html"));
    webView.mainFrame().loadRequest(request);
    webView.setDrawsBackground(false);

    var windowObject = webView.windowScriptObject();
    var delegate = new MochaJSDelegate({
        // Listen for URL changes
        "webView:didChangeLocationWithinPageForFrame:":(function (webView,webFrame) {
            //We call this function when we know that the webview has finished loading
            //It's a function in the UI and we run it with a parameter coming from the updated context
            var locationHash = windowObject.evaluateWebScript("window.location.hash");
            log(locationHash)
            var hash = parseHash(locationHash);
            log(hash);
            log(hash.Nealyang)
            log(JSON.parse(hash.Nealyang))
        }),
        "webView:didFinishLoadForFrame:" : (function(webView, webFrame) {
            //We call this function when we know that the webview has finished loading
            //It's a function in the UI and we run it with a parameter coming from the updated context
            windowObject.evaluateWebScript("test(fdddddddd)");
        }),
    });

    // Set the delegate on the WebView
    webView.setFrameLoadDelegate_(delegate.getClassInstance());

    // Add the content views to the panel
    panel.contentView().addSubview(vibrancy);
    panel.contentView().addSubview(webView);

    // After creating the panel, store a reference to it
    threadDictionary[identifier] = panel;

    var closeButton = panel.standardWindowButton(NSWindowCloseButton);

    // Assign a function to the Close button
    closeButton.setCOSJSTargetFunction(function (sender) {
        panel.close();

        // Remove the reference to the panel
        threadDictionary.removeObjectForKey(identifier);

        // Stop the plugin
        COScript.currentCOScript().setShouldKeepAround_(false);
    });
}

function parseHash(aURL) {
    aURL = aURL;
    var vars = {};
    var hashes = aURL.slice(aURL.indexOf('#') + 1).split('&');

    for(var i = 0; i < hashes.length; i++) {
        var hash = hashes[i].split('=');

        if(hash.length > 1) {
            vars[hash[0].toString()] = hash[1];
        } else {
            vars[hash[0].toString()] = null;
        }
    }

    return vars;
}

function clickFun(context) {
    var doc = context.document,
        plugin = context.plugin,
        command = context.command,
        page = doc.currentPage(),
        artboards = page.artboards(),
        artboard = page.currentArtboard(),
        selection = context.selection;
    var identifier = context.command.identifier();
    var artboardEnumerator = artboards.objectEnumerator();
    while (artboard = artboardEnumerator.nextObject()) {
        var layers = artboard.layers();
        //var layers = artboard.children();
        // log(layers);
        log(artboard.children())
    }

    doc.showMessage('Hello Nealyang');
    if (selection.count() == 0) {
        doc.showMessage("Please select one or more items.")
        return
    } else {
        //显示输入框
        var newName = doc.askForUserInput_initialValue("New layer name", selection[0].name())
        var loop = selection.objectEnumerator()
        console.log(loop);
        var layer = loop.nextObject();
        doc.showMessage(layer.name());
        layer.setName('Nealyang')
    }
}

function clickLayer(context) {
    var identifier = "com.sketchapp.rename";
    var threadDictionary = NSThread.mainThread().threadDictionary();
    // Check if there's a panel opened or not
    if (threadDictionary[identifier]) {
        log('哈哈哈')
        var panel = threadDictionary[identifier];

        // Access the panel from the reference and the WebView
        var webView = panel.contentView().subviews()[1];
        var windowObject = webView.windowScriptObject();
        windowObject.evaluateWebScript("test('呼哈哈哈，成功啦')");
    }

    var action = context.actionContext;


    var document = action.document;
    var selection = action.newSelection;
    var loop = selection.objectEnumerator();
    var layer = loop.nextObject();
    count = selection.count();
    console.log(selection[0]);
    if (count == 0) {
        return;

    } else {

        if (count == 1) {
            message = layer.name();
            // layer.setName('ee')
        } else {
            message = count + " layers selected."
        }

        document.showMessage(message);
    }
}