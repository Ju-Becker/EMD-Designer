/*
 * modelupdownload
 *  
 * gives the possibility to download your model
 * as .txt file (syntax of the file explained below)
 * 
 * gives the possibility to upload your model-file
 * to continue working on it
 */

import stAct from './fsm/Graph/StateActions'; // create uploaded states
import trAct from './fsm/Graph/TransitionActions'; // create uploaded transitions
import spaAct from './fsm/Graph/SpecialArrowActions';// create uploaded specialarrows
import State from './fsm/Graph/State'; // create uploaded states
import shapes from './fsm/Graph/Shapes'; // used to create the download data
import fsmCSS from './fsm/Graph/Graph'; // used to create the download data
import { graph } from './graph'; // download and upload the states, rates, intervention data
import ode from './ode'; // used to create the dataset 

/* syntax of the download-file:
the file contains a header: Epidemic-Model-Data
followed by a newline and the state information
followed by a newline and the transition information
followed by a newline and the specialArrow with type 'in' information
followed by a newline and the specialArrow with type 'out' information
followed by a newline and the interverntion information
followed by a newline and the interverntion value for each rate*/

/* Epidemic-Model-Data
 * states: stateID,stateValue,stateName;...,...,...;...:
 * transitions are splitted in the transition name, the stateID of the 
 * source state and the stateID of the target state:
 * syntax of the transition name: ratename-...-(stateID)-...-+-...,
 * specialArrowIN: ratename, target stateID;....:
 * specialArrowOUT: ratename, source stateID;....:
 * interventions: intervention name-intervention value,....:
 * interventions value: ratename, interventinname, ratevalue;....;...:
*/
//Example for the classic SIR-Model:
/*
Epidemic-Model-Data
s0,1000,119878;s1,0,119868;s2,0,119877:
120573-(s1),s0,s1;120574,s1,s2:
:
:
t0-0:
120573,t0,0.3;120574,t0,0.2:
*/


// called by index.js 
// when a file is uploaded inituploadmodel is called
function inituploadmodel() {
	if(shapes.generateFreeID('s') !== 's1'){
		alert('There is an acitve model running! \nPlease refresh the website before the upload.');
		document.getElementById('uploadmodel').style.backgroundColor = 'red';
		return;
	}
	const file = document.getElementById('uploadmodel').files[0];
	const textType = /text.*/;
	if(file.type.match(textType)) {
		const reader = new FileReader();
		reader.onload = function(e) {
			generate(reader.result); // main function for the upload
	}
		reader.readAsText(file);
	} else {alert('Error with your datatype');}
}
// we read the uploaded data from the input
function generate(input){
	var i = 0; // main iterator
	var xdist = 100; // distance of the states
	var name;
	var temp;
	var id; 
	var value;
	var testid = 's1';
	var first = true; // special treatment for the first input state
	const verify = input.slice(0,19); // make sure that we got a suitable file
	if(verify === 'Epidemic-Model-Data'){
	i=20;
	// read the state data
	while(input[i]!==':'){
		name =[];
		temp ='';
		id = '';
		value = '';
		while(input[i]!== ','){
			id += input[i];
			i++;
		}
		i++;
		while(input[i]!== ','){
			value += input[i];
			i++;
		}
		value = parseFloat(value);
		i++;
		while(input[i]!==';'&&input[i]!==':'){
			temp += input[i];
			i++;
			if(input[i] ===','){
				name.push(parseInt(temp));
				temp ='';
				i++;
			}
		}
		name.push(parseInt(temp))
		if(first){
			var j = 0;
			first = false;
			const defaultstate = shapes.getShape('s0');
			fsmCSS.systemStateActivate('sr',defaultstate);
			fsmCSS.activeShape.move(100,150);
			stAct.nameRemoveToken();
			while(j < name.length){
				stAct.stateName(name[j]);
				j++;
			}
			fsmCSS.activeShape.deactivate();
			fsmCSS.systemStateActivate('i');
			shapes.draw();
			fsmCSS.callback(shapes.shMap);
			// state value
			graph.data.states = {};
			graph.data.states.s0 = {};
			graph.data.states.s0.name = 'S';
			graph.data.states.s0.value = value;
			graph.data.interventions = {};
			graph.data.interventions.t0 = 0;
			graph.data.rates = {};
		}else{
		while(id!==testid){
			testid = shapes.generateFreeID('s');
		}
		const st = new State(id, xdist, 150);
		shapes.addShape(id, st);
		var j = 0;
		while(j < name.length){
		st.nameAddChr(name[j]);
		j++;
		}	
		shapes.draw();
		fsmCSS.callback(shapes.shMap);
		// state value
		graph.data.states[id] = {};
		graph.data.states[id].name = st.name;
		graph.data.states[id].value = value;
		}
		xdist += 150;
		if(input[i] !== ':'){
			i++;
		}
	}
	// transition data
	i += 2; // skip the ':' and the newline
	var source='';
	var target='';
	name=[];
	temp = '';
	while(input[i]!==';' && input[i] !== ':'){
		source=''; 
		target='';
		name=[];
		temp = '';
		while(input[i]!==','){
			temp = '';
			while(input[i] !== '-' && input[i] !== ','){
				temp += input[i];
				i++;
			}
			switch (temp[0]){
				case '(' :
					temp = temp.substring(1,temp.length-1);
					name.push('(');
					name.push(temp);
					name.push(')');
					break;
				case '+':
					name.push('+');
					break;
				default:
					name.push(temp);
					break;
			}
			if(input[i] !== ','){i++;}
		}
		name.push(',');
		temp ='';
		i++;
		while(input[i]!== ','){
			temp += input[i];
			i++;
		}
		source += temp;
		source = shapes.getShape(source);
		i++;
		temp ='';
		while(input[i]!== ';'&&input[i]!== ':'){
			temp += input[i];
			i++;
		}
		target += temp;
		target = shapes.getShape(target);

		var transition = trAct.transitionCreate(source,target); 
		fsmCSS.systemStateActivate('tr', transition);
		// create the name of the transition
		var j =0;
		while(name[j]!==','){
			var s ='';
			switch (name[j]) {
				case '+':
					fsmCSS.activeShape.nameAddToken('o', 65291);
					j++;
					break;
				case '(':
					j++;
					while(name[j]!==')'){
						s+= name[j];
						j++;
					}
					s = shapes.getShape(s);
					fsmCSS.activeShape.nameAddToken('s', s);
					j++;
					break;
				default:
					fsmCSS.activeShape.nameAddToken('r', parseInt(name[j]));
					j++;
					break;
			}
		}
		fsmCSS.activeShape.deactivate();
		fsmCSS.systemStateActivate('i');
		shapes.draw();
		fsmCSS.callback(shapes.shMap);
		if(input[i] !== ':'){
			i++;
		}
	}
  // special arrow data 'in'
	i += 2;
	var source='';
	var target='';
	name=[];
	temp = '';
	while(input[i]!==';' && input[i] !== ':'){
		source=''; 
		target='';
		name=[];
		temp = '';
		while(input[i]!==','){
			temp = '';
			while(input[i] !== '-' && input[i] !== ','){
				temp += input[i];
				i++;
			}
			switch (temp[0]){
				case '(' :
					temp = temp.substring(1,temp.length-1);
					name.push('(');
					name.push(temp);
					name.push(')');
					break;
				case '+':
					name.push('+');
					break;
				default:
					name.push(temp);
					break;
			}
			if(input[i] !== ','){i++;}
		}
		name.push(',');
		i++;
		temp ='';
		while(input[i]!== ';'&&input[i]!== ':'){
			temp += input[i];
			i++;
		}
		target += temp;
		target = shapes.getShape(target);

		fsmCSS.systemStateActivate('t',target);
		spaAct.specialArrowCreate('in');
		// create the name of the specialarrow
		var j =0;
		while(name[j]!==','){
			var s ='';
			switch (name[j]) {
				case '+':
					fsmCSS.activeShape.nameAddToken('o', 65291);
					j++;
					break;
				case '(':
					j++;
					while(name[j]!==')'){
						s+= name[j];
						j++;
					}
					s = shapes.getShape(s);
					fsmCSS.activeShape.nameAddToken('s', s);
					j++;
					break;
				default:
					fsmCSS.activeShape.nameAddToken('r', parseInt(name[j]));
					j++;
					break;
			}
		}
		fsmCSS.activeShape.deactivate();
		fsmCSS.systemStateActivate('i');
		shapes.draw();
		fsmCSS.callback(shapes.shMap);
		if(input[i] !== ':'){
			i++;
		}		
	}
	// special arrow data 'out'
	i += 2;
	var source='';
	var target='';
	name=[];
	temp = '';
	while(input[i]!==';' && input[i] !== ':'){
		source=''; 
		target='';
		name=[];
		temp = '';
		while(input[i]!==','){
			temp = '';
			while(input[i] !== '-' && input[i] !== ','){
				temp += input[i];
				i++;
			}
			switch (temp[0]){
				case '(' :
					temp = temp.substring(1,temp.length-1);
					name.push('(');
					name.push(temp);
					name.push(')');
					break;
				case '+':
					name.push('+');
					break;
				default:
					name.push(temp);
					break;
			}
			if(input[i] !== ','){i++;}
		}
		name.push(',');
		i++;
		temp ='';
		while(input[i]!== ';'&&input[i]!== ':'){
			temp += input[i];
			i++;
		}
		source += temp;
		source = shapes.getShape(source);

		fsmCSS.systemStateActivate('t',source);
		spaAct.specialArrowCreate('out');
		// create the name of the specialarrow
		var j =0;
		while(name[j]!==','){
			var s ='';
			switch (name[j]) {
				case '+':
					fsmCSS.activeShape.nameAddToken('o', 65291);
					j++;
					break;
				case '(':
					j++;
					while(name[j]!==')'){
						s+= name[j];
						j++;
					}
					s = shapes.getShape(s);
					fsmCSS.activeShape.nameAddToken('s', s);
					j++;
					break;
				default:
					fsmCSS.activeShape.nameAddToken('r', parseInt(name[j]));
					j++;
					break;
			}
		}
		fsmCSS.activeShape.deactivate();
		fsmCSS.systemStateActivate('i');
		shapes.draw();
		fsmCSS.callback(shapes.shMap);
		if(input[i] !== ':'){
			i++;
		}		
	}
	// load the intervention value
	i += 2;
	var intervention;
	var interventionvalue;
	while(input[i] !== ':'){
		intervention = '';
		interventionvalue = '';
		while(input[i] !== '-'){
			intervention += input[i];
			i++;
		}
		i++;
		while(input[i] !== ',' && input[i] !== ':'){
			interventionvalue += input[i];
			i++;
		}
		interventionvalue = parseFloat(interventionvalue);
		if(input[i] !== ':'){
			i++;
		}
		graph.data.interventions[intervention] = interventionvalue;
	}
	// load the rates value according to the intervention
	i += 2;
	var rateName;
	var ratevalue;
	while(input[i] !== ':'){
		rateName = '';
		intervention = '';
		ratevalue = '';
		while(input[i] !== ','){
			rateName += input[i];
			i++;
		}
		rateName = String.fromCodePoint(rateName);
		i++;
		while(input[i] !== ','){
			intervention += input[i];
			i++;
		}
		i++;
		while(input[i] !== ':' && input[i] !== ';'){
			ratevalue += input[i];
			i++;
		}
		ratevalue = parseFloat(ratevalue);
		if(input[i] !== ':'){
			i++;
		}
		if(graph.data.rates[rateName] === undefined){
			graph.data.rates[rateName] = {};
		}
		graph.data.rates[rateName][intervention] = ratevalue;
	}
	graph.load();
	// green sign for correct upload and upload is finished
	document.getElementById('uploadmodel').style.backgroundColor = 'lightgreen';
	// since graph.load() change some settings, we regain the view of the Upload/Download tab
	$('#fsmID').hide();
	$('#odeID').hide();
	$('#inID').hide();
	$('#plotID').hide();
	$('#tab2ID').hide();
	$('#statesID').hide();
	$('#ratesID').hide();
	$('#tab3ID').hide();
	$('#GraphButtons').hide();
	$('#downloaduploadID').show();
	$('#helpID').hide();
	$('#Simulator').removeClass('active');
	$('#Designer').removeClass('active');
	$('#UploadDownload').addClass('active');
	}else{
	alert('wrong data input')
	}
}
//---------------------------

//function to create the download
// called by the function downloadmodel()
function downloaddata(data, filename, type) {
	var file = new Blob([data], {type: type});
	if (window.navigator.msSaveOrOpenBlob) // IE10+
			window.navigator.msSaveOrOpenBlob(file, filename);
	else { // Others
			var a = document.createElement("a"),
							url = URL.createObjectURL(file);
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);  
			}, 0); 
	}
}
// main function to create the download output text
// i.e. create the text for the download file
function downloadmodel() {
	var text = 'Epidemic-Model-Data\n';
	var filename = 'EMD-download.txt';
	var type = /text.*/;
	var shID,sh,shType;
	// for each state save the ID, the value and the name
	for([shID, sh] of shapes.shMap) {
		shType = shID.substring(0,1);
		if(shType === 's'){
			text += shID;
			text += ',';
			// it is possible that the user has not yet entered 'The Simulation'
			// therefore, if graph data was not yet initialized, we simply pick 0 as default
			if(graph.states[shID] !== undefined){ 
				text += graph.states[shID].getValue();
			}else{
				text += '0';
			}
			text += ',';
			text += sh.nameArr;
			text += ';';
		}
	}
	text = text.substring(0,text.length - 1);
	text += ':';
	text += '\n';
	// for each transition save the name and the source(target) stateID
	for([shID, sh] of shapes.shMap){
		shType = shID.substring(0,1);
		//first transition then special arrows
		if(shType === 't' && sh.type === undefined){
			for(let m = 0; m < sh.nameArr.length; m++){
				switch (sh.nameArr[m][0]) {
					case 'r':
						text += sh.nameArr[m][1];
						text += '-';
						break;
					case 's':
						text += '(';
						text += sh.nameArr[m][1].id;
						text += ')';
						text += '-'
						break;
					case 'o':
						text += '+';
						text += '-'
						break;
					default:
						break;
					
				}
			}
			text = text.substring(0,text.length - 1);
			text += ',';
			text += sh.source.id;
			text+= ',';
			text += sh.target.id;
			text += ';';
		}
	}
	if(text.charAt(text.length-1)!== ':' && text.charAt(text.length-1)!== '\n'){
		text = text.substring(0,text.length - 1);
		text += ':';
	}else{
		text += ':';
	}
	text += '\n';
	// for each specialArrow type 'in' save the name and the target stateID
	for([shID, sh] of shapes.shMap){
		shType = shID.substring(0,1);
		//special arrows 'in'
		if(shType === 't' && sh.type === 'in'){
			for(let m = 0; m < sh.nameArr.length; m++){
				switch (sh.nameArr[m][0]) {
					case 'r':
						text += sh.nameArr[m][1];
						text += '-';
						break;
					case 's':
						text += '(';
						text += sh.nameArr[m][1].id;
						text += ')';
						text += '-'
						break;
					case 'o':
						text += '+';
						text += '-'
						break;
					default:
						break;
					
				}
			}
			text = text.substring(0,text.length - 1);
			text += ',';
			text += sh.target.id;
			text += ';';
		}
	}
	if(text.charAt(text.length-1)!== ':' && text.charAt(text.length-1)!== '\n'){
		text = text.substring(0,text.length - 1);
		text += ':';
	}else{
		text += ':';
	}
	text += '\n';
	// for each specialArrow type 'out' save the name and the source stateID
	for([shID, sh] of shapes.shMap){
		shType = shID.substring(0,1);
		//special arrows 'out'
		if(shType === 't' && sh.type === 'out'){
			for(let m = 0; m < sh.nameArr.length; m++){
				switch (sh.nameArr[m][0]) {
					case 'r':
						text += sh.nameArr[m][1];
						text += '-';
						break;
					case 's':
						text += '(';
						text += sh.nameArr[m][1].id;
						text += ')';
						text += '-'
						break;
					case 'o':
						text += '+';
						text += '-'
						break;
					default:
						break;
					
				}
			}
			text = text.substring(0,text.length - 1);
			text += ',';
			text += sh.source.id;
			text += ';';
		}
	}
	if(text.charAt(text.length-1)!== ':' && text.charAt(text.length-1)!== '\n'){
		text = text.substring(0,text.length - 1);
		text += ':';
	}else{
		text += ':';
	}
	text += '\n';
// for each intervention save the intervention name and the value
	Object.keys(graph.interventions).forEach((intervention) => {
		text += intervention;
		text += '-'
		text += graph.interventions[intervention].getValue();
		text += ','
	});
	if(text.charAt(text.length-1)!== ':' && text.charAt(text.length-1)!== '\n'){
		text = text.substring(0,text.length - 1);
		text += ':';
	}else{
		text += ':';
	}
	text += '\n';
	// for each rate save the value for each intervention
	Object.keys(graph.rates).forEach((key) => {
		Object.keys(graph.interventions).forEach((intervention) => {
			text += key.codePointAt(0);
			text += ',';
			text += intervention;
			text += ',';
			text += graph.rates[key][intervention].getValue();
			text += ';';
		});
	});
	if(text.charAt(text.length-1)!== ':' && text.charAt(text.length-1)!== '\n'){
		text = text.substring(0,text.length - 1);
		text += ':';
	}else{
		text += ':';
	}
	// start the download
	downloaddata(text,filename,type);
}

// download data as csv
function downloaddatacsv(){
 const data = ode();
 var text = 'population,';
 var filename = 'EMD-data.csv';
 var type = /text.*/;
 var time;
 var shID;
 var sh;
 for([shID, sh] of shapes.shMap){
		const shType = shID.substring(0,1);
		if(shType === 's'){
			text += shID;
			text += ',';
		}
	}
	text += '\n';
 for (let i = 0; i < data.length; i++) {
	 	var time = data[i].pop();
	 	if(Number.isInteger(time)){
			text += data[i];
			text += ',';
			text += '\n';
	 	}
 }
 downloaddata(text,filename,type);
}


export {inituploadmodel, downloadmodel, downloaddatacsv};