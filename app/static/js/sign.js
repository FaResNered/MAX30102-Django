let container = document.getElementById('container')

function toggle(){
	if (document.URL.indexOf("/up") >= 0){
		container.classList.toggle('sign-in') 
 		container.classList.toggle('sign-up')
		window.history.replaceState(null, "Sensor dashboard", "./in")
	}
	else{
		container.classList.toggle('sign-in')
 		container.classList.toggle('sign-up')
		window.history.replaceState(null, "Sensor dashboard", "./up")
	}
}

function onLoad(){
	if (document.URL.indexOf("/up") >= 0){ 
		container.classList.add('sign-up')
	}
	else if (document.URL.indexOf("/in") >= 0){ 
		container.classList.add('sign-in')
	}
	else {
		container.classList.add('sign-in')
		window.history.replaceState(null, "Sensor dashboard", "./in")
	}
}

function forgotPassword(){
	console.log("Nome: " + document.getElementById("username").value)
	let link = `/forgot-password/${document.getElementById("username").value}/`
	fetch(link)
    .then(response => response.json())
    .then(data => receivedData(data))
    .catch(error => {
        console.error('Si è verificato un errore:', error);
    });
}

function receivedData(data){
	if (data.Sended){
		document.getElementById("signin").style.color = '#00FF00'
	}
	else{
		document.getElementById("signin").style.color = '#FF0000'
	}
	document.getElementById("signin").innerHTML = data.Text
}