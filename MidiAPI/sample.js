// (function () {
//     var v;
//     // MIDIデバイス
//     var midiDevices = {
//         inputs: {},
//         outputs: {}
//     };
//
//     function inputEvent(e) {
//         var target = e.target;
//         var device = midiDevices.outputs[target.name];
//         var message = '';
//         var numArray = [];
//
//         // puttern1 2桁の16進数にして表示する
//         // event.data.forEach(function(val) {
//         //     numArray.push(('00' + val.toString(16)).substr(-2));
//         // });
//
//         // puttern2 2桁の10進数にして表示する
//         event.data.forEach(function(val) {
//             var value =  val.toString();
//             numArray.push(value);
//             //numArray.push((val.toString(10)));
//         });
//
//
//         message = numArray.join(' ');
//         // InputしたDeviceに結果を送信する
//         //device.send(e.data);
//
//
//         v = message.split(' ');
//         //console.log(v[1]+':'+v[2]);
//     }
//
//     // 成功したときの処理
//     function requestSuccess(data) {
//         // Inputデバイスの配列を作成
//        var inputIterator = data.inputs.values();
//        for (var input = inputIterator.next(); !input.done; input = inputIterator.next()) {
//            var value = input.value;
//            // デバイス情報を保存
//            midiDevices.inputs[value.name] = value;
//            // イベント登録
//            value.addEventListener('midimessage', inputEvent, false);
//        }
//
//        // Outputデバイスの配列を作成
//        var outputIterator = data.outputs.values();
//        for (var output = outputIterator.next(); !output.done; output = outputIterator.next()) {
//            var value = output.value;
//            // デバイス情報を保存
//            midiDevices.outputs[value.name] = value;
//        }
//     }
//     // 失敗したときの処理
//     function requestError(error) {
//         console.error('error!!!', error);
//     }
//     // MIDIデバイスにアクセスする
//     function requestMIDI() {
//         if (navigator.requestMIDIAccess) {
//             navigator.requestMIDIAccess().then(requestSuccess, requestError);
//         } else {
//             requestError();
//         }
//     }
//     requestMIDI();
// })();

/*
    var v;
    // MIDIデバイス
    var midiDevices = {
        inputs: {},
        outputs: {}
    };

    function inputEvent(e) {
        var target = e.target;
        var device = midiDevices.outputs[target.name];
        var message = '';
        var numArray = [];

        // puttern2 2桁の10進数にして表示する
        event.data.forEach(function(val) {
            var value =  val.toString();
            numArray.push(value);
        });
        message = numArray.join(' ');
        v = message.split(' ');
        console.log(v[1]+':'+v[2]);
    }
    */

    // 成功したときの処理
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
