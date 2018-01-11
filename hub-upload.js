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
        var message = document.getElementById("message");
        message.innerHTML = "";
        message.classList.remove("alert-success");
        message.classList.remove("alert-danger");

        fileDataURL = e.target.result;
        fileBase64 = fileDataURL.split(",")[1];
        fileType = e.target.result.match(/data:(.*);base64/)[1];
        contents = atob(e.target.result.split(",")[1]);
        output = '<div>File name: ' + file.name +
            '<br>File type: ' + fileType +
            '<br>Last modified: ' + file.lastModifiedDate +
            '</div>';
        document.getElementById('uploaded').innerHTML = output;
        uploadToHub(contents, fileType);
    };
    reader.readAsDataURL(file);
}

function updateProgress(event) {
    if(event.lengthComputable) {
        var percentComplete = event.loaded / event.total;
        var progressBar = document.getElementById("progress-bar");
        progressBar.style.width = percentComplete + "%";
    } else {
    }
}

function uploadToHub(contents, fileType) {
    var xhr = new XMLHttpRequest();
    var url = document.getElementById("hub_url").value;
    var channelName = document.getElementById("channel_name").value;
    var fullUrl = url + "channel/" + channelName;
    xhr.addEventListener("progress", updateProgress);
    xhr.open("POST", fullUrl, true);
    xhr.setRequestHeader("Content-Type", fileType);
    xhr.onreadystatechange = function() {
        var message = document.getElementById("message");
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 300) ) {
            var json = JSON.parse(xhr.response);
            var uploadedItemUrl = json._links.self.href;
            message.innerHTML = "Successfully uploaded file to <a href=\"" + uploadedItemUrl + "\"> " + uploadedItemUrl + "</a>";
            message.classList.remove("alert-danger");
            message.classList.add("alert-success");

        } else {
            message.innerHTML = "Failed to upload file to " + channelName + " channel";
            message.classList.add("alert-danger");
        }
    };
    xhr.send(JSON.stringify(contents));
}

// Setup the event listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileDrop, false);
document.getElementById('file').addEventListener('change', handleFileSelect, false);
