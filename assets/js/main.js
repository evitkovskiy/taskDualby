class MainCtrl{
	constructor($scope, $http, $filter){

		$scope.currency = "145";
		$scope.currencyToAdd = "145";
		$scope.graphMode = true;
		$scope.date = {
			end: new Date()
		};
		$scope.date.start = new Date($scope.date.end);
		$scope.date.start.setDate($scope.date.start.getDate()-30);
		$scope.currencyTable = [];

		function formatDate(date){
			return date.getFullYear() + '-' + (date.getMonth()+1)+'-'+ date.getDate();
		};

		$scope.drawData = function(currency){
			getRates(currency).then(function (response) {
				$scope.items = response;
				console.log(response);
				
				$scope.currencyTable = [];
				let tableObj = {
					currency: currency,
					list: response
				};
				$scope.currencyTable.push(tableObj);
				$scope.table = toTable($scope.currencyTable);

				if ($scope.graphMode) drawGraph(response);
			}, function (error) {
				console.log(error);
			});
		};
		$scope.drawData($scope.currency);

		function getRates(currency) {
			if (arguments.length == 0) {
				let currency = 145;
			}
			console.log($scope.date.start);
			console.log($scope.date.end);
			let startDate = formatDate($scope.date.start);
			let endDate = formatDate($scope.date.end);

			return $http.get('http://www.nbrb.by/API/ExRates/Rates/Dynamics/' + currency +
				'?startDate=' + startDate + '&endDate=' + endDate).then(
				(successRes) => {
					return successRes.data;
				},
				(errorRes) => {
					return errorRes;
				});
			};

			function toTable(currencies){

				let table = [];
				for (let i = 0; i < $scope.currencyTable[0].list.length; i++) {
					table.push([]);
					table[i][0] = $scope.currencyTable[0].list[i].Date;
					table[i][0] = $filter('date')(table[i][0], 'dd.MM.yyyy');
					console.log(table[i][0]);

					for (let j = 0; j < $scope.currencyTable.length; j++) {
						table[i][j+1] = $scope.currencyTable[j].list[i].Cur_OfficialRate.toString().replace(".",",");
					}
				}
					return table;
			}

			$scope.addCurrencyRow = function(currency) {
				getRates(currency).then(function (response) {
					let tableObj = {
						currency: currency,
						list: response
					};
					$scope.currencyTable.push(tableObj);

					$scope.table = toTable($scope.currencyTable);

				}, function (error) {
					console.log(error);
				})

			}

				$scope.removeCurrencyRow = function(index) {
					if ($scope.currencyTable.length < 2) {
						alert('Невозможно удалить все строки!');
						return;
					}
					$scope.currencyTable.splice(index, 1);
					$scope.table = toTable($scope.currencyTable);
			}

		}

	}

	let app = angular.module('app', []);

	app.filter('currencyLabel', function() {
		let currencies = {
			"145": "USD",
			"292": "EUR",
			"298": "RUB"
		};

		return function(id) {
			return currencies[id];
		};
	});
	app.controller('mainCtrl', MainCtrl);



	function drawGraph(data){
		let labels = data.map((el)=>{
			let date = new Date(el.Date);
			return date.getDate()+'.'+(date.getMonth()+1)+'.'+date.getFullYear();
		});
		let values = data.map(el => el.Cur_OfficialRate);
		console.log(labels);
		console.log(values);
		new Chart(document.getElementById("myChart").getContext('2d'), {
			"type": "line",
			"data": {
				"labels": labels,
				"datasets": [{
					"label": "Курс валюты",
					"data": values,
					"fill": false,
					"borderColor": "rgb(75, 192, 192)",
					"lineTension": 0.1
				}]
			},
			"options": {}
		});
	};

