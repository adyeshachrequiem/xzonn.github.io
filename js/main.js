"use strict";

$(function () {
    window.pageInfo = window.pageInfo || {};
    /* 目录 */
    window.tocRender = (window.tocRender || function() {
        $(".mw-parser-output #toc").remove();
        let toc = $("<div/>"),
            lastRank = 1,
            tocID = [],
            headings = $(".xz-content").find("h2, h3, h4"),
            headingIds = 0;
        if (!headings) {
            return;
        }
        headings.each(function(n, t) {
            if (this.classList.contains("visible-print-block") || this.classList.contains("no-toc")) {
                return;
            }
            if (!this.id) {
                this.id = "heading-" + (++headingIds);
            } else if (this.id.slice(0, 5) == "fake-") {
                $(this).find("span.xz-fake-bookmark").remove();
                this.id = this.id.slice(5);
            }
            var thisRank = +this.tagName[1];
            while (thisRank > lastRank) {
                tocID.push(0);
                if (toc.children().length == 0) {
                    toc = $("<li/>").addClass("no-list-style").appendTo($(toc));
                }
                toc = $("<ul/>").addClass("nav nav-stacked").appendTo($(toc.children()[toc.children().length - 1] || toc));
                thisRank--;
            }
            while (lastRank > thisRank) {
                tocID.pop();
                toc = toc.parent().parent();
                thisRank++;
            }
            tocID.push(tocID.pop() + 1);
            let headingContent = this.innerHTML;
            if ($(this).find(".mw-headline").length > 0) {
                headingContent = $(this).find(".mw-headline").html();
            }
            headingContent = headingContent.replace(/<a [^<>]+>(.*?)<\/a>/g, "$1");
            toc.append($("<li/>").append($("<a/>").attr({
                href: "#" + this.id
            }).html(headingContent)));
            lastRank = +this.tagName[1];
            $("<span/>").addClass("xz-fake-bookmark").attr({
                "id": this.id
            }).appendTo($(this));
            this.id = "fake-" + this.id;
        });
        while (toc.parent()[0]) {
            toc = toc.parent();
        }
        while (toc.children().length == 1 && (!(toc.children()[0].tagName.toLowerCase() == "li") || toc.children()[0].classList.contains("no-list-style"))) {
            toc = toc.children();
        }
        toc.find(".no-list-style").each(function () {
            $(this).parent().replaceWith($(this).children());
        });
        toc.children().prependTo($(".xz-sidenav-list").empty());
        $("body").scrollspy("refresh");
    });
    $("body").scrollspy({
        "target": ".xz-sidenav"
    });
    window.tocRender();

    /* 代码高亮 */
    $(".xz-content pre code").each(function() {
        $(this).html("<ul><li>" + $(this).html().replace(/^\s+/, "").replace(/\s+$/, "").replace(/\n/g, "</li><li>") + "</li></ul>");
        $(this).find("li:last-child").each(function () {
            if (!this.innerHTML) {
                $(this).remove();
            }
        });
    });

    /* 表格 */
    $(".xz-content-main article > table:not(.no-table)").each(function () {
        $(this).addClass("table");
        if (!$(this).parentsUntil(".xz-content-main article").find("div.table-responsive").length) {
            $(this).wrap($("<div/>").addClass("table-responsive"));
        }
    });

    /* 图片 */
    var imageDisplay = ["auto", "none", "block", "left", "right", "center"],
        imageSize = 360,
        imageSizeUnit = /(pt|px|em|rem|cm|mm|%)$/;
    $(".xz-content img").each(function() {
        if (this.classList.length || this.srcset) {
            return;
        }

        let data = this.dataset,
            disp = data.disp,
            size = (data.size || imageSize),
            alt = (this.alt || data.alt || "").split("|"),
            title = alt[0];
        while (!$(this).siblings().length && ($(this).parent()[0].tagName.toLowerCase() == "p")) {
            $(this).unwrap();
        }
        for (var i = 0; i < alt.length; i++) {
            if (!alt[i]) {
                continue;
            }
            if (imageDisplay.indexOf(alt[i]) > -1) {
                disp = alt[i];
            } else if (!isNaN(alt[i])) {
                size = imageSize * (+alt[i]);
            } else if (alt[i].match(imageSizeUnit)) {
                size = alt[i];
            } else {
                title = alt[i];
            }
        }
            switch (disp) {
            case "auto":
            case "none":
                return;
            case "block":
                $(this).css({
                    "display": "block"
                });
                break;
            default:
                if ($(this).parents("figure").length == 0) {
                    $(this).wrap($("<figure/>").addClass(disp == "left" ? "figure-left" : disp == "right" ? "figure-right" : ""));
                    title && $("<figcaption/>").addClass("caption-figure").attr({
                        "id": "figure-" + this.src.split("/").slice(-1)[0]
                    }).html(title).appendTo($(this).parent());
                }
                $(this).addClass("figure-image").wrap($("<a/>").addClass("figure-link").attr({
                    "href": this.src,
                    "target": "_blank"
                }));
        }
        this.alt = title;
        if (size[0] == "x") {
            $(this).css({
                "height": size.slice(1)
            });
        } else {
            $(this).css({
                "width": size
            });
        }
    });

    /* 表注 */
    (function() {
        let tables = $("table"),
            i;
        for (i = 0; i < tables.length; i++) {
            let table = tables[i],
                caption = table.dataset["caption"],
                id = table.dataset["id"];
            if (caption) {
                $("<caption/>").addClass("caption-table").html(caption).attr("id", id).prependTo(table);
            }
        }
    })();

    /* 图注、表注显示 */
    (function() {
        let figureCaptionId = {};
        $(".caption-figure").each(function (n) {
            if (this.id) {
                figureCaptionId[this.id] = n + 1;
            }
        });
        $("a.xref-figure").each(function() {
            let hash = this.href.split("#").slice(-1)[0];
            if (figureCaptionId[hash]) {
                $(this).text("图 " + figureCaptionId[hash]);
            }
        });
        let tableCaptionId = {};
        $(".caption-table").each(function (n) {
            if (this.id) {
                tableCaptionId[this.id] = n + 1;
            }
        });
        $("a.xref-table").each(function() {
            let hash = this.href.split("#").slice(-1)[0];
            if (tableCaptionId[hash]) {
                $(this).text("表 " + tableCaptionId[hash]);
            }
        });
    })();

    /* 参考文献显示 */
    (function() {
        let endnoteId = {};
        $(".list-endnote li").each(function (n) {
            if (this.id) {
                endnoteId[this.id] = n + 1;
            }
        });
        $("sup.ref-endnote > a").each(function() {
            let hash = this.href.split("#").slice(-1)[0];
            if (endnoteId[hash]) {
                $(this).text(endnoteId[hash]);
            }
        });
    })();

    /* 注释 */
    $("span.footnote").each(function(count) {
        $(this).addClass("visible-print-inline").after($("<a/>").addClass("footnote-icon").text(count + 1).attr({
            "href": ""
        }).bind("click", function (e) {
            e.preventDefault();
        }).popover({
            "content": this.innerHTML,
            "html": true,
            "placement": "bottom",
            "toggle": "popover",
            "trigger": "focus"
        }));
    });

    /* 二维码 */
    let selfLink = window.pageInfo.wechat_link || location.origin + location.pathname;
    $(".xz-qrcode").empty().attr({
        "href": selfLink
    }).qrcode({
        "text": selfLink,
        "width": 360,
        "height": 360,
        "background": "transparent",
        "foreground": $(".jumbotron h1, .jumbotron .h1").css("color")
    }).click(e => e.preventDefault());

    /* 返回页面顶端 */
    $(".xz-navtop").click(function(e) {
        e.preventDefault();
        $("html").animate({
            scrollTop: 0
        }, 500);
    });

    /* 信息框 */
    if (Cookies.get("noPrintInfo")) {
        $(".xz-info-print").remove();
        Cookies.set("noPrintInfo", "false", {
            "expires": 7
        });
    } else {
        $(".xz-info-print").addClass("fade in").removeClass("hidden");
    }
    $(".xz-info-print").on("closed.bs.alert", function () {
        Cookies.set("noPrintInfo", "false", {
            "expires": 7
        });
    });

    /* PDF */
    if (window.pageInfo["tags"] && window.pageInfo["tags"].indexOf("学习资料") > -1) {
        let hasedFileList = JSON.parse(localStorage.getItem("xz-pdf-list"));
        let renderAlert = function (pdfList) {
            let fileName = location.pathname.split("/").reverse()[0].replace(".html", ".pdf");
            if (pdfList.indexOf(fileName) > -1) {
                let div = $("<div/>").addClass(["xz-info-pdf alert alert-success"]).append([
                    $("<p/>").html(`本页面存在一个 <a href="https://cdn.jsdelivr.net/gh/Xzonn/xz-pdf/${fileName}" class="alert-link">已渲染的PDF版本</a>。`)
                ]).appendTo($(".xz-infobox-top"));
                Han(div[0]).render();
            }
        }
        if (!hasedFileList || (new Date() - hasedFileList["update"]) > (30 * 60 * 1000)) {
            $.get({
                "url": "https://api.github.com/repos/Xzonn/xz-pdf/contents",
                "timeout": 5000
            }).done(function (data) {
                if (data instanceof Array) {
                    let pdfList = data.map(x => x["path"]);
                    localStorage.setItem("xz-pdf-list", JSON.stringify({
                        "update": +new Date(),
                        "list": pdfList
                    }));
                    renderAlert(pdfList);
                }
            }).fail(function () {
                let div = $("<div/>").addClass(["alert alert-danger"]).append([
                    $("<p/>").html(`无法链接至<strong><a href="https://api.github.com/">https://api.github.com/</a></strong>，请检查网络设置。`)
                ]).appendTo($(".xz-infobox-top")),
                    closeButton = $(`<button type="button" class="close" data-dismiss="alert">&times;</button>`).appendTo($(".xz-infobox-top"));
                Han(div[0]).render();
                setTimeout(x => closeButton.click(), 5000);
                renderAlert((hasedFileList || {})["list"] || []);
            })
        } else {
            renderAlert(hasedFileList["list"]);
        }
    }

    /* Resize */
    window.windowResize = function () {
        let qrh, heh, temp = 10;
        while ((temp--) && ((qrh = $(".xz-qrcode").height()) != (heh = $(".xz-heading-text").height()))) {
            if (qrh < heh) {
                $(".xz-qrcode").css({
                    "width": heh,
                    "height": heh
                });
            } else {
                $(".xz-qrcode").css({
                    "width": 0,
                    "height": 0
                });
            }
        }
        $(".xz-footer").css("position", "initial");
        if ($("body").height() + 50 == $(window).height()) {
            $(".xz-footer").css("position", "absolute");
        }
        $(".xz-sidenav-list").affix({
            "offset": {
                "top": $(".xz-content-main").offset().top - 50,
                "bottom": $(".xz-footer").outerHeight()
            }
        });
    };
    windowResize();
    $(window).bind("resize", windowResize);

    /* Han.js */
    if (!window.MathJax) {
        Han(document.body).render();
        window.mathjaxRendered = true;
    }

    if (!window.Chartist) {
        window.chartRendered = true;
    }
});