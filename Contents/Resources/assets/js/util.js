/**
 *
 * @authors  Nealyang(nealyang231@gmail.com)
 * @date    2017/12/19
 * @version 1.0.0
 */

function canDebug() {
    return false;
}

function showNotification(content) {
    var templ = '<div class="notification-div">\n' +
        '    <span>'+content+'</span>\n' +
        '</div>';
    if($('.notification-div').length === 0){
        $(document.body).append(templ);
        setTimeout(function () {
            $('.notification-div').remove();
        },3000)
    }
}

function showLoading() {
    var htmlTemp = '<div class="loading_container">\n' +
        '    <div class="load-container load4">\n' +
        '        <div class="loader">Loading...</div>\n' +
        '    </div>\n' +
        '</div>';
    $(document.body).append(htmlTemp);
}

function hidenLoading() {
    $(document.body).find('.loading_container').remove();
}

function setAllLayerNames(obj) {
    if(typeof obj === 'object'){
        obj = JSON.stringify(obj);
    }
    window.localStorage.setItem('LayerNames',obj)
}

function getAllLayerNames() {
    return JSON.parse(localStorage.getItem('LayerNames'));
}

function updateHash(key,content) {
    content = typeof content==='object'?JSON.stringify(content):content;
    window.location.hash = key+'='+encodeURIComponent(content) + '&date=' + new Date().getTime();
    return false
}

function sendAllLayerNames() {
    updateHash('LayerNames',localStorage.getItem('LayerNames'))
}

function setLayerNamesSuccess() {
    updateHash('globalFalg','');
    $('.content_container').find('p').removeClass('item_has_selected');
}

function updateLayerNames(oldName,newName) {
    var layerNames = getAllLayerNames(),
        $ps = $('.content_container p');
    if(layerNames[oldName]===1){
        delete layerNames[oldName]
    }else{
        layerNames[oldName] -=1;
    }
    if(layerNames[newName]){
        layerNames[newName]+=1;
    }else{
        layerNames[newName] = 1;
    }
    setAllLayerNames(layerNames);
    for(var i = 0,length = $ps.length;i<length;i++){
        var $p = $($ps[i]),
            text = $p.find('span:first').text();
        if(layerNames[text]){
            $p.hasClass('item_has_used')?
                $p.find('span:last').text(layerNames[text]):
                $p.addClass('item_has_used').append('<span class=\"item-span-useNum\">'+layerNames[text]+'</span>');
        }else{
            $p.hasClass('item_has_used')?$p.removeClass('item_has_used').find('span:last').remove():null;
        }
    }
}