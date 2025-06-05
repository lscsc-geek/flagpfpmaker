//document.onload = function() {

console.log('loading the app babe');

// --- get all elements
const mainCanvas = document.getElementById('mainCanvas');
const mainCtx = mainCanvas.getContext('2d');

const uploadDiv = document.getElementById('uploadDiv');
    const uploadButton = document.getElementById('uploadButton');

const exportDiv = document.getElementById('exportDiv');
    const continueEditing = document.getElementById('continueEditing');
    const exportEl = document.getElementById('exportEl');

const editorDiv = document.getElementById('editorDiv');
    // Flag buttons
    const flagButtonDiv = document.getElementById('flagButtonDiv');
    const otherFlagInput = document.getElementById('otherFlagInput');

    // Setting buttons
    const imgScaleInput = document.getElementById('imgScaleInput');
    const ringScaleInput = document.getElementById('ringScaleInput');

    // Reset buttons
    const resetImageScaleButton = document.getElementById('resetImageScaleButton');
    const resetRingScaleButton = document.getElementById('resetRingScaleButton');
    const resetDragOffButton = document.getElementById('resetDragOffButton');

    // Flag mode objects
    const flagModeText = document.getElementById('flagModeText');
    const flagModeToggle = document.getElementById('flagModeToggle');
    const flagModeToggleHandle = document.getElementById('flagModeToggleHandle');
    const flagModePreview = document.getElementById('flagModePreview');

    // Export & choose new img buttons
    const chooseNewButton = document.getElementById('chooseNewButton');
    const exportButton = document.getElementById('exportButton');

var currentDiv = editorDiv;

// 确保上传div隐藏，编辑器div显示
uploadDiv.style.display = 'none';
editorDiv.style.display = 'block';

// --- helper functions
function selectDiv(div) {
    currentDiv.style.display = 'none';

    currentDiv = div;
    currentDiv.style.display = 'inherit';
}

function loadImgFromFile(file, callback) {
    const img = new Image();
    img.onload = () => callback(img);
    img.onerror = () => alert('bitch the fuck did u give me !');

    img.src = URL.createObjectURL(file); // set src to blob url
}

function getCanvasUrl(canvas) {
    // 使用原始画布尺寸的图片，不修改MIME类型
    return mainCanvas.toDataURL('image/png');
}

const canvasRefreshCooldown = 25;
var canvasRefreshing = false;
function requestRefresh() {
    if (canvasRefreshing)
        return;
    canvasRefreshing = true;

    setTimeout(() => {
        canvasRefreshing = false;
        editor.refreshCanvas();
    }, canvasRefreshCooldown);
}

// Create default transparent image
function createTransparentImage(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fill with transparent pixels
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, width, height);
    
    // Convert to image
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
}

// editor
var editor = null;
var editorloaded = false;
function resetEditor() {
    editorloaded = true;
    editor = new Editor(mainCanvas);
    editor.flagId = 0; // Rainbow flag
}

// --- editing
// generate flag buttons
for (var i = 0; i < presetFlags.length; i++) {
    // create elements
    const wrapper = document.createElement('div');
    const div = document.createElement('div');
    const span = document.createElement('span');

    // generate text
    const canv = document.createElement('canvas');
        canv.width = canv.height = 24;
        canv.style.border = '1px solid white';
        presetFlags[i].obj.DrawFlagOnCanvas(canv);

    const title = document.createElement('span');
        title.innerHTML = presetFlags[i].name + '<br>';

    span.appendChild(title);
    span.appendChild(canv);

    div.className = 'button flagButton';
    wrapper.className = 'flagButtonWrapper';

    // append all elements
    div.appendChild(span);
    wrapper.appendChild(div);
    flagButtonDiv.appendChild(wrapper);

    // button functionality
    (function(ii) {
        div.onclick = function() {
            editor.clearFlagImg();

            editor.flagId = ii;
            editor.refreshCanvas();
        };
    })(i);
}

// generate other flag upload button
otherFlagInput.onchange = function() {
    if (this.files && this.files[0]) {
        loadImgFromFile(this.files[0], img => {
            editor.loadFlagImg(img);
            editor.refreshCanvas();
        });
    }
};

(function() {
    // create elements
    const wrapper = document.createElement('div');
    const label = document.createElement('label');
    const div = document.createElement('div');

    label.htmlFor = 'otherFlagInput';

    div.className = 'button otherFlagButton';
    div.innerHTML = 'Custom<br>Image';
    wrapper.className = 'flagButtonWrapper';

    // append all elements
    label.appendChild(div);
    wrapper.appendChild(label);
    flagButtonDiv.appendChild(wrapper);
})();

// more settings
imgScaleInput.oninput = function() {
    editor.setPfpImageScale(this.value);
    requestRefresh();
};

ringScaleInput.oninput = function() {
    editor.pfpRingScale = 1 - this.value;
    requestRefresh();
};

// export buttons
chooseNewButton.onclick = function() {
    document.getElementById('uploadButton').click();
};

exportButton.onclick = function() {
    // download as file method - ehh
    // window.open(
    //     getCanvasUrl(mainCanvas),
    //     '_blank'
    // );

    // let user manually save - better for phones ig :,3
    exportEl.onload = function() {
        selectDiv(exportDiv);
    };

    exportEl.onerror = () => alert('there was an error exporting ! try again ? o_o;');

    exportEl.src = getCanvasUrl(mainCanvas);
    
};

// offset dragging
var dragX = 0;
var dragY = 0;
var dragPreX = 0;
var dragPreY = 0;
var dragging = false;
var movedBefore = false;

function setDragPos(x, y) {
    if (!dragging || canvasRefreshing)
        return;

    dragPreX = dragX;
    dragPreY = dragY;
    dragX = x;
    dragY = y;

    if (movedBefore) {
        editor.pfpImgOffX += dragX - dragPreX;
        editor.pfpImgOffY += dragY - dragPreY;

        requestRefresh();
    }
    else {
        movedBefore = true;

        dragPreX = dragX;
        dragPreY = dragY;
    }
}

mainCanvas.onmousedown =
mainCanvas.ontouchstart = e => {
    dragging = true; 
};
document.onmouseup =
mainCanvas.ontouchend = e => {
    dragging = false;
    movedBefore = false;
};

// Mouse dragging
document.onmousemove = e => {
    const rect = mainCanvas.getBoundingClientRect();
    const scale = mainCanvas.width / rect.width;

    setDragPos(
        scale * (e.x - rect.left),
        scale * (e.y - rect.top)
    );
};

// Finger dragging
mainCanvas.ontouchmove = e => {
    const rect = mainCanvas.getBoundingClientRect();
    const scale = mainCanvas.width / rect.width;

    setDragPos(
        scale * (e.touches[0].pageX - rect.left),
        scale * (e.touches[0].pageY - rect.top)
    );
};

// resetting settings
function resetDragOffset() {
    editor.pfpImgOffX = 0;
    editor.pfpImgOffY = 0;

    editor.refreshCanvas();
};

function resetRingScale() {
    editor.resetPfpRingScale();
    editor.refreshCanvas();
};

function resetImageScale() {
    editor.fitImgScaleToRing();
    editor.refreshCanvas();
};

function defaultInputValues() {
    const ringScale = 1 - editor.pfpRingScale;
    const imgScale = editor.pfpImgScale;

    imgScaleInput.value = imgScale;
    ringScaleInput.value = ringScale;

    // on and off is reversed for me,
    // can't bother fixing... so 'not' !
    
    //console.log(editor.bgMode, !editor.bgMode ? 'true' : 'false');
    flagModeToggleHandle.setAttribute('on', !editor.bgMode ? 'true' : 'false');
    setFlagModeCanvas();
}

// changing flag mode
flagModeToggle.onclick = function() {
    setFlagMode(!editor.bgMode);
}

function setFlagMode(val) {
    // set a new flag mode
    editor.setBgMode(val);

    // update the toggle handle
    flagModeToggleHandle.setAttribute('on', !val ? 'true' : 'false'); // smol fixe

    // update flag mode text
    if (val)
        flagModeText.innerHTML = 'flag mode: background';
    else
        flagModeText.innerHTML = 'flag mode: ring';

    // update flag mode preview canvas
    setFlagModeCanvas();
}

function setFlagModeCanvas() {
    flagModePreview.width =
    flagModePreview.height = 32;

    // set up the preview
    const previewCtx = flagModePreview.getContext('2d');
    const flag = presetFlags[editor.flagId].obj;

    // draw the canvas itself
    if (editor.bgMode) {
        flag.DrawFlagOnCanvas(flagModePreview);
        previewCtx.fillStyle = 'white';
        previewCtx.arc(
            flagModePreview.width/2, flagModePreview.height/2,
            flagModePreview.width/4, 0, 2 * Math.PI
        );
        previewCtx.fill();
    }
    else {
        previewCtx.fillStyle = 'white';
        previewCtx.arc(
            flagModePreview.width/2, flagModePreview.height/2,
            flagModePreview.width/2 * editor.pfpRingScale, 0, 2 * Math.PI
        );
        previewCtx.fill();

        flag.DrawFlagOnCanvas(flagModePreview);
        flag.EraseCircleOnCanvas(flagModePreview, editor.pfpRingScale);
    }
}

function onPfpUpload(img) {
    if (!editorloaded)
        resetEditor();

    editor.loadPfpImg(img);
    editor.refreshCanvas();

    defaultInputValues();
    setFlagModeCanvas();

    selectDiv(editorDiv);
}

// reset buttons and drag functionality
resetRingScaleButton.onclick = resetRingScale;
resetImageScaleButton.onclick = resetImageScale;
resetDragOffButton.onclick = resetDragOffset;

// drag drop on document
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => {
    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadImgFromFile(e.dataTransfer.files[0], onPfpUpload);
    }
});

// drag drop on upload buttom
uploadButton.onchange = function() {
    if (this.files && this.files[0]) {
        loadImgFromFile(this.files[0], onPfpUpload);
    }
};

// continue editing from export div
continueEditing.onclick = function() {
    selectDiv(editorDiv);
};

// 下载按钮事件处理
const downloadButton = document.getElementById('downloadButton');
downloadButton.onclick = function() {
    // 创建一个临时的a元素
    const a = document.createElement('a');
    a.href = exportEl.src;
    a.download = 'flag-pfp.png'; // 设置下载的文件名
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// Start with a default transparent image
window.onload = function() {
    const defaultImage = createTransparentImage(500, 500);
    defaultImage.onload = function() {
        onPfpUpload(defaultImage);
        // Set to flag mode by default
        setFlagMode(false); // false = ring mode
    };
};

//};