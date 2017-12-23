/**
 *
 * @authors  Nealyang(nealyang231@gmail.com)
 * @date    2017/12/11
 * @version 1.0.0
 *
 */
if(!canDebug()){
    document.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });
}

$(document).ready(function () {
    
    const WINDOW_HEIGHT = window.outerHeight - 22;//578
    var $loadingContainer = $('.loading_container'),
        $loginHeaderContainer = $('.index_header_container'),
        $loignSuccessTitle = $('.login_success_title'),
        $loginButtonContainer = $('.login_button_container'),
        $listContainer = $('.list_container');


    function loginSuccessStyleChange() {
        $loginHeaderContainer.css({'height': '140px'});
        $loginHeaderContainer.find('p:not(.login_success_title)').css({'display': 'none'});
        $loignSuccessTitle.css({'display': 'block'});
        $loginButtonContainer.css({'display': 'none'});
        $listContainer.css({'display': 'block'})
    }


    function renderList(arr) {
        var length = arr.length,
            i = 0,
            htmlTemp='';
        for(;i<length;i++){
            htmlTemp+='<p token="'+arr[i].token+'" id="'+arr[i].id+'">\n' +
                '        <span>'+arr[i].proname+'</span>\n' +
                '        <img src="assets/imgs/arrow.png">\n' +
                '    </p>'
        }
        $listContainer.empty().html(htmlTemp);
    }

    /***
     * 获取项目列表
     */

    function getProjectList() {
        $.ajax({
            url:'https://nealyang.com/getprolist',
            method:"GET",
            success:function (data) {
                hidenLoading();
                loginSuccessStyleChange();
                typeof data === 'string'?data = JSON.parse(data):data = data;
                if(data.code == 200){
                    renderList(data.data);
                }
            },
            error:function (data) {
                hidenLoading();
                loginSuccessStyleChange();
                showNotification('请求出错:'+data);
            }
        })
    }
    if($listContainer.children()){
        showLoading();
        setTimeout(function () {
            getProjectList();
        },500);
    }

    $listContainer.on('click','p',function () {
        window.location.href = './list.html?token='+$(this).attr('token')+'&id='+$(this).attr('id')
    });

});
