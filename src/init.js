// 初始化脚本 - 在页面加载时自动启动编辑器
window.addEventListener('DOMContentLoaded', function() {
    // 初始化编辑器并设置为flag模式
    function initializeEditor() {
        // 确保已经加载了所需的元素和函数
        if (typeof resetEditor === 'function' && typeof onPfpUpload === 'function' && typeof setFlagMode === 'function') {
            console.log('Initializing Flag PFP Maker editor...');
            
            // 加载默认图片
            const defaultImage = new Image();
            defaultImage.src = 'src/assets/default.png';
            
            // 加载图像到编辑器
            defaultImage.onload = function() {
                // 初始化编辑器
                resetEditor();
                
                // 加载默认图片
                onPfpUpload(defaultImage);
                
                // 设置为ring模式 (false = ring mode)
                setFlagMode(true);
                
                // 显示编辑器div
                const editorDiv = document.getElementById('editorDiv');
                const uploadDiv = document.getElementById('uploadDiv');
                if (editorDiv && uploadDiv) {
                    uploadDiv.style.display = 'none';
                    editorDiv.style.display = 'inherit';
                }
                
                console.log('Flag PFP Maker editor initialized!');
            };
        } else {
            // 如果所需函数尚未加载，等待100ms后重试
            setTimeout(initializeEditor, 100);
        }
    }
    
    // 启动初始化
    initializeEditor();
}); 