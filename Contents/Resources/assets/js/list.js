/**
 *
 * @authors  Nealyang(nealyang231@gmail.com)
 * @date    2017/12/14
 * @version 1.0.0
 *
 * globalFlag：需要设置的变量
 *
 * layerNames:text图层名
 *
 */
if(!canDebug()){
    document.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });
}
$(document).ready(function () {


    var href = window.location.search,
        token = href.substring(href.indexOf('token=') + 6, href.indexOf('&id')),
        id = href.substring(href.indexOf('&id=') + 4, href.length),
        $settingPanel = $('.setting-container'),
        $buttons = $('.buttons_div'),
        $totalNum = $('.bottom_container'),
        $showUsedInput = $('.show_unused input'),
        showUnUsed = false,
        $select = $('.setting-panel select'),
        contentLanguageType = '',
        GLOBALFLAG='globalFlag',
        LAYERNAMES='layerNames',
        reqData = {
            proId: id,
            orderType: 'time',
            orderRule: 'desc',
            pageId: 0,
            keyWord:''
        },
        languageTypes = [],//语种
        globalFlag = {
            changeContent: false,
            content: {
                key: '',
                value: ""
            }
        };

    //搜索框
    $('.searchInput').on('input',function (e) {
        reqData.keyWord = $(this).val();
    });
    $('.searchInput').bind('keypress',function (event) {
        if(event.keyCode == '13'){
            reqData.pageId = 0;
            getData(reqData);
        }
    });
    $('.icon-search').on('click',function (e) {
        reqData.pageId = 0;
        getData(reqData);
    });

    //设置按钮、排序
    $buttons.click(function (event) {
        var $targetDom = $(event.target);
        if ($targetDom.hasClass('icon_shezhi_local')) {
            //设置按钮
            if(languageTypes.length && $select.children().length===1){
                var tempP = '';
                for(var i = 0,length = languageTypes.length;i<length;i++){
                    tempP+='<option value="'+languageTypes[i]+'">'+languageTypes[i]+'</option>'
                }
                $select.append(tempP);
            }
            $settingPanel.css({'display': 'block'})
        } else {
            if ($targetDom.hasClass('icon_selected')||(!$targetDom.hasClass('iconfont'))) return;
            reqData.pageId = 0;
            $buttons.find('span').removeClass('icon_selected');
            $targetDom.addClass('icon_selected');
            if ($targetDom.hasClass('icon-A-Z_local')) {
                reqData.orderType = 'word';
                reqData.orderRule = 'asc';
                getData(reqData);
            } else if ($targetDom.hasClass('icon-Z-A_local')) {
                reqData.orderType = 'word';
                reqData.orderRule = 'desc';
                getData(reqData);
            } else if ($targetDom.hasClass('icon-shijianzheng_local')) {
                reqData.orderType = 'time';
                reqData.orderRule = 'asc';
                getData(reqData);
            } else if ($targetDom.hasClass('icon-shijiandao_local')) {
                reqData.orderType = 'time';
                reqData.orderRule = 'desc';
                getData(reqData);
            }
        }
        event.stopPropagation();
    });

    //隐藏设置面板
    $settingPanel.click(function (event) {
        if (event.target === this) {
            $settingPanel.css({'display': 'none'})
        }
    });

    // 加载更多
    $('.content_container').on('scroll', function (e) {
        var tar = e.originalEvent.currentTarget,
            scrollHeight = tar.scrollHeight,
            scrollTop = tar.scrollTop,
            clientHeight = tar.clientHeight;

        if (scrollHeight === scrollTop + clientHeight) {
            reqData.pageId += 1;
            getData(reqData)
        }
        shouldLoadMore();
    });


    //只显示未使用
    $showUsedInput.click(function () {
        showUnUsed = $(this).prop('checked');
        var $itemsContainer = $('.content_container');
        if(showUnUsed){
            $itemsContainer.children('.item_has_used').css({'display':'none'});
        }else{
            $itemsContainer.children().css({'display':'flex'});
        }
        shouldLoadMore();
        event.stopPropagation();
    });

    //设置语言
    $select.change(function () {
        contentLanguageType = $.trim($(this).children('option:selected').val());
    });

    function getData(reqData) {
        showLoading();
        $.ajax({
            url: 'https://textgrid.develenv.com/api/tg/getkvlist',
            type: 'get',
            data: reqData,
            success: function (data) {
                hidenLoading();
                var htmlTemp = '';
                data = typeof data === 'object' ? data : JSON.parse(data);
                $totalNum.text('共' + data.data.total + '条数据');
                languageTypes = data.data.language;
                var i = 0,
                    length = data.data.proKvData.length;
                if (reqData.pageId === 0) {
                    $('.content_container p').remove();
                }
                for (; i < length; i++) {
                    var tempItem = data.data.proKvData[i];
                    var usedNum = judgeKeyInObj(tempItem.key);
                    if (usedNum) {
                        //图层名有使用
                        htmlTemp += "<p class=\"item_has_used\" data=\'"+JSON.stringify(tempItem.data)+"\'>\n" +
                            "        <span>" + tempItem.key + "</span>\n" +
                            "        <span class=\"item-span-useNum\">" + usedNum + "</span>\n" +
                            "    </p>"
                    } else {
                        // 图层名没有使用
                        htmlTemp += "<p data=\'"+JSON.stringify(tempItem.data)+"\'>\n" +
                            "        <span>" + tempItem.key + "</span>\n" +
                            "    </p>"
                    }
                }

                $('.content_container').append(htmlTemp);
                if(showUnUsed){
                    //显示未使用的
                    $('.content_container .item_has_used').css({'display':'none'});
                }
                if (data.data.proKvData.length === 0) {
                    showNotification('没有更多数据了');
                    return;
                }
                shouldLoadMore();
            },
            error: function (data) {
                hidenLoading();
                showNotification('接口请求错误:' + data)
            }
        })
    }

    /**
     * 判断layerNames是否包含这个key
     * @param key
     */
    function judgeKeyInObj(key) {
        var layerNames = getAllLayerNames();
        return layerNames[key]
    }

    /**
     * 未滚动情况下判断是否需加载更多
     */
    function shouldLoadMore() {
        if ($('.content_container p:visible').length < 12) {
            reqData.pageId += 1;
            getData(reqData);
        }
    }

    /**
     * 设置globalFlag
     */
    $('.content_container').on('click','p',function (event) {
        $(this).parent().find('p').removeClass('item_has_selected');
        $(this).addClass('item_has_selected')
        globalFlag.content.key = $.trim($(this).text());
        globalFlag.changeContent = false;
        if(contentLanguageType){
            var data = JSON.parse($(this).attr('data'));
            for(var i = 0,length = data.length;i<length;i++){
                if(data[i].language === contentLanguageType){
                    globalFlag.content.value = $.trim(data[i].value);
                    globalFlag.changeContent = true;
                    updateHash(GLOBALFLAG,globalFlag);
                    return;
                }
            }
        }
        updateHash(GLOBALFLAG,globalFlag);
    });

    /**
     * 切换项目
     */
    $('.changePro').on('click',function () {
        window.history.go(-1);
    });

    getData(reqData);
});