document.addEventListener('DOMContentLoaded',() =>{
	document.getElementById('displayAllStores').addEventListener('click'), async event =>{
		let context = {};
		event.preventDefault();
		var queryString = "SELECT * FROM `stores`";
		context.queryString = queryString;
		
	}
});