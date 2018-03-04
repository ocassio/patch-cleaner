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
        var result = deduplicate(event.target.result)
        var fileName = addPostfix(file.name, '_clean')
        download(fileName, result)
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

/**
 * Triggers file download
 * @param {String} filename File name 
 * @param {String} text File content
 */
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

/**
 * Adds postfix to the original file name
 * @param {String} originalName Original file name
 * @param {String} postfix Postfix to add
 * @returns {String} Name with postfix
 */
function addPostfix(originalName, postfix) {
    var dividerPosition = originalName.lastIndexOf('.')
    var name = originalName.substring(0, dividerPosition)
    var extension = originalName.substring(dividerPosition)

    return name + postfix + extension
}