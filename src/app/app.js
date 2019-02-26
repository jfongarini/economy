function showDiv() {
	var estado = document.getElementById('desp-main-div').style.display;
	if (estado == 'none') {
		document.getElementById('principal').style.paddingTop = "70px";
		document.getElementById('menu').style.marginTop = "66px";
		document.getElementById('desp-main-div').style.display = "block";
	} else {
		document.getElementById('principal').style.paddingTop = "40px";
		document.getElementById('menu').style.marginTop = "36px";
		document.getElementById('desp-main-div').style.display = "none";
	}
   
}