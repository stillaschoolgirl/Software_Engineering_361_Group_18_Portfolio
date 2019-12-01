/*document.addEventListener('DOMContentLoaded',() =>{
    document.getElementById('loginButton').addEventListener('click',async event =>{
	event.preventDefault();
	let context = {};
	context.username = document.getElementById('username').value;
	context.password = document.getElementById('password').value;

	try{
	    let response = await fetch('/login', {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		credentials: 'same-origin',
		headers: {
		    'Content-Type': 'application/json'
		},
		redirect: 'follow', // manual, *follow, error
		//	    referrer: 'no-referrer', // no-referrer, *client
		body: JSON.stringify(context) // body data type must match "Content-Type" header
	    })
	    
	    response = await response.json();
	    
	    if(response.invalidCredentials){
		let feedback = document.getElementById('feedbackDiv');
		feedback.style.color = "red";
		feedback.innerText = "Invalid login. Please try again.";
	    }
	}
	catch(err){
	    console.log(err);
	}
	
    });
});
*/
