// Saves options to chrome.storage
function save_options() {
    // var color = document.getElementById('color').value;
    // var likesColor = document.getElementById('like').checked;
    // var spreadsheetLink = document.getElementById('spreadsheetLink').value;
    // var spreadsheetKey = document.getElementById('spreadsheetKey').value;
    // var spreadsheetGid = document.getElementById('spreadsheetGid').value;
    // var importIoKey = document.getElementById('importIoKey').value;
    // var importIoLink = document.getElementById('importIoLink').value;
    var zipcode = document.getElementById('zipcode').value;
    var stocksUI = document.getElementById('stocks').value;
    var numberPhotos = document.getElementById('numberPhotos').value;
    // var badgeStockSymbol = document.getElementById('badgeStockSymbol').value;
    chrome.storage.sync.set({
        // favoriteColor: color,
        // likesColor: likesColor,
        // sheetLink: spreadsheetLink,
        // sheetKey: spreadsheetKey,
        // sheetGid: spreadsheetGid,
        // importKey: importIoKey,
        zip: zipcode,
        stocks: stocksUI,
        numberPhotos: numberPhotos
        // badgeStock: badgeStockSymbol
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        /* favoriteColor: 'red',
        sheetLink: "type your entire link",
        sheetKey: "type your key",
        sheetGid: 'type your gid',
        importKey: 'type your key',
        importLink: 'type your link',
        likesColor: true, */
        zip: 'type your zipcode',
        stocks: 'type your list of stocks separated by spaces',
        // badgeStock: 'AAPL',
        photoPath: 'Set your photo path',
        numberPhotos: 'Set your number of photos',
        photoArrayCountTotal: 0,
        photoArrayCountCurrent: 0,
        photoArray: 'IMG_1869.JPG'
    }, function (items) {
        /* document.getElementById('color').value = items.favoriteColor;
        document.getElementById('spreadsheetLink').value = items.sheetLink;
        document.getElementById('spreadsheetKey').value = items.sheetKey;
        document.getElementById('spreadsheetGid').value = items.sheetGid;
        document.getElementById('importIoKey').value = items.importKey;
        document.getElementById('importIoLink').value = items.importLink;
        document.getElementById('like').checked = items.likesColor; */
        // document.getElementById('fileInput1').value = items.photoArray;
        document.getElementById('photoPath1').value = items.photoPath.slice(8,items.photoPath.length);  // small change to remove the "file:///" bit from the user's site
        document.getElementById('zipcode').value = items.zip;
        document.getElementById('stocks').value = items.stocks;
        // document.getElementById('badgeStockSymbol').value = items.badgeStock;
        document.getElementById('numberPhotos').value = items.numberPhotos;
    });
}

function restore_defaults() {
    chrome.storage.sync.set({
        // favoriteColor: 'red',
        // sheetLink: "type your entire link",
        //sheetKey: "type your key",
        // sheetGid: 'type your gid',
        // importKey: 'type your key',
        // importLink: 'type your link',
        // likesColor: true,
        zip: 'type your zipcode',
        stocks: 'type your list of stocks separated by spaces',
        // badgeStock: 'type your stock to display in the badge',
        photoPath: 'file:///C:/Users/dhudman/Pictures/Personal/Friends/IMG_1869.JPG',
        numberPhotos: 'Put your number of photos'
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Defaults Restored.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
    restore_options();
}

function setPhotoDirectory() {
    alert("made it to method");
    /* chrome.mediaGalleries.addUserSelectedFolder(
		function(mediaFileSystems, selectedFileSystemName) {
			alert("let user select folder");
	}); */
    var form = document.createElement('form');
    form.appendChild(fileChooser);
    var fileChooser = document.createElement('input');
    fileChooser.type = 'file';
	
    var file = fileChooser.files[0];
    var formData = new FormData();
    formData.append(file.name, file);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl, true);
    xhr.addEventListener('readystatechange', function (evt) {
        console.log('ReadyState: ' + xhr.readyState,
                    'Status: ' + xhr.status);
    });

    xhr.send(formData);
    form.reset();   // <-- Resets the input so we do get a `change` event,
    //     even if the user chooses the same file
	
}

    function fileInput1Changed() {
        var filesSelected, tempFileName, tempPhotoPath;
        try {
            filesSelected = document.getElementById("fileInput1");
            tempFileName = filesSelected.files;
            tempPhotoPath = document.getElementById("photoPath1").value;
        }
        catch(e) {
            var status = document.getElementById('status');
            status.textContent = 'You must select a file and paste its file path in the text box.';
            setTimeout(function () {
                status.textContent = '';
            }, 750);
        }
	
        try {
            if (filesSelected == null || tempPhotoPath == null || tempPhotoPath == "") {
                var status = document.getElementById('status');
                status.textContent = 'You must set a valid file name and file path.';
                setTimeout(function () {
                    status.textContent = '';
                }, 2000);
            }
            else {
                var tempPhotoArray = [];
                var tempPhotoArrayCount;
                for (var i = 0; i < tempFileName.length; i++) {
                    tempPhotoArray[i] = tempFileName[i].name;
                    tempPhotoArrayCount = i;
                }
                // alert(tempFileName[i].name);
                chrome.storage.sync.set({
                    photoPath: 'file:///' + tempPhotoPath, // + '\\' + tempFileName[0].name, // 'file:///C:/Users/dhudman/Pictures/Personal/Friends/IMG_1869.JPG'
                    photoArrayCountTotal: tempPhotoArrayCount,
                    photoArrayCountCurrent: 0,
                    photoArray: tempPhotoArray
				
                }, function () {
                    // Update status to let user know options were saved.
                    var status = document.getElementById('status');
                    status.textContent = 'Photo name and path saved.';
                    setTimeout(function () {
                        status.textContent = '';
                    }, 750);
                });
		
			
            }
        }
        catch(e) {
            var status = document.getElementById('status');
            status.textContent = 'There was a problem setting your file path';
            setTimeout(function () {
                status.textContent = '';
            }, 750);
        }
    }

    function toggleImageSetup() {
        $('#imageSetup').toggle();
    }

    function handle_files(files) {
        for (i = 0; i < files.length; i++) {
            file = files[i];
            console.log(file);
            var reader = new FileReader()
            ret = []
            reader.onload = function(e) {
                console.log(e.target.result);
            }
            reader.onerror = function(stuff) {
                console.log("error", stuff)
                console.log (stuff.getMessage())
            }
            reader.readAsText(file) //readAsdataURL
        }
        chrome.storage.sync.set({
            photoPath: 'file:///C:/Users/dhudman/Pictures/Personal/Friends/IMG_1869.JPG'
        }, function () {
            // Update status to let user know options were saved.
            var status = document.getElementById('status');
            status.textContent = 'Defaults Restored.';
            setTimeout(function () {
                status.textContent = '';
            }, 750);
        });

    }

    document.addEventListener('DOMContentLoaded', restore_options);
    document.getElementById('save').addEventListener('click', save_options);
    document.getElementById('saveFileNameAndPathButton').addEventListener('click', fileInput1Changed);
    // document.getElementById('fileInput1').addEventListener('change', fileInput1Changed);
    document.getElementById('default').addEventListener('click', restore_defaults);
    document.getElementById('showImageSetup').addEventListener('click', toggleImageSetup);