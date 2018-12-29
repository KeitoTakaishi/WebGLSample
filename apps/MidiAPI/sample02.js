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
