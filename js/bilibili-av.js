---
---
function formatCodeToList(code) {
    let codes = code.split("\n");
    let ul = $("<ul/>");
    for (let i = 0; i < codes.length; i++) {
        $("<li/>").text(codes[i]).appendTo(ul)
    }
    return ul;
}

$(function () {
    $(".xz-bili-av-confirm").click(function () {
        $.get({
            "url": scriptDomain + "/bilibili.py?aid=" + +($(".xz-bili-av-input").val()),
            "timeout": 5000
        }).done(function (data) {
            if (data && data["code"] == 0) {
                let bvid = data["data"]["bvid"];
                $(".xz-bili-av-output").val(bvid)
                $(".xz-bilibili-av-output-raw code").append(formatCodeToList(JSON.stringify(data, null, 2)))
            }
        })
    })
    $(".xz-bili-bv-confirm").click(function () {
        let bvid = $(".xz-bili-bv-input").val().split("=")[0];
        if (bvid.slice(0, 2) == "BV") {
            bvid = bvid.slice(2);
        }
        $(".xz-bili-bv-input").val(bvid);
        $.get({
            "url": scriptDomain + "/bilibili.py?bvid=" + bvid,
            "timeout": 5000
        }).done(function (data) {
            if (data && data["code"] == 0) {
                let bvid = data["data"]["aid"];
                $(".xz-bili-bv-output").val(bvid)
                $(".xz-bilibili-bv-output-raw code").append(formatCodeToList(JSON.stringify(data, null, 2)))
            }
        })
    })
})