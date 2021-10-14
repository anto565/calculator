// amariCalc.js
var str = "";
var state = 0;
var saki = 0;
var ato = 0;
var keisan = 0;

$(function() {
    var touchEnable = false; // touch event が来る機種はそれでclickとみなす
    $("#mainDisplay").val(location.hash);
    initKeyDown(location.hash);
    ////////
    $("#run").click(function() {
        if ($("#_wari").val() && $("#_moto").val()) {
            var syou = Math.floor($("#_moto").val() / $("#_wari").val());
            var amari = $("#_moto").val() % $("#_wari").val();
            $("#_syou").val(syou);
            $("#_amari").val(amari);
            str = "";
            hissan($("#_moto").val(), $("#_wari").val());
        }
    });
    $(".key, .keyf, .keylong").bind("touchend", touchHandler);

    function touchHandler(event) {
        touchEnable = true; // touch event が来たのでこれ以降clickで処理しない
        keyDown(this.value);
        $(this).addClass("down");
    }

    $(".key, .keyf, .keylong").click(function() {
        if (!touchEnable) { // touch event が来る機種はclickは処理しない
            keyDown(this.value);
            $(this).addClass("down");
        }
    });

    $('html').keyup(function(e) {
        // 数字キー
        var keyUpCode = e.which;
        if (keyUpCode >= 48 && keyUpCode <= 57) {
            keyDown(keyUpCode - 48);
        }
        // テンキー
        if (keyUpCode >= 96 && keyUpCode <= 105) {
            keyDown(keyUpCode - 96);
        }
        switch (keyUpCode) {
            case 67: // c
            case 27: // ESC
                keyDown("Ｃ");
                break;
            case 191: // "/?"
            case 111: // テンキー"/"
                keyDown("÷");
                break;
            case 186: // ":"
            case 222: // "*"
            case 106: // テンキー"*"
                keyDown("×");
                break;
            case 189: // "-"
            case 187: // "="
            case 13: // return
                keyDown("=");
                break;
        }
    });
});


function initKeyDown(str) {
    state = 0;
    var c;
    for (var i = 0; i < str.length; i++) {
        c = str.charCodeAt(i);
        if (c >= 48 && c <= 57) {
            c -= 48;
            keyDown(c);
        }
        if (c >= 65296 && c <= 65296 + 9) {
            c -= 65296;
            keyDown(c);
        }
        if (c == 47 || c == 247) {
            keyDown("÷");
        }
        if (c == 42 || c == 215) {
            keyDown("×");
        }
        if (c == 61 || c == 65309) {
            keyDown("＝");
        }
    }
    if (1 == state) {
        // 最後の「＝」だけ足りない場合は補完
        keyDown("＝");
    }
}

function keyDown(val) {
    $(".key").removeClass("down");
    $(".keyf").removeClass("down");
    $(".keylong").removeClass("down");
    //実ボタン処理
    if (val >= 0 && val <= 9) {
        if (2 == state) {
            ato = 0;
            saki = 0;
            state = 0;
        }
        if (0 == state || 1 == state) {
            ato *= 10;
            ato += parseFloat(val);
            dispCalc(ato);
        }

    }
    if (val == "→") {
        if (0 == state || 1 == state) {
            ato = Math.floor(ato / 10);
            dispCalc(ato);
        }
    }
    if (val == 'C' || val == 'Ｃ') {
        state = 0;
        ato = 0;
        saki = 0;
        dispCalc(0);
        hissanClr();
    }
    if (val == '/' || val == "÷") {
        if (0 != state) return;
        saki = ato;
        $("#_moto").val(saki);
        ato = 0;
        state = 1;
        keisan = 0;
        dispCalc(val);
    }
    if (val == '*' || val == "×") {
        if (0 != state) return;
        saki = ato;
        $("#_moto").val(saki);
        ato = 0;
        state = 1;
        keisan = 1;
        dispCalc(val);
    }
    if (val == '=' || val == "=" || val == "＝") {
        if (1 != state) return;
        if (1 == keisan) {
            seki = saki * ato;
            dispCalc(saki + "×" + ato + "= " + seki);
            kakeHissan(saki, ato);
        } else {
            if (0 == ato) ato = 1; //0割避け
            state = 2;
            $("#_wari").val(ato);
            var syou = Math.floor(saki / ato);
            var amari = saki % ato;
            $("#_syou").val(syou);
            $("#_amari").val(amari);
            dispCalc(saki + "÷" + ato + "=" + syou + "←答え　あまり→" + amari);
            hissan(saki, ato);
        }
        state = 0;
        ato = 0;
        saki = 0;
    }
}

function dispCalc(a) {
    $(".display").val(a);
}

function hissanClr() {
    str = "";
    dispStr();
}

function kakeHissan(moto, kake) {
    str = "";
    var seki = moto * kake;
    var allKeta = getKeta(seki);
    indent(allKeta - getKeta(moto) + 2);
    disp(moto);
    indent(allKeta - getKeta(kake));
    disp("* " + kake);

    var kakeKeta = getKeta(kake);
    if (kakeKeta != 1) {
        indent(allKeta - 5 + 2);
        disp("-----");
        var k = new Array();
        k[0] = 0;
        var i = 0;
        for (;;) {
            if (kake == 0) break;
            k[i] = kake % 10;
            kake = Math.floor(kake / 10);
            i++;
        }
        var j = 0;
        for (j = 0; j < kakeKeta; j++) {
            var tmp = parseInt(k[j]) * moto;
            if (0 != tmp) {
                indent(allKeta - getKeta(tmp) + 2 - j);
                disp(tmp);
            }
        }
    }

    indent(allKeta - 5 + 2);
    disp("-----");
    indent(2);
    disp(seki);
    dispStr();
}

function hissan(moto, wari) {
    str = "";
    var amari = moto % wari;
    var syou = Math.floor(moto / wari);
    var i = 0;
    var mo = moto;
    var firstLine = true;

    var m = new Array();
    m[0] = 0;
    for (;;) {
        if (mo == 0) break;
        m[i] = mo % 10;
        mo = Math.floor(mo / 10);
        i++;
    }
    motoKeta = getKeta(moto);

    var sy = syou;
    var s = new Array();
    s[0] = 0;
    i = 0;
    for (;;) {
        if (sy == 0) break;
        s[i] = sy % 10;
        sy = Math.floor(sy / 10);
        i++;
    }
    syouKeta = getKeta(syou);

    allKeta = getKeta(wari) + 3 + motoKeta;
    indent(allKeta - getKeta(syou));
    disp(syou);
    indent(getKeta(wari) + 2);
    disp("-----");
    disp(wari + " / " + moto);

    var tmp = 0;
    for (i = motoKeta; i >= 0; i--) {
        if (tmp >= wari) {
            indent(allKeta - getKeta(s[i] * wari) - i);
            disp(s[i] * wari);
            indent(allKeta - getKeta(s[i] * wari) - i);
            disp("----");
            tmp -= s[i] * wari;
            if (i == 0) {
                break;
            }
            tmp *= 10;
            tmp += m[i - 1];
            if (tmp >= wari) {
                indent(allKeta - getKeta(tmp) - i + 1);
                disp(tmp);
            }
        } else {
            if (i == 0) {
                break;
            }
            tmp *= 10;
            tmp += m[i - 1];
            if (tmp >= wari && !firstLine) {
                indent(allKeta - getKeta(tmp) - i + 1);
                disp(tmp);
                firstLine = false;
            }
        }
    }
    // あまりのはず
    indent(allKeta - getKeta(tmp));
    disp(tmp);
    if (tmp != amari) {
        alert(" amari error !! " + amari);
    }
    dispStr();
    /*
     */
}

function getKeta(a) {
    var i = 0;
    if (0 == a) return 1;
    for (;;) {
        if (a == 0) break;
        a = Math.floor(a / 10);
        i++;
        //	alert( "a="+ a	);
    }
    return i;
}

function indent(a) {
    for (i = 0; i < a; i++) {
        str += " ";
    }

}

function disp(a) {
    //	alert( a+"\n"  );
    str += a + "\n";
}

function dispStr() {
    $(".log").text(str);
}