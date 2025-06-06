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
    img.onload = () => {
        callback(img);
        
        // 如果去背景功能已开启，自动处理去背景
        if (editor && editor.useRemovedBg) {
            handleImageRemoveBg(file);
        }
    };
    img.onerror = () => alert('Image loading failed. Please try again.');

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

    // 设置flag mode toggle的状态
    flagModeToggleHandle.setAttribute('on', !editor.bgMode ? 'true' : 'false');
    
    // 更新flag mode文本
    if (editor.bgMode)
        flagModeText.innerHTML = 'flag mode: background';
    else
        flagModeText.innerHTML = 'flag mode: ring';
    
    // 设置remove background toggle的状态
    removeBgToggleHandle.setAttribute('on', editor.useRemovedBg ? 'true' : 'false');
    
    // 更新remove background文本
    removeBgText.innerHTML = `Remove Background: ${editor.useRemovedBg ? 'ON' : 'OFF'}`;
    
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

// 使用默认图片启动
window.onload = function() {
    const defaultImage = new Image();
    defaultImage.src = 'src/assets/default.jpeg';
    defaultImage.onload = function() {
        onPfpUpload(defaultImage);
        
        // 将默认图片转换为Blob并处理去背景
        const canvas = document.createElement('canvas');
        canvas.width = defaultImage.width;
        canvas.height = defaultImage.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(defaultImage, 0, 0);
        
        canvas.toBlob(async function(blob) {
            if (blob) {
                await handleImageRemoveBg(blob);
            }
        }, 'image/jpeg');
    };
};

// 生成随机边界字符串
function generateBoundary() {
    return '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
}

// 去背景API调用函数
async function removeBackground(imageFile) {
    // 显示加载指示器
    const loadingIndicator = document.getElementById('removeBgLoadingIndicator');
    loadingIndicator.style.display = 'block';
    
    try {
        // 生成随机boundary
        const boundary = generateBoundary();
        
        // 创建FormData
        const formData = new FormData();
        formData.append('image', imageFile);
        
        // 发送API请求
        const response = await fetch('https://demo.api4ai.cloud/img-bg-removal/v1/people/results?mode=fg-image', {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
                'a4a-client-app-id': 'api4.ai_people_bg_removal',
                'a4a-client-user-id': '6a0c49fd-3595-4db0-b2fb-7951935c6eff',
                'priority': 'u=1, i'
                // 注意：使用FormData时不要手动设置Content-Type，浏览器会自动添加正确的boundary
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        // 解析返回的JSON数据
        const data = await response.json();
        
        // 获取base64图像数据
        if (data.results && 
            data.results[0] && 
            data.results[0].entities && 
            data.results[0].entities[0] && 
            data.results[0].entities[0].image) {
            
            const base64Image = data.results[0].entities[0].image;
            return base64Image;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Background removal failed:', error);
        alert('Background removal failed. Please try again.');
        return null;
    } finally {
        // 隐藏加载指示器
        loadingIndicator.style.display = 'none';
    }
}

// 处理去背景图像
function processRemovedBgImage(base64Image) {
    if (!base64Image) return;
    
    // 创建新图像对象
    const img = new Image();
    img.onload = function() {
        // 更新编辑器中的图像
        editor.setRemovedBgImage(img);
        editor.refreshCanvas();
    };
    
    // 设置图像源
    img.src = `data:image/png;base64,${base64Image}`;
}

// 切换去背景状态
function toggleRemoveBg(value) {
    // 更新开关状态
    const removeBgToggleHandle = document.getElementById('removeBgToggleHandle');
    removeBgToggleHandle.setAttribute('on', value ? 'true' : 'false');
    
    // 更新文本
    const removeBgText = document.getElementById('removeBgText');
    removeBgText.innerHTML = `Remove Background: ${value ? 'ON' : 'OFF'}`;
    
    // 更新编辑器状态
    if (editor) {
        editor.useRemovedBg = value;
        editor.refreshCanvas();
    }
}

// 处理图片文件去背景
async function handleImageRemoveBg(file) {
    const base64Image = await removeBackground(file);
    if (base64Image) {
        processRemovedBgImage(base64Image);
        // 自动开启去背景模式
        toggleRemoveBg(true);
    }
}

// 获取去背景开关元素
const removeBgToggle = document.getElementById('removeBgToggle');
const removeBgToggleHandle = document.getElementById('removeBgToggleHandle');
const removeBgText = document.getElementById('removeBgText');

// 去背景开关点击事件
removeBgToggle.onclick = function() {
    // 如果没有去背景图像，则尝试处理当前图像
    if (!editor.removedBgImg && editor.pfpImg) {
        // 将图像转换为Blob
        const canvas = document.createElement('canvas');
        canvas.width = editor.pfpImg.width;
        canvas.height = editor.pfpImg.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(editor.pfpImg, 0, 0);
        
        canvas.toBlob(async function(blob) {
            if (blob) {
                await handleImageRemoveBg(blob);
            }
        }, 'image/jpeg');
    } else {
        // 切换去背景状态
        toggleRemoveBg(!editor.useRemovedBg);
    }
};

//};