function requestSuccess(data) {
      // Inputデバイスの配列を作成
     var inputIterator = data.inputs.values();
     for (var input = inputIterator.next(); !input.done; input = inputIterator.next()) {
         var value = input.value;
         // デバイス情報を保存
         midiDevices.inputs[value.name] = value;
         // イベント登録
         value.addEventListener('midimessage', inputEvent, false);
     }

     // Outputデバイスの配列を作成
     var outputIterator = data.outputs.values();
     for (var output = outputIterator.next(); !output.done; output = outputIterator.next()) {
         var value = output.value;
         // デバイス情報を保存
         midiDevices.outputs[value.name] = value;
     }
  }
  // 失敗したときの処理
  function requestError(error) {
      console.error('error!!!', error);
  }


  // MIDIデバイスにアクセスする
  (function requestMIDI() {
      if (navigator.requestMIDIAccess) {
          console.log('test');
          navigator.requestMIDIAccess().then(requestSuccess, requestError);
      } else {
          requestError();
      }
  })();
