var budgetController = (function(){

	var Expense = function(id,desc,value){
		this.id = id;
		this.desc = desc;
		this.value = value;
		this.percent = -1;
	}

	Expense.prototype.calculatePercentage = function(totalInc){
		if(totalInc >0){
			this.percent = Math.round((this.value / totalInc) * 100);
		}
		else{
			this.percent = -1;
		}
	}

	Expense.prototype.getPercentage = function(){
		 return this.percent;
	}

	var Income = function(id,desc,value){
		this.id = id;
		this.desc = desc;
		this.value = value;
	}

	//the exp[] and inc[] are arrays of objects of the next items added
	var data = {
		allItems: {
			exp:[],
			inc:[]
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		precentage : -1
	}

	function calculateTotal(type){
		var sum=0;
		data.allItems[type].forEach( function(curr) {
			sum+=curr.value;
		});
		data.totals[type] = sum;
	}

	return {
		addItem : function(type, desc, val){
			var newItem,id;

			//fetching the id of the last element and increementing it.
			if(data.allItems[type].length > 0)
				id = data.allItems[type][data.allItems[type].length -1].id + 1; 
			else
				id =0;

			//creating new Item
			if(type == 'inc')
				newItem = new Income(id, desc, val);
			else
				newItem = new Expense(id, desc, val);

			data.allItems[type].push(newItem);

			//returning new item
			return newItem;
		},

		calculateBudget: function(){
			
			calculateTotal('inc');
			calculateTotal('exp');

			data.budget = data.totals.inc - data.totals.exp;

			if(data.totals.inc >0)
				data.precentage = Math.round((data.totals.exp / data.totals.inc) * 100) ;
			else
				data.precentage = -1;
		},

		calculatePercentages : function(){
			//exp = [{v:100},{v:200},{v:399}]	
			data.allItems.exp.forEach(function(curr){
				curr.calculatePercentage(data.totals.inc);
			});
	
		},

		getPercentages : function(){
			var allPerc = data.allItems.exp.map(function(curr){
				return curr.getPercentage();
			});

			return allPerc;
		},

		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				precentage: data.precentage
			}
		},

		deleteItem : function(type, id){
			var ids=[],index;
			//inc = [{id :3},{id :10},{id:20}]
			//ids = [3,10,20]
			ids = data.allItems[type].map(function(curr){
				return curr.id;
			});
			
			index = ids.indexOf(id);

			if(index !== -1)
				data.allItems[type].splice(index, 1);

		},

		testing : function(){
			console.log(data);
		}

	}

})();



var UIController = (function(){

	var DomStrings = {
		inputType : '.add__type',
		description : '.add__description',
		value : '.add__value',
		btn : '.add__btn',
		incomeList : '.income__list',
		expenseList : '.expenses__list',
		budgetValue : '.budget__value',
		budgetIncValue : '.budget__income--value',
		budgetExpValue : '.budget__expenses--value',
		precentage : '.budget__expenses--percentage',
		container : '.container',
		expPercentage : '.item__percentage',
		date :'.budget__title--month'
	};

	var formatNumber = function(num, type){
			var numSplit=[],int,dec;

			num = Math.abs(num);
			num = num.toFixed(2);

			numSplit = num.split('.');
			int = numSplit[0];
			dec = numSplit[1];

			if(int.length > 3){
				int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
			}

			return (type === 'exp'? '-' : '+')+' '+int+'.'+dec;
		}


	return {
		getDom : function(){
			return DomStrings;
		},

		getinput : function(){
			return {
				type : document.querySelector(DomStrings.inputType).value, //this will give the value of the value atr of option
				desc : document.querySelector(DomStrings.description).value,
				value : parseFloat(document.querySelector(DomStrings.value).value)
			}
			
		},
		
		addListItem : function(item, type){
			var html,newhtml,element;

			//create HTML string with placeholder text
			if(type == 'inc'){
				element = DomStrings.incomeList;
				html = '<div class="item clearfix" id="inc-%%id%%"><div class="item__description">%%desc%%</div><div class="right clearfix"><div class="item__value">%%value%%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			else{
				element = DomStrings.expenseList;
				html = '<div class="item clearfix" id="exp-%%id%%"><div class="item__description">%%desc%%</div><div class="right clearfix"><div class="item__value">%%value%%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			//replacing placeholder data with actual data
			newhtml= html.replace('%%id%%', item.id);
			newhtml= newhtml.replace('%%desc%%', item.desc);
			newhtml= newhtml.replace('%%value%%', formatNumber(item.value, type));

			//inserting into dom
			document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);

		},

		deleteListItem : function(selectorId){
			var el = document.getElementById(selectorId);
			el.parentNode.removeChild(el);
		},

		clearFields : function(){
			var fields,fieldsArr;
			//this returns in the form of list
			fields = document.querySelectorAll(DomStrings.description+ ','+ DomStrings.value);

			//converting the list to array
			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach( function(curr, index, arr) {
				curr.value = "";
			});
			fieldsArr[0].focus();
		},

		displayBudget: function(obj){
			var type = obj.budget > 0 ? 'inc':'exp';
			document.querySelector(DomStrings.budgetValue).textContent = formatNumber(obj.budget,type);
			document.querySelector(DomStrings.budgetIncValue).textContent = formatNumber(obj.totalInc,'inc');			
			document.querySelector(DomStrings.budgetExpValue).textContent = formatNumber(obj.totalExp,'exp');
			if(obj.precentage >0)
				document.querySelector(DomStrings.precentage).textContent = obj.precentage+" %";
			else
				document.querySelector(DomStrings.precentage).textContent = "---";

		},

		displayPercentages : function(precentages){
			var fields = document.querySelectorAll(DomStrings.expPercentage);
			for(var i =0 ; i< fields.length; i++ ){
				if(precentages[i] > 0)
					fields[i].textContent = precentages[i] + '%';
				else
					fields[i].textContent = '---';

			}
		},

		displayMonth : function(){
			var date = new Date();
			var year = date.getFullYear();
			var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
			var month = date.getMonth();
			document.querySelector(DomStrings.date).textContent = months[month]+' '+year;

		},
		changeType : function(){
			var fields = document.querySelectorAll(
				DomStrings.inputType+','
				+DomStrings.description+','
				+DomStrings.value
			);
			console.log(fields);
			for(var i =0;i< fields.length;i++){
				fields[i].classList.toggle('red-focus');
			}
			document.querySelector(DomStrings.btn).classList.toggle('red');
		}		
	}

})();


//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl , uiCtrl){

	var setEventListeners = function(){		
		var DomStrings = uiCtrl.getDom();
		
		document.querySelector(DomStrings.btn).addEventListener('click',ctrlAddItem);
		
		document.addEventListener('keypress',function(event){
			if(event.keycode === 13 || event.which === 13){
				ctrlAddItem();
			}
		});
		
		document.querySelector(DomStrings.container).addEventListener('click', ctrlDelItem);

		document.querySelector(DomStrings.inputType).addEventListener('change', uiCtrl.changeType)
	}

	var ctrlAddItem = function(){
		var input = uiCtrl.getinput();

		if(input.desc !== "" && !isNaN(input.value) && input.value >0){
			
			var newItem = budgetCtrl.addItem(input.type, input.desc, input.value);

			uiCtrl.addListItem(newItem, input.type);
			uiCtrl.clearFields();

			updateBudget();

			updatePercentages();

		}

	}

	var ctrlDelItem = function(event){
		var itemId,splitId,type,id;
		
		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if(itemId){
			splitId = itemId.split('-');
			type = splitId[0];
			id = parseInt(splitId[1]);
		}

		budgetCtrl.deleteItem(type, id);

		uiCtrl.deleteListItem(itemId);

		updateBudget();

		updatePercentages();

	}

	var updateBudget = function(){
		budgetCtrl.calculateBudget();

		var budget = budgetCtrl.getBudget();

		uiCtrl.displayBudget(budget);
	}

	var updatePercentages = function(){
		budgetCtrl.calculatePercentages();

		var precentages = budgetCtrl.getPercentages();

		uiCtrl.displayPercentages(precentages);

	}

	return {
		init: function(){
			console.log("Apllication has started");
			uiCtrl.displayMonth();
			uiCtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				precentage: -1
			})
			setEventListeners();
		}
	}

})(budgetController,UIController);

controller.init();