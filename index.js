var fileSelector = document.querySelector('#file-selector')
var dropZone = document.querySelector('#drop-zone')

dropZone.ondragover = function (event) {
    event.stopPropagation()
    event.preventDefault()
    event.dataTransfer.event = 'copy'
}

dropZone.ondrop = function (event) {
    event.stopPropagation()
    event.preventDefault()

    var files = event.dataTransfer.files
    for (var i = 0; i < files.length; i++) {
        handleFile(files[i])
    }
}

dropZone.onclick = function () {
    fileSelector.click()
}

fileSelector.onchange = function () {
    for (var i = 0; i < this.files.length; i++) {
        handleFile(this.files[i])
    }
}

function handleFile(file) {
    var reader = new FileReader()
    reader.onload = function (event) {
        var text = event.target.result
        var result = deduplicate(text)
        download('result.patch', result)
    }
    reader.readAsText(file)
}

/**
 * Remove file duplicates from the patch
 * @param {String} patch Patch content
 * @returns {String} Deduplicated file content
 */
function deduplicate(patch) {
    var result = ''

    var lines = patch.split('\n')
    var parsedFiles = []

    var copyProcessEnabled = false

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i]
        if (line && line.length >= 6 && line.startsWith('Index:')) {
            var fileName = line.substring(6)
            if (!parsedFiles.includes(fileName)) {
                var prevLine = line
                line = lines[++i]
                if (line && line.startsWith('======')) {
                    parsedFiles.push(fileName)
                    copyProcessEnabled = true
                    result += prevLine + '\n'
                }
            } else {
                copyProcessEnabled = false
            }
        }
        if (copyProcessEnabled) {
            result += line + '\n'
        }
    }

    return result
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}