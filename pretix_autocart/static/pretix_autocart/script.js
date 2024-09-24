$(document).ready(function(){
	$.get("/autocart/pubkey", function(data, status){
		//var shit0 = "Diocane";
		//var shit = "-----BEGIN RSA PRIVATE KEY----- MIICXQIBAAKBgQCsy9dch/xC2hVi0pHsyEdgeuVf2yupb2dEl3IMpKdnLrBc8yd8W1XBs3754EzGNwffaAm3dhwOhnohaXRsnzrjSkyzd2k4t/H5YOsn/kKx4eDmE0PQyfcO1GyXB26x8Y++2AJsvBEvLmm7sLZVQejH+xYmoJrDFuU7LgF5YRmOKwIDAQABAoGAAYw12ptRNBwV8vOl4PQOR5vyMACbjIH179RXbiuPYEo3xC1dXizHQNvluEE9Ds1xYZvh8mW5bJvhvijepRZsBZdTbvpsh1ky6bZu8N/RpFumCc05IK06XQSEzS8SO5ltiaW2fMmN5C45OXtKE4rz7zlR/IOJLLBkJEV5UeSCtWECQQD5DrpzQP+SFZvWbkUwmARKR58AwskODzHZkNv8+PK1DOkUIjsHzJrt7ZeFF/gabWYjNpcmZeHOIC/u3+MfeglRAkEAsZzp0Hlwp0Xxq1j9gt2gYcieLnI+9zM0QSbfS0Jt1KffQBwo9rKYkB4RoSBmTMegGMNJCPPM+egUkpuKHnjAuwJBAKskDccpAPV3V9CvkWfk7f3E3WP+dX3tvwmL2z8oKk9zAa7OHtYrKMMaIqZYZCp0xlyoJJFELTghMg7pVf7JMyECQQCLB2zux2CrT1DQ86PdoGY+pK9NZBhtoCMzLJ51ZtZaM93JbUGTelF53k+mdJofV9O2DodI/q5goI4aBK6lE5ipAkBb2qqAdrWLalsLBE02MAKMA2QExO9bgTb/7e5XUWGPyuvxq9RdCWDKNMKKnpn1Dba0VQfCz800TFs+3rSiMlV9 -----END RSA PRIVATE KEY-----"; //Shitty random test key
		//var shit2 = new JSEncrypt();
		//shit2.setPrivateKey(shit);
		//var shit3 = shit2.sign(shit0, CryptoJS.SHA256, "sha256");

		var urlParams = new URLSearchParams("?" + (window.location.hash.substring(1)));
		var action = urlParams.get('a');
		var signature = urlParams.get('s');

		var jse = new JSEncrypt();
		jse.setPublicKey(data);
		var result = jse.verify(action, signature, CryptoJS.SHA256);
		if(!result){
			console.log("Invalid signature detected!");
			return;
		}

		
	});
});