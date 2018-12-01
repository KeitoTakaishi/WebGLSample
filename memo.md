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
