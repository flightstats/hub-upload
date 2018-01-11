function cache(element, key) {
    localStorage.setItem(key, element.value);
}

function loadFromCache() {
    document.getElementById("hub_url").value = localStorage.getItem('url');
    document.getElementById("channel_name").value = localStorage.getItem('channel');
}

function handleFileSelect(evt) {
    var file = evt.target.files[0];
    displayUploadedFile(file);
}

function handleFileDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.dataTransfer.files[0];
    displayUploadedFile(file);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

function displayUploadedFile(file) {
    var reader = new FileReader();
    var output = "";
    var fileBase64 = "";
    var fileDataURL = "";

    reader.onload = function(e) {
        fileDataURL = e.target.result;
        fileBase64 = fileDataURL.split(",")[1];
        fileType = e.target.result.match(/data:(.*);base64/)[1];
        output = '<div>fileType: ' + fileType + '</div>';
        document.getElementById('uploaded').innerHTML = output;
        uploadToHub(fileBase64);
    };
    reader.readAsDataURL(file);
}

function uploadToHub(base64) {
    var request = {
        "requests" : [{
            "image": { "content": base64 },
            "features" : [{
                "type": "TEXT_DETECTION",
                "maxResults": "10"
            }]
        }]
    };

    var xhr = new XMLHttpRequest();
    var url = document.getElementById("hub_url").value;
    var channelName = document.getElementById("channel_name").value;
    var fullUrl = url + "channel/" + channelName;
    xhr.open("POST", fullUrl, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var json = JSON.parse(xhr.responseText);
            if(json.responses.length > 0) {
                var body = json.responses[0].textAnnotations[0].description;
                document.getElementById("result").innerText = body;
            } else {
                document.getElementById("result").innerText = json;
            }
        }
    };
    xhr.send(JSON.stringify(request));
}

// Setup the event listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileDrop, false);
document.getElementById('file').addEventListener('change', handleFileSelect, false);
