(function() {
  //
  var splitInstance = Split(["#VeryTable", "#canvasZone"], {
    onDragEnd: function() {
      // 表格重新渲染
      hot1.render();
    }
  });

  // console.log(hot1);
  //showError('当前浏览器不支持WebGL，请更换其他浏览器使用本引擎！', null);
})();

function showError(errorMessage, errorEvent) {
  var errorContent =
    '<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button>';
  if (errorEvent) {
    var regEx = /\(.+:(\d+):(\d+)\)\n/g;

    var match = regEx.exec(errorEvent.stack);
    if (match) {
      errorContent += "Line ";
      var lineNumber = match[1];
      var columnNumber = match[2];

      errorContent += lineNumber + ":" + columnNumber + " - ";
    }
  }

  errorContent += errorMessage + "</div>";

  document.getElementById("errorZone").style.display = "block";
  document.getElementById("errorZone").innerHTML = errorContent;

  // Close button error
  document
    .getElementById("errorZone")
    .querySelector(".close")
    .addEventListener("click", function() {
      document.getElementById("errorZone").style.display = "none";
    });
}

var fpsLabel = document.getElementById("fpsLabel");
var engine;

var canvas = document.getElementById("renderCanvas");

// 入口函数，主要改变对象
var createScene = function() {
  // This creates a basic Babylon Scene object (non-mesh)
  var scene = new BABYLON.Scene(engine);

  // This creates and positions a free camera (non-mesh)
  var camera = new BABYLON.FreeCamera(
    "camera1",
    new BABYLON.Vector3(0, 5, -10),
    scene
  );

  // This targets the camera to scene origin
  camera.setTarget(BABYLON.Vector3.Zero());

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  var light = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
  var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

  // Move the sphere upward 1/2 its height
  sphere.position.y = 1;

  // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
  var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

  return scene;
};

engine = new BABYLON.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true
});
var scene = createScene();

engine.runRenderLoop(function() {
  if (canvas.width !== canvas.clientWidth) {
    engine.resize();
  }

  if (scene) {
    scene.render();
  }

  // 右上角fps显示控制
  // fpsLabel.style.right =
  // 	document.body.clientWidth -
  // 	(jsEditor._domElement.clientWidth + canvas.clientWidth) +
  // 	'px';
  fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
});

// Resize
window.addEventListener("resize", function() {
  engine.resize();
});

const Stop = () => {
  if (engine) {
    engine.dispose();
    engine = null;
    eval(scriptCode);
  }
  console.log("dispose");
  // 首先应该解析表格，将handsontable数据转换为我的数据结构;
  // 获取入口节点函数，进行关联，运行函数
};
document.getElementById("runButton").addEventListener("click", Stop);

let log = () => {
  let originData = hot1.getData();
  for (let i = 0; i < originData.length; i++) {
    let str = "";
    for (let j = 0; j < originData[i].length; j++) {
      str += originData[i][j] + "~";
    }
    console.log(str);
  }

  // 在这里，导入表格数据到中间结构，实现VeryTable数据填充；
	// 除了全局环境变量外，将之前的数据结构全部清空，并且重头开始解析和编译表格数据，并且将Babylon的所有参数都重新初始化；
	// 数据填充 => 语法解析 => 编译和组装 => Babylon设置
};
document.getElementById("settingsButton").addEventListener("click", log);

const scriptCode = `var delayCreateScene = function(

) {
	// Model by Mixamo

	engine.enableOfflineSupport = false;

	// This is really important to tell Babylon.js to use decomposeLerp and matrix interpolation
	BABYLON.Animation.AllowMatricesInterpolation = true;
	
	var scene = new BABYLON.Scene(engine);

	// Babylon Inspector加载
	// scene.debugLayer.show();

	var camera = new BABYLON.ArcRotateCamera(
		'camera1',
		Math.PI / 2,
		Math.PI / 4,
		3,
		new BABYLON.Vector3(0, 1, 0),
		scene
	);
	camera.attachControl(canvas, true);

	camera.lowerRadiusLimit = 2;
	camera.upperRadiusLimit = 10;
	camera.wheelDeltaPercentage = 0.01;

	var light = new BABYLON.HemisphericLight(
		'light1',
		new BABYLON.Vector3(0, 1, 0),
		scene
	);
	light.intensity = 0.6;
	light.specular = BABYLON.Color3.Black();

	var light2 = new BABYLON.DirectionalLight(
		'dir01',
		new BABYLON.Vector3(0, -0.5, -1.0),
		scene
	);
	light2.position = new BABYLON.Vector3(0, 5, 5);

	// Shadows
	var shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
	shadowGenerator.useBlurExponentialShadowMap = true;
	shadowGenerator.blurKernel = 32;

	engine.displayLoadingUI();

	BABYLON.SceneLoader.ImportMesh(
		'',
		'scenes/',
		'dummy3.babylon',
		scene,
		function(newMeshes, particleSystems, skeletons) {
			var skeleton = skeletons[0];

			shadowGenerator.addShadowCaster(scene.meshes[0], true);
			for (var index = 0; index < newMeshes.length; index++) {
				newMeshes[index].receiveShadows = false;
			}

			var helper = scene.createDefaultEnvironment({
				enableGroundShadow: true
			});
			helper.setMainColor(BABYLON.Color3.Gray());
			helper.ground.position.y += 0.01;

			// ROBOT
			skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
			skeleton.animationPropertiesOverride.enableBlending = true;
			skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
			skeleton.animationPropertiesOverride.loopMode = 1;

			var idleRange = skeleton.getAnimationRange('YBot_Idle');
			var walkRange = skeleton.getAnimationRange('YBot_Walk');
			var runRange = skeleton.getAnimationRange('YBot_Run');
			var leftRange = skeleton.getAnimationRange('YBot_LeftStrafeWalk');
			var rightRange = skeleton.getAnimationRange('YBot_RightStrafeWalk');

			// IDLE
			if (idleRange)
				scene.beginAnimation(
					skeleton,
					idleRange.from,
					idleRange.to,
					true
				);

			// UI
			var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
				'UI'
			);
			var UiPanel = new BABYLON.GUI.StackPanel();
			UiPanel.width = '220px';
			UiPanel.fontSize = '14px';
			UiPanel.horizontalAlignment =
				BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
			UiPanel.verticalAlignment =
				BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
			advancedTexture.addControl(UiPanel);
			// ..
			var button = BABYLON.GUI.Button.CreateSimpleButton(
				'but1',
				'Play Idle'
			);
			button.paddingTop = '10px';
			button.width = '100px';
			button.height = '50px';
			button.color = 'white';
			button.background = 'green';
			button.onPointerDownObservable.add(() => {
				if (idleRange)
					scene.beginAnimation(
						skeleton,
						idleRange.from,
						idleRange.to,
						true
					);
			});
			UiPanel.addControl(button);
			// ..
			var button1 = BABYLON.GUI.Button.CreateSimpleButton(
				'but2',
				'Play Walk'
			);
			button1.paddingTop = '10px';
			button1.width = '100px';
			button1.height = '50px';
			button1.color = 'white';
			button1.background = 'green';
			button1.onPointerDownObservable.add(() => {
				if (walkRange)
					scene.beginAnimation(
						skeleton,
						walkRange.from,
						walkRange.to,
						true
					);
			});
			UiPanel.addControl(button1);
			// ..
			var button1 = BABYLON.GUI.Button.CreateSimpleButton(
				'but3',
				'Play Run'
			);
			button1.paddingTop = '10px';
			button1.width = '100px';
			button1.height = '50px';
			button1.color = 'white';
			button1.background = 'green';
			button1.onPointerDownObservable.add(() => {
				if (runRange)
					scene.beginAnimation(
						skeleton,
						runRange.from,
						runRange.to,
						true
					);
			});
			UiPanel.addControl(button1);
			// ..
			var button1 = BABYLON.GUI.Button.CreateSimpleButton(
				'but4',
				'Play Left'
			);
			button1.paddingTop = '10px';
			button1.width = '100px';
			button1.height = '50px';
			button1.color = 'white';
			button1.background = 'green';
			button1.onPointerDownObservable.add(() => {
				if (leftRange)
					scene.beginAnimation(
						skeleton,
						leftRange.from,
						leftRange.to,
						true
					);
			});
			UiPanel.addControl(button1);
			// ..
			var button1 = BABYLON.GUI.Button.CreateSimpleButton(
				'but5',
				'Play Right'
			);
			button1.paddingTop = '10px';
			button1.width = '100px';
			button1.height = '50px';
			button1.color = 'white';
			button1.background = 'green';
			button1.onPointerDownObservable.add(() => {
				if (rightRange)
					scene.beginAnimation(
						skeleton,
						rightRange.from,
						rightRange.to,
						true
					);
			});
			UiPanel.addControl(button1);
			// ..
			var button1 = BABYLON.GUI.Button.CreateSimpleButton(
				'but6',
				'Play Blend'
			);
			button1.paddingTop = '10px';
			button1.width = '100px';
			button1.height = '50px';
			button1.color = 'white';
			button1.background = 'green';
			button1.onPointerDownObservable.add(() => {
				if (walkRange && leftRange) {
					scene.stopAnimation(skeleton);
					var walkAnim = scene.beginWeightedAnimation(
						skeleton,
						walkRange.from,
						walkRange.to,
						0.5,
						true
					);
					var leftAnim = scene.beginWeightedAnimation(
						skeleton,
						leftRange.from,
						leftRange.to,
						0.5,
						true
					);

					// Note: Sync Speed Ratio With Master Walk Animation
					walkAnim.syncWith(null);
					leftAnim.syncWith(walkAnim);
				}
			});
			UiPanel.addControl(button1);

			engine.hideLoadingUI();
		}
	);

	return scene;
};

engine = new BABYLON.Engine(canvas, true, {
	preserveDrawingBuffer: true,
	stencil: true
});
var scene = delayCreateScene();

engine.runRenderLoop(function() {
	if (canvas.width !== canvas.clientWidth) {
		engine.resize();
	}

	if (scene) {
		scene.render();
	}

	// 右上角fps显示控制
	// fpsLabel.style.right =
	// 	document.body.clientWidth -
	// 	(jsEditor._domElement.clientWidth + canvas.clientWidth) +
	// 	'px';
	fpsLabel.innerHTML = engine.getFps().toFixed() + ' fps';
});

// Resize
window.addEventListener('resize', function() {
	engine.resize();
});`;
