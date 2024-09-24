//Copy pasted from https://stackoverflow.com/a/18652401/8767538, I'm a noob webdev lol
function setCookie(key, value, expiry) {
	var expires = new Date();
	expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
	document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}
function getCookie(key) {
	var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
	return keyValue ? keyValue[2] : null;
}
function eraseCookie(key) {
	var keyValue = getCookie(key);
	setCookie(key, keyValue, '-1');
}

$(document).ready(function(){
	$.get("/autocart/pubkey", function(data, status){

		var urlParams = new URLSearchParams("?" + (window.location.hash.substring(1)));
		var action = urlParams.get('a');
		var signature = urlParams.get('s');
		var isDataInUrl = true;
		
		if(action === null && signature === null){
			isDataInUrl = false;
			action = getCookie("pretix_autocart_action");
			signature = getCookie("pretix_autocart_signature");
			if(action === null && signature === null) return;
		}


		var jse = new JSEncrypt();
		jse.setPublicKey(data);
		var result = jse.verify(action, signature, CryptoJS.SHA256);
		if(!result){ console.log("Invalid signature detected!"); return; }

		action = action.replaceAll(/[^a-zA-Z0-9\-\_\+\/]+/gm, ""); //Better sanitize to not destroy cookies :P
		signature = signature.replaceAll(/[^a-zA-Z0-9\-\_\+\/]+/gm, "");
		if(isDataInUrl){
			setCookie("pretix_autocart_action", action, 1);
			setCookie("pretix_autocart_signature", signature, 1);
		}

		var previousKeys = getCookie("pretix_autocart_previous"); //Get previously filled questions/cart positions. We give the chance to the user to edit their cart
		previousKeys = previousKeys === null ? [] : previousKeys.split("@"); //Dumb way of splitting

		action = JSON.parse(atob(action));
		actionIds = Object.keys(action);

		for(var i = 0; i < actionIds.length; i++){
			var id = actionIds[i].replaceAll(/[^a-zA-Z0-9\-\_\+\/]+/gm, "");
			if(!previousKeys.includes(id)){

				var obj = document.getElementById(id);
				if(obj !== null){

					var value = action[id];
					var type = value.charAt(0); //first char identifies the type. 'b' -> checkbox, 'v' -> string or integer
					value = value.substring(1);

					if(type === 'v'){
						obj.value = value;
					} else {
						value = value === '1';
						if(obj.checked !== value) obj.click();
					}

					previousKeys.push(id);
				}
			}
		}

		setCookie("pretix_autocart_previous", previousKeys.join("@"), 1);	
	});
});