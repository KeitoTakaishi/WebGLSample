## Texture周りについて
- minfilter
- magFilter


## アニメーション
requestAnimationFrame(callback);

## Three.js手順
0. three.jsを入れる
https://threejs.org/build/three.js
1. scene,cameraの作成
2.

## PostProcessing(Three.js上で扱う)

0. postprocessingの導入
EffectComposer.js
RenderPass.js
sRGBShiftShader.js
ShaderPass.js
MaskPass.js
を同じディレクトリに入れる

1. EffectComposerを作成
```
var renderer = new THREE.WebGLRenderer();
var composer = new THREE.EffectComposer(renderer);
```

2. addPassメソッドを用いてフィルタを追加
```
var renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);
```
