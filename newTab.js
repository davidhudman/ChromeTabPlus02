// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var displayLabels = true;
var countStartValue = 1;
var count = countStartValue;
var numImages = 32; // 29;
var googlePhotosReel = ["https://lh3.googleusercontent.com/okjyywJfSGdcnq-rTpq3dJ1Rq9_QwMY-xqNrG5T-srenDNd5pKpyhik-1qulFSgOHnJASLgcJ3RYfbsXfzmIGwkwh1XEtGtR2OXW0ZveAduEBvuoVO4_2WXu6Xci5BrknB4381kxvCBgJiSdHOenRTct02BqNaAXgSL8-4RlRuYkCLlmEJUdwmiyyTJMUtsQNlDC82Q60wlwxiYvHuS-Dv3Xj5KKhdy5AXoTBz7w9c8s_-1BgYLbfc6NUqh65eeDF-PPtecWy_1B5xK1QdMG6hlT6QSUYLi-0jrk6pfTpxk5HYlXAdGwMt4g-46E1p1_oljMt4Mp5qvVNRcPDXWYQFHnqUjGzFHGeYmwvzmQy7T2jTmmnGRHAg16vbrLOhK9Zb_htEMfa11yE8IXwv08sdsZogzHqxWqGbcZdUhetOprUc79FhIw1f_tOJEI5HGUvz2hZ19UYaK11llyOtS1-oH7APGEDRIWzDZ_6Ze2Gr8sFw9FFK1HxbzEGxlOjK5a__13jGxAPPVQJu-04aigFoRYJrUJjgCEeGhaEkUiyeB_Q_2LhsxFq4qezKYNEk0G3MtPez5VGaxEFz4HA6xknGzqKwBEwvfWGbzE5WbOCLY=w1266-h949-no",
	"https://lh3.googleusercontent.com/4tD_TkWBWp09qROMJatAbqPZLlt7X-qDY3jvM1MWKg-7iJSxYHsoEQRE2hQKAsud8FzXfirXWuMO2k6wQyglN2xYdWYaXpIt9MeJpVQgI8AJUpkOSMfY1FdihbquhAjjOGs13cioHKe3ibKXxa1P-FBfbf1gKuCGixVIx9lg34BYDy9ly4uTQ_UQMGzplL5i8OKNrVmA08bejlgTRHi33b76duzQD0hlm0KU8a3YXCxKClvABD-B6xXBeD-8zlinSsxatlvpSvjpmd24XP2k6XrD-LcLexlcsISTdGRFVxiGDvmM9f2mI2aOLTj_ydtxlu3_7apfXic2Po95Ty9OGO2BfpUokyI8RS4yyWIuI-6AgMgEPciN6_0A8iwLSvf4F2p55OWUZKG8czHKMp5NCMgBCE583nXlQAbck-9SVaTAyOwaDOn0dSA8M3mFXe1avM4tDBsGtbAIPwthSwrV80SBN-B4SMk9eV5zMQCfzN6JhJJiNk7xFMM33NUmrRM0JI_-ufKqNQwfDoXA-64lkMFvGWoUZMJsFa5MnPO5UB8twwB-4m4rF44xOmFD1dGuFVFP7FYcRzbyrPvYX-uKkV2CCiI827JbmLCjqWlyIFk=w1266-h949-no"
];

$(document).ready(function () {
    $("#helloText").click(function () {
        nextImageInChromeStoragePhotoArray();
    });

    $("#time").click(function () {
        previousImageInChromeStoragePhotoArray();
    });
});

function doesFileExist() {
    try {
        var file = window.open("/wallpaper/25.jpg");
        // alert("found the file");
        setTimeout('file.close()', 100);
        setTimeout("alert('Audio file found. Have a nice day!');", 101);
    } catch (err) {
        alert("Warning:\n Unable to locate file\n " + err.message);
    }
}

function displayTime() {
    var current_date = new Date();
    var timeString;

    if (current_date.getHours() <= 12)
        timeString = current_date.getHours() + ":" + ('0' + current_date.getMinutes()).slice(-2);				// AM
    else
        timeString = current_date.getHours() % 12 + ":" + ('0' + current_date.getMinutes()).slice(-2);		// PM

    document.getElementById("time").innerHTML = timeString;
}

function nextImage() {
    directoryPhotosIterate();
}

function directoryPhotosIterate() {
    var success = false;

    while (!success) {
        count = count + 1;
        if (count > numImages) {
            count = countStartValue;
        }

        chrome.storage.sync.set({
            cnt: count

        }, function () {
            //
        });

        $("#bodyid").attr("background", "/wallpaper/" + count + ".jpg");
        // $("#bodyid").attr("background","https://lh3.googleusercontent.com/okjyywJfSGdcnq-rTpq3dJ1Rq9_QwMY-xqNrG5T-srenDNd5pKpyhik-1qulFSgOHnJASLgcJ3RYfbsXfzmIGwkwh1XEtGtR2OXW0ZveAduEBvuoVO4_2WXu6Xci5BrknB4381kxvCBgJiSdHOenRTct02BqNaAXgSL8-4RlRuYkCLlmEJUdwmiyyTJMUtsQNlDC82Q60wlwxiYvHuS-Dv3Xj5KKhdy5AXoTBz7w9c8s_-1BgYLbfc6NUqh65eeDF-PPtecWy_1B5xK1QdMG6hlT6QSUYLi-0jrk6pfTpxk5HYlXAdGwMt4g-46E1p1_oljMt4Mp5qvVNRcPDXWYQFHnqUjGzFHGeYmwvzmQy7T2jTmmnGRHAg16vbrLOhK9Zb_htEMfa11yE8IXwv08sdsZogzHqxWqGbcZdUhetOprUc79FhIw1f_tOJEI5HGUvz2hZ19UYaK11llyOtS1-oH7APGEDRIWzDZ_6Ze2Gr8sFw9FFK1HxbzEGxlOjK5a__13jGxAPPVQJu-04aigFoRYJrUJjgCEeGhaEkUiyeB_Q_2LhsxFq4qezKYNEk0G3MtPez5VGaxEFz4HA6xknGzqKwBEwvfWGbzE5WbOCLY=w1266-h949-no");

        success = true;
    }
    // https://source.unsplash.com/random/2000x1000
}

function googlePhotosIterate() {

}

function prevImage() {
    var success = false;

    while (!success) {
        count = count - 1;
        if (count < 0) {
            count = numImages;
        }

        chrome.storage.sync.set({
            cnt: count

        }, function () {
            //
        });

        // $("#bodyid").attr("background","/wallpaper/" + count + ".jpg");
        $("#bodyid").attr("background", "file:///C:/Users/dhudman/Pictures/Personal/Friends/IMG_1869.JPG");
        success = true;

        chrome.storage.sync.get({
            photoPath: "file:///C:/Users/dhudman/Pictures/Personal/Friends/IMG_1869.JPG"
        }, function (items) {
            $("#bodyid").attr("background", items.photoPath);		// restore the image that was on last
        });
    }
    // https://source.unsplash.com/random/2000x1000
}

function nextImageInChromeStoragePhotoArray() {
    nextOrPreviousImageInChromeStorageArray(1);
}

function previousImageInChromeStoragePhotoArray() {
    nextOrPreviousImageInChromeStorageArray(-1);
}

function nextOrPreviousImageInChromeStorageArray(incrementor) {
    chrome.storage.sync.get({
        photoPath: 'file:///C:/Users/dhudman/Pictures/Personal/Friends',
        photoArrayCountTotal: 0,
        photoArrayCountCurrent: 0,
        photoArray: 'IMG_1869.JPG'

    }, function (items) {
        var tempPhotoArrayCountCurrent = items.photoArrayCountCurrent;
        var tempPhotoArrayCountTotal = items.photoArrayCountTotal;
        if ((items.photoArrayCountCurrent < items.photoArrayCountTotal && incrementor == 1) || (incrementor == -1 && items.photoArrayCountCurrent > 0)) {
            tempPhotoArrayCountCurrent += incrementor;
            chrome.storage.sync.set({
                photoArrayCountCurrent: tempPhotoArrayCountCurrent

            }, function () {
                //
            });

        }
        else {
            if (incrementor == 1)
                tempPhotoArrayCountCurrent = 0;
            else
                tempPhotoArrayCountCurrent = tempPhotoArrayCountTotal;

            chrome.storage.sync.set({
                photoArrayCountCurrent: tempPhotoArrayCountCurrent

            }, function () {
                //
            });
        }

        var tempPhotoArray = items.photoArray;

        $("#bodyid").attr("background", items.photoPath + "\\" + tempPhotoArray[tempPhotoArrayCountCurrent]);		// go to the next image or the 0 index image
    });
}

function getStoredData() {
    chrome.storage.sync.get({
        photoPath: 'file:///C:/Users/dhudman/Pictures/Personal/Friends',
        photoArrayCountTotal: 0,
        photoArrayCountCurrent: 0,
        photoArray: 'IMG_1869.JPG'
    }, function (items) {
        $("#bodyid").attr("background", items.photoPath + "\\" + items.photoArray[items.photoArrayCountCurrent]);		// restore the image that was on last
    });
}

function countImagesInFolder() {
    $.ajax({
        url: "C:\Users\dhudman\Documents\Personal\Projects\Weather chrome extension with crypto 2017 09 08a\Weather\wallpaper",
        success: function (data) {
            numImages = 0;
            $(data).find("a:contains(.jpg)").each(function () {
                numImages++;
            });
            alert("numImages: " + numImages);
        }
    });
}

function getFileSystemAccess() {
    chrome.extension.isAllowedFileSchemeAccess(function (isAllowedAccess) {
        if (isAllowedAccess) {
            return; // Great, we've got access
        }
        // alert for a quick demonstration, please create your own user-friendly UI
        alert('Please check the box "Allow access to file URLs" for our extension on the following screen.');

        chrome.tabs.create({
            url: 'chrome://extensions/?id=' + chrome.runtime.id
        });
    });
}

// When the document loads, ask for the data
document.addEventListener('DOMContentLoaded', function () {
    getFileSystemAccess()
    // countImagesInFolder();
    displayTime();
    getStoredData();
    var myVar = setInterval(displayTime, 1000);
    // nextImage();
});