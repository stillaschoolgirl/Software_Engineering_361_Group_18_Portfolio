document.addEventListener('DOMContentLoaded',() => {
    getAllDepartments();
    document.getElementById('searchQuery').addEventListener('input',searchDB);
    document.getElementById('saveList').addEventListener('click',saveList);
});

async function searchDB(){
    let response = await fetch(`/productSearch?searchQuery=${this.value}`);
    let results = await response.json();
    displayAutoComplete(results);
}
function displayAutoComplete(results){
    let searchList = document.getElementById('searchNameList');
    while(searchList.firstChild) searchList.removeChild(searchList.firstChild);
    let searchSelect = document.createElement('ul');
    searchSelect.setAttribute('class','list-group');
    searchSelect.setAttribute('id','searchNameListUl');
    
    results.forEach(element => {
	let opt = document.createElement('li');
	opt.setAttribute('class','list-group-item searchItems');
	opt.setAttribute('data-id',element.id);
	opt.setAttribute('data-departmentId',element.department_id);
	opt.setAttribute('data-weight',element.weight);
	opt.setAttribute('data-price',element.price);
	opt.setAttribute('data-cold',element.cold);
	opt.textContent = element.product_name;
	searchSelect.appendChild(opt);
	opt.addEventListener('click',addToList);
    });
    searchList.appendChild(searchSelect);
}
// if user clicks away from list, remove list
document.body.addEventListener('click', function(event){
    if(event.target.parentElement.id != 'searchNameListUl'){
        document.getElementById('searchNameList').innerHTML = '';
    }
});

async function getAllDepartments(){
    let response = await fetch('/getAllDepartments');
    let groceryList = document.getElementsByClassName('groceryList')[0];
    let results = await response.json();
    results.forEach(element => {
	let div = document.createElement('div');
	div.setAttribute('class','col-12 col-md-6 col-lg-4 mt-3 mb-1');
	div.setAttribute('data-departmentId',element.id);
	div.innerHTML = `<b>${element.department_name}</b><div class=\"groceries\"></div>`;
	groceryList.appendChild(div);
    });
}

function addToList(){
    //clear list auto complete if exists
    document.getElementById('searchNameList').innerHTML = '';
    let groceryList = document.getElementsByClassName('groceryList')[0].childNodes;
    for(let i = 0; i < groceryList.length; i++){ //find dept on grocery list and add then return
	if(parseInt(groceryList[i].getAttribute('data-departmentId')) === 
	   parseInt(this.getAttribute('data-departmentId'))){
	    this.setAttribute('class','groceryListItem');
	    groceryList[i].getElementsByClassName('groceries')[0].appendChild(this);
	    searchQuery.value = '';
	}
    }
}

//grab elements off dom and send to server
async function saveList(){
    let context = {};
    context.listName = document.getElementById('listName').value;
    context.list = [];
    let list = document.getElementsByClassName('groceries');
    for(let i = 0; i < list.length; i++){
	for(let j = 0; j < list[i].childNodes.length; j++) 
	    context.list.push({id:list[i].childNodes[j].getAttribute('data-id'),name:list[i].childNodes[j].innerText});
    }
    const response = await fetch('saveList', {
	method: 'POST',
	mode: 'cors', 
	cache: 'no-cache',
	credentials: 'same-origin', 
	headers: {
	    'Content-Type': 'application/json'
	    // 'Content-Type': 'application/x-www-form-urlencoded',
	},
	body: JSON.stringify(context) 
    });
    let results = await response.json();
    let feedback = document.getElementById('feedbackDiv');

    if(results){//clear out old grocery list
	for(let i = 0; i < list.length; i++){
	    list[i].parentNode.removeChild(list[i].parentNode.childNodes[list[i].parentNode.childNodes.length - 1]);
	}
	feedback.style.color = "green";
	feedback.innerText = `${context.listName} has been saved!`
    }
    else{
	feedback.style.color = "red";
	feedback.innerText = "Server error: unable to save list";
    }
}
