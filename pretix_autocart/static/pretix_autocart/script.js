//Copy pasted from https://stackoverflow.com/a/18652401/8767538, I'm a noob webdev lol
function setCookie(key, value, expiry) {
	var expires = new Date();
	expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
	document.cookie = key + '=' + value + ';path=/;expires=' + expires.toUTCString();
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
		
		/*var shit0 = atob(action);
		var shit = "-----BEGIN RSA PRIVATE KEY----- MIICXQIBAAKBgQCsy9dch/xC2hVi0pHsyEdgeuVf2yupb2dEl3IMpKdnLrBc8yd8W1XBs3754EzGNwffaAm3dhwOhnohaXRsnzrjSkyzd2k4t/H5YOsn/kKx4eDmE0PQyfcO1GyXB26x8Y++2AJsvBEvLmm7sLZVQejH+xYmoJrDFuU7LgF5YRmOKwIDAQABAoGAAYw12ptRNBwV8vOl4PQOR5vyMACbjIH179RXbiuPYEo3xC1dXizHQNvluEE9Ds1xYZvh8mW5bJvhvijepRZsBZdTbvpsh1ky6bZu8N/RpFumCc05IK06XQSEzS8SO5ltiaW2fMmN5C45OXtKE4rz7zlR/IOJLLBkJEV5UeSCtWECQQD5DrpzQP+SFZvWbkUwmARKR58AwskODzHZkNv8+PK1DOkUIjsHzJrt7ZeFF/gabWYjNpcmZeHOIC/u3+MfeglRAkEAsZzp0Hlwp0Xxq1j9gt2gYcieLnI+9zM0QSbfS0Jt1KffQBwo9rKYkB4RoSBmTMegGMNJCPPM+egUkpuKHnjAuwJBAKskDccpAPV3V9CvkWfk7f3E3WP+dX3tvwmL2z8oKk9zAa7OHtYrKMMaIqZYZCp0xlyoJJFELTghMg7pVf7JMyECQQCLB2zux2CrT1DQ86PdoGY+pK9NZBhtoCMzLJ51ZtZaM93JbUGTelF53k+mdJofV9O2DodI/q5goI4aBK6lE5ipAkBb2qqAdrWLalsLBE02MAKMA2QExO9bgTb/7e5XUWGPyuvxq9RdCWDKNMKKnpn1Dba0VQfCz800TFs+3rSiMlV9 -----END RSA PRIVATE KEY-----"; //Shitty random test key
		var shit2 = new JSEncrypt();
		shit2.setPrivateKey(shit);
		var shit3 = shit2.sign(shit0, CryptoJS.SHA256, "sha256");
		console.log(shit3);
		console.log(signature);*/

		if(action === null && signature === null){
			isDataInUrl = false;
			action = getCookie("pretix_autocart_action");
			signature = getCookie("pretix_autocart_signature");
			if(action === null && signature === null) return;
		}

		var jse = new JSEncrypt();
		jse.setPublicKey(data);
		var result = jse.verify(action, signature.replaceAll("-", "+").replaceAll("_", "/"), CryptoJS.SHA256);
		if(!result){ console.log("Invalid signature detected!"); return; }

		action = action.replaceAll(/[^a-zA-Z0-9\-\_\+\/]+/gm, ""); //Better sanitize to not destroy cookies :P
		signature = signature.replaceAll(/[^a-zA-Z0-9\-\_\+\/]+/gm, "");
		if(isDataInUrl){
			setCookie("pretix_autocart_action", action, 1);
			setCookie("pretix_autocart_signature", signature, 1);
			eraseCookie("pretix_autocart_previous");
		}

		var previousKeys = getCookie("pretix_autocart_previous"); //Get previously filled questions/cart positions. We give the chance to the user to edit their cart
		previousKeys = (previousKeys === null || previousKeys === "" || isDataInUrl) ? [] : previousKeys.split("@"); //Dumb way of splitting

		action = JSON.parse(atob(action));
		actionIds = Object.keys(action);

		//We DON'T need to check if a field "group" is "open", the input object will always be there
		for(var i = 0; i < actionIds.length; i++){
			var id = actionIds[i].replaceAll(/[^a-zA-Z0-9\-\_\+\/\$]+/gm, "");
			if(!previousKeys.includes(id)){

				var sp = id.split("$"); //Use "$" as a SINGLE wildcard in ids
				var elements = null;
				if(sp.length > 1) {
					elements = $('input[id^=' + sp[0] + '][id$=' + sp[1] + ']'); //Apply the same addons/questions to every cart position. There's no known way to differentiate between those
				} else elements = $('input[id=' + id + ']');
				for(var j = 0; j < elements.length; j++){
					obj = elements[j];

					var value = action[id];
					var type = value.charAt(0); //first char identifies the type. 'b' -> checkbox, 'v' -> string or integer
					value = value.substring(1);

					if(type === 'v'){
						obj.value = value;
						obj.focus(); //Just to be sure
					} else {
						value = value === '1';
						if(obj.checked !== value) obj.click();
					}
				}
				
				if(elements.length > 0) previousKeys.push(id);
			}
		}

		setCookie("pretix_autocart_previous", previousKeys.join("@"), 1);	
	});
});