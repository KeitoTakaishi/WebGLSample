var v;
var knob = new Array(8);
var button = new Array(8);
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
    //console.log(v[1]+':'+v[2]);
    if(v[1] == 1){
      knob[0] = v[2];
      knob[0] = knob[0]/2;
      console.log(knob[0]);
    }else if(v[1] == 2){
      knob[1] = v[2];
      console.log(knob[1]);
    }else if(v[1] == 3){
      knob[2] = v[2];
      console.log(knob[2]);
    }else if(v[1] == 4){
      knob[3] = v[2];
      console.log(knob[3]);
    }else if(v[1] == 5){
      knob[4] = v[2];
      console.log(knob[4]);
    }else if(v[1] == 6){
      knob[5] = v[2];
      console.log(knob[5]);
    }else if(v[1] == 7){
      knob[6] = v[2];
      console.log(knob[6]);
    }else if(v[1] == 8){
      knob[7] = v[2];
      console.log(knob[7]);
    }else if(v[1] == 40){
      button[0] = v[2];
      //console.log(v[1]+ ' : '+ button[0]);
    }else if(v[1] == 41){
      button[1] = v[2];
      //console.log(v[1]+ ' : '+ button[0]);
    }
    console.log(`v[0] : ${v[0]}`);
    console.log(`v[1] : ${v[1]}`);
    console.log(`button[0] : ${button[0]}`);

}
