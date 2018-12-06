var stage, w, h, loader;
var sky, grant, hill, hill2;
var container;
var ground = new Array();
var groudNum;
var groundImg;

function init() {
    // stage = new createjs.StageGL(window.__canvas);
    stage = new StageGL(window.__canvas);
    container = new createjs.Container();
    stage.addChild(container);

    initStageWH();

    // 获取画布的宽和高，后面计算使用
    w = window.innerWidth;
    h = window.innerHeight;

    createjs.Touch.enable(stage, true);
    
    // 定义静态资源
    let manifest = [{
        src: "spritesheet_grant.png", id: "grant"
    }, {     // 人物动作雪碧图
        src: "sky.png", id: "sky"
    }, {           // 天空
        src: "ground.png", id: "ground"
    }, {     // 地面
        src: "hill1.png", id: "hill"
    }, {        // 远山
        src: "hill2.png", id: "hill2"           // 近山
    }];     // Array, String, Object

    // 创建资源加载队列
    // (Boolean) 用XHR还是用HTML标签来加载
    // 如果是false的时候，就用标签来加载，如果不能用标签的话，就用XHR来加载。默认是true，用XHR来加载。
    loader = new createjs.LoadQueue(false);
    // 添加"资源加载完成"事件
    loader.addEventListener("complete", handleComplete);
    // 加载资源
    loader.loadManifest(manifest, true, "./assets/img/");  // (manifest, loadNow, basePath)
}

/**
 * 静态资源加载完成，处理函数
 */
function handleComplete() {
    // 渲染天空
    // sky = new createjs.Shape();
    // sky.graphics.beginBitmapFill(loader.getResult("sky")).drawRect(0, 0, w, h);
    // // 定义缓存区域(整个天空的区域))
    // sky.cache(0, 0, w, h);
    sky = new createjs.Bitmap(loader.getResult("sky"));
    
    sky.scaleX = innerWidth / 5;
    sky.scaleY = innerHeight / 400;
    stage.addChild(sky);

    groundImg = loader.getResult("ground");
    groudNum = parseInt(innerWidth / groundImg.width) + 5;    
    console.log("xxxxxxxxxxxx " + groudNum);
    for(let i = 0; i < groudNum ; i++) {
        let grounds = new createjs.Bitmap(groundImg);
        grounds.x = i * groundImg.width;
        grounds.y = h - groundImg.height;
        ground.push(grounds);
        stage.addChild(grounds);
    }

    // 渲染地面
    
    // ground = new createjs.Shape();
    // // 注意：drawRect()宽度要躲绘制一个单位
    // ground.graphics.beginBitmapFill(groundImg).drawRect(0, 0, w + groundImg.width, groundImg.height);
    // ground.tileW = groundImg.width;
    // ground.y = h - groundImg.height;

    // // 缓存区域(地面的区域)
    // ground.cache(0, 0, w + groundImg.width, groundImg.height);

    // 随机渲染远处山脉
    hill = new createjs.Bitmap(loader.getResult("hill"));
    // 设置图像转换
    // setTransform([x=0], [y=0], [scaleX=1], [scaleY=1], [rotation=0], [skewX=0], [skewY=0], [regX=0], [regY=0])
    hill.setTransform(Math.random() * w, h - hill.image.height * 4 - groundImg.height, 4, 4);
    hill.alpha = 0.5;     // 设置透明度

    // 随机渲染近处山脉
    hill2 = new createjs.Bitmap(loader.getResult("hill2"));
    hill2.setTransform(Math.random() * w, h - hill2.image.height * 3 - groundImg.height, 3, 3);

    // 创建雪碧图动画
    let spriteSheet = new createjs.SpriteSheet({
        framerate: 30,      // 帧率 FPS
        "images": [loader.getResult("grant")],      // 雪碧图原图
        "frames": { "width": 165, "height": 292, "count": 64, "regX": 82, "regY": 0 },  // 初始化
        // 定义动画
        "animations": {
            "run": [0, 25, "run"],     // name: [开始索引, 结束索引, '下一个动画名称', 倍率]
            "jump": [26, 63, "run"]
        }
    });

    // 绘制动画
    grant = new createjs.Sprite(spriteSheet, "run");
    // 处理雪碧图人物下方空白
    grant.y = window.innerHeight - 2 * 292 - groundImg.height;
    grant.scaleX = 2;
    grant.scaleY = 2;
    // 将生成的所有内容渲染至舞台
    stage.addChild(hill, hill2, grant);

    // 监听舞台上的鼠标点击事件
    stage.addEventListener("click", () => {
        // 跳转播放 jump 动画
        grant.gotoAndPlay("jump");
    });

    createjs.Ticker.timingMode = createjs.Ticker.RAF;     // RAF / RAF_SYNCHED / TIMEOUT
    createjs.Ticker.addEventListener("tick", tick);

}


/**
 * 定时器-重绘舞台
 */
function tick(event) {
    // event.delta -- 上一次tick到当前tick的ms
    let deltaS = event.delta / 1000;
    // 雪碧图人物移动距离
    let position = grant.x + 200 * deltaS;

    // getBounds() -- 返回当前帧相对于雪碧图原点的边界
    let grantW = grant.getBounds().width * grant.scaleX;
    grant.x = (position >= w + grantW) ? -grantW : position;

    let groundposX = 0;
    for (let i = 0; i < groudNum; i++) {
        ground[i].x -= deltaS * 200;
        if (ground[i].x >= groundposX){
            groundposX = ground[i].x;
        }
    }

    for (let i = groudNum - 1; i >= 0; i--){
        if (ground[i].x <= (-1 * groundImg.width)) {
            ground[i].x = groundposX + groundImg.width;
        }
    }
    
    // 从右至左移动山脉
    hill.x = (hill.x - deltaS * 30);
    // 如果山脉从左侧离开屏幕
    if (hill.x + hill.image.width * hill.scaleX <= 0) {
        hill.x = w;     // 重置回屏幕最右侧
    }

    // 处理如上
    hill2.x = (hill2.x - deltaS * 45);
    if (hill2.x + hill2.image.width * hill2.scaleX <= 0) {
        hill2.x = w;
    }

    stage.update();
}

function initStageWH() {
    //获取屏幕宽高  
    loadRuntime().getSystemInfo({
        success: function (res) {
            stageWidth = res.windowWidth;
            stageHeight = res.windowHeight;
            window.__canvas.width = stageWidth;
            window.__canvas.height = stageHeight;
            stageScale = stageHeight / 1206;
            container.scaleX = stageScale;
            container.scaleY = stageScale;
            container.x = (stageWidth - 750 * container.scaleX) / 2;
            stage.updateViewport(window.__canvas.width, window.__canvas.height)//开启webgl的时候需要开启这句话
        }
    })
}


// 程序主入口-初始化
init();