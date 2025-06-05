// 初始化脚本 - 在页面加载时自动启动编辑器
window.addEventListener('DOMContentLoaded', function() {
    // 创建一个透明图像
    function createTransparentImage(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // 填充透明像素
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, width, height);
        
        // 转换为图像
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    // 初始化编辑器并设置为flag模式
    function initializeEditor() {
        // 确保已经加载了所需的元素和函数
        if (typeof resetEditor === 'function' && typeof onPfpUpload === 'function' && typeof setFlagMode === 'function') {
            console.log('初始化Flag PFP Maker编辑器...');
            
            // 创建透明图像
            const defaultImage = createTransparentImage(500, 500);
            
            // 加载图像到编辑器
            defaultImage.onload = function() {
                // 初始化编辑器
                resetEditor();
                
                // 加载默认透明图像
                onPfpUpload(defaultImage);
                
                // 设置为ring模式 (false = ring mode)
                setFlagMode(false);
                
                // 显示编辑器div
                const editorDiv = document.getElementById('editorDiv');
                const uploadDiv = document.getElementById('uploadDiv');
                if (editorDiv && uploadDiv) {
                    uploadDiv.style.display = 'none';
                    editorDiv.style.display = 'inherit';
                }
                
                console.log('Flag PFP Maker编辑器初始化完成！');
            };
        } else {
            // 如果所需函数尚未加载，等待100ms后重试
            setTimeout(initializeEditor, 100);
        }
    }
    
    // 开始初始化过程
    initializeEditor();
}); 