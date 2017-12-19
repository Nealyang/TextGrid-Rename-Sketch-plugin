/**
 *
 * @authors  Nealyang(nealyang231@gmail.com)
 * @date    2017/12/14
 * @version 1.0.0
 */
$(document).ready(function () {
    var href = window.location.href,
        token = href.substring(href.indexOf('token=') + 6, href.indexOf('&id')),
        id = href.substring(href.indexOf('&id=') + 4, href.length);
    $('.content_container').on('scroll', function (e) {
        var tar = e.originalEvent.currentTarget,
            scrollHeight = tar.scrollHeight,
            scrollTop = tar.scrollTop,
            clientHeight = tar.clientHeight;

        if (scrollHeight === scrollTop + clientHeight) {
            console.log('加载更多')
        }
    })
});