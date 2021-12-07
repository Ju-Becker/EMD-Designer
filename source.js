window.onload = function() {
	const asText = document.getElementById('asText');
	const textbox = document.getElementById('textbox');
	const download = document.getElementById('download');

	download.addEventListener('click', downloadstart)
	asText.addEventListener('change', function(e) {
			const file = asText.files[0];
			const textType = /text.*/;

			if (file.type.match(textType)) {
					const reader = new FileReader();

					reader.onload = function(e) {
							textbox.innerText = reader.result;
							init(reader.result);
					}

					reader.readAsText(file);    
			} else {
					textbox.innerText = "Dateityp nicht unterstützt";
			}
	});
}

function init(input){
	var i = 0;
	var counter = 0;
	var states = [];
	const verify = input.slice(0,19);
	if(verify === 'Epidemic-Model-Data'){
	i=21;
	while(input[i]){
		if(input[i] === ','){
			counter++;
		}else{
			states.push(input[i])
		}
		i++;
	}
	alert('Die Datei beinhaltet ' + states.length + ' States');
}else{
	alert('wrong data input')
}
}

function downloadstart(){
	data = new File('data-model');
	data.open('w');
	data.writeIn('Epidemic-Model-Data');
	data.flush();
	data.close();

}

