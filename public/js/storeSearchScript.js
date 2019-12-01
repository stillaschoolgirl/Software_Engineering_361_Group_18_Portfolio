//for when store search button is pushed
var validButton = document.getElementById('searchForStoreButton');
if (validButton){
	document.getElementById('searchForStoreButton').addEventListener('click',function(event){
		var storeInfo = document.getElementById("storeInfo");
		
		var req = new XMLHttpRequest();
		var parameters =
			"name="+storeInfo.elements.name.value + 
			"&address="+storeInfo.elements.address.value +
			"&city="+storeInfo.elements.city.value +
			"&state="+storeInfo.elements.state.value +
			"&zipcode="+storeInfo.elements.zipcode.value;	

		req.open("GET", "/storeSearchResults?" + parameters, true);
		req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

		
		req.addEventListener('load', function(){                        
			if(req.status >= 200 && req.status < 400){

				
				var response = JSON.parse(req.responseText);            
				var id = response.inserted;

				
				
			}
			else {
				console.log("error");
			}
		});
		
		
		req.send("/storeSearchResults?" + parameters);
	});
};