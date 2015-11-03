var express = require('express')
var sfa_reports = require('./sfa/sfa_reports.js')
var apigee = require('apigee-access')


var salesHistoryConfig = require('./salesHistoryConfig.js')

var serviceURL = '';
var soapClient
var targetBasePath = 'http://s61us01ap152d.aemea.kao.com:50000'
//var targetBasePath = 'https://api-dev.kaokonnections.com'
//var targetBasePath = 'https://api-qa.kaokonnections.com'

function getTerritories(req) {
	var territories = []
	
	territories = apigee.getVariable(req,'territories');
	
	if(!territories) {
	 territories = [
      {"Territories": "B14", "Level": "Salon - Sales Office"},
      {"Territories": "113", "Level": "Salon - Sales Group"}
      //{"Territories": "B06", "Level": "Salon - Sales Office"},
      /*{"Territories": "904", "Level": "Salon - Sales Group"},*/
      //{"Territories": "904", "Level": "Salon - Sales Group"}
      /*{"Territories": "300", "Level": "Salon - Sales Group"},
      {"Territories": "200", "Level": "Salon - Sales Group"}*/
     ];
    }
	
   	return territories
	
}

function callTargetService(request, response, parameters, callback) {

    serviceURL = targetBasePath + parameters.servicePath
            
    sfa_reports.createSOAPClient(parameters,serviceURL,'SOAP_APIGEE','test.apigee',request,response, callback)
    
}



function salesHistory(req,res){
    
    
    var parameters = salesHistoryConfig.setupSalesHistory(req)
    parameters.territories = getTerritories(req)
    
    callTargetService(req,res, parameters, sfa_reports.getSalesData)
}


module.exports = {

	salesHistory : salesHistory
}