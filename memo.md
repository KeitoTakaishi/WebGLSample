## Three.js入門

### 絵が出るまでの流れ
1. camera, scene, rendererのセットアップ

```js
//init関数内
var camera = new THREE.PerspectiveCamera(
   75, window.innerWidth/window.innerHeight, 0.1, 1000);

var scene = new THREE.Scene();

var renderer = new THREE.WebGLRenderer();

```

2. 描画するためのジオメトリーを生成する(material, meshを初期化) -> sceneにadd

```js
//init関数内
var material = new THREE.MeshPhongMaterial({
  color : 0xfffff,
  shininess : 100,
  side : THREE.DoubleSide,
});

var geometry = new THREE.TorusKnotBufferGeometry( 0.4, 0.08, 95, 20 );
object = new THREE.Mesh(geometry, material);
scene.add(object);

```

3. 毎フレームレンダリングする<br>
requestAnimationFrameメソッドを用いて再描画を行う関数を呼び出す．
(ブラウザの描画更新単位と同じ単位で呼び出される)

```js
function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
}
```

## materialにていて
https://ics.media/tutorial-three/material_variation.html

## 便利なライブラリ
### control

```js
<script src="../Three_js/examples/js/controls/OrbitControls.js"></script>

<script>
  var controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.target.set( 0, 1, 0 );
  controls.update();
</script>
```


### Stats
```js
stats = new Stats();
document.body.appendChild(stats.dom);
```

```js
stats.begin();
//analyze ncode
stats.end();
```


## shader
- https://nogson2.hatenablog.com/entry/2017/12/24/193017
- https://nogson2.hatenablog.com/entry/2017/08/15/213233
- https://nogson2.hatenablog.com/entry/2017/12/21/011736
- http://izmiz.hateblo.jp/entry/2015/04/19/223456
- https://nogson2.hatenablog.com/entry/2017/08/15/213233
- https://docs.google.com/presentation/d/1NMhx4HWuNZsjNRRlaFOu2ysjo04NgcpFlEhzodE8Rlg/edit#slide=id.g3689912efb_0_91

```js
return new THREE.Mesh(
        new THREE.PlaneBufferGeometry(512, 512),
        new THREE.RawShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: require('../../../../glsl/zoomblur.vert'),
            fragmentShader: require('../../../../glsl/zoomblur.frag'),
        })
    );
```

### shader(PostProcessing系を使うまでの手順)
1. 必要なファイル

EffectComposer.js(post processingを追加するために必要)．
MaskPass.js, Shader.Pass, CopyShader.jsはEffectComposer.jsで内部的に使われて
いるため必要．そしてRenderPassによって描画パスを追加できるようになる．

## Midi
- http://hackist.jp/?p=6427

### type
i (整数)
f (float)
v2 (THREE.Vector2)
v3 (THREE.Vector3)
v4 (THREE.Vector4)
c (THREE.Color)
m4 (THREE.Matrix4)
t (THREE.Texture)



## 検索
- setPixelRatio
- assign
