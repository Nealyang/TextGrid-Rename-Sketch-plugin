/**
 *
 * @authors  Nealyang(nealyang231@gmail.com)
 * @date    2017/12/11
 * @version 1.0.0
 *
 */
// document.addEventListener("contextmenu", function(e) {
//   e.preventDefault();
// });

function test(value) {
    console.log(1111)
    console.log(value)
}

$(document).ready(function () {
    function updateHash(hash) {
        //We can send a simple command or a command with a parameter and value
        //You can extend this function to send multiple values. script.js will parse
        //all the values and expose them in the hash object so you can use them
        //new Date is there just to make sure the url is alwasy different
        window.location.hash = hash + '&date=' + new Date().getTime();
        console.log(window.location)
        return false
    }
    
    const WINDOW_HEIGHT = window.outerHeight - 22;//578
    var $loadingContainer = $('.loading_container'),
        $loginHeaderContainer = $('.index_header_container'),
        $loignSuccessTitle = $('.login_success_title'),
        $loginButtonContainer = $('.login_button_container'),
        $listContainer = $('.list_container');

    function showLoading() {
        $loadingContainer.css({'display': 'flex'});
    }

    function hidenLoading() {
        $loadingContainer.css({'display': 'none'})
    }

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
        showLoading();
        $.ajax({
            url:'https://textgrid.develenv.com/tg/getprolist',
            method:"GET",
            success:function (data) {
                hidenLoading();
                typeof data === 'string'?data = JSON.parse(data):data = data;
                if(data.code == 200){
                    renderList(data.data);
                }
            },
            error:function (data) {
                hidenLoading();
                console.log(data)
            }
        })
    }

    /**
     * 登录
     */
    function login() {
        // showLoading();
        // $.ajax({
        //     url:'https://textgrid.develenv.com/tg/login',
        //     type:"get",
        //     dataType:'json',
        //     success:function (data) {
        //         hidenLoading();
        //         if(data.data.redirectUrl){
        //             // window.location.href=data.data.redirectUrl
        //             loginSuccessStyleChange();
        //             getProjectList();
        //         }
        //     },
        //     error:function (data) {
        //         hidenLoading();
        //         console.log(data,'error')
        //     }
        // })
        var tem = {
            a:'lala',
            name:'Nealyang'
        }
        updateHash('Nealyang='+JSON.stringify(tem))
    }


    $('.login_button').bind('click', login)
        .parent().css({'height': WINDOW_HEIGHT - 222 + 'px'});

    $listContainer.on('click','p',function () {
        window.location.href = './list.html?token='+$(this).attr('token')+'&id='+$(this).attr('id')
    })

});
