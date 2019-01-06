$(function() {
  $('body').fadeIn('4500');
});

setTimeout(function(){
      $('body').fadeOut('3000');
},7000);

$('.title').t({
   speed:60,          // タイピングのスピードを指定します。
   speed_vary:true,  // 「true」にすると人間が入力しているかのように文字ごとのスピードが変わります。
   delay:1.0,       // 開始時間を指定します。
   mistype:false,     // 文字の打ち間違いをする確率を指定します。
   caret:true,        // 「true」にするとカーソルを非表示する事ができます。
   blink:true,       // 「true」にするとカーソルを点滅させる事ができます。
   tag:'span',        // テキストを囲むタグを指定します。
   repeat:false       // 何回リピートするか指定します。「true」を指定すると、無限にリピートします。
 });
