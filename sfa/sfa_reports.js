var json2csv = require('json2csv')
var express = require('express')
var soap = require('soap')
var Async = require('async')
var Boom = require('boom')
var apigee = require('apigee-access')
var fs = require('fs');




module.exports ={
  createSOAPClient : createSOAPClient,
  getSalesData: getSalesData
}


function createSOAPClient(parameters,serviceURL, user, password, request,response, callback){
  
  
  soap.createClient(parameters.wsdl,{endpoint: serviceURL}, function(err,client) {
        if(err) {
          console.log(err);
          var error = Boom.badRequest('Internal Error: Cannot connect to SOAP target: ' + serviceURL);
          error.output.statusCode = 500;    // Assign a custom error code
          error.reformat();
          response.end(JSON.stringify(error));
        }
        client.setSecurity(new soap.BasicAuthSecurity(user,password)); //test1.apigee for qa
        
        callback(request, response, client, parameters)
        
  })
  
}




    
    

var inbound = { 'TERRITORY':{'DT_SALES_OFFICE': '', 'DT_SALES_GROUP': ''}};


  




var soapClient={};



function isSalesGroup(Territory) {
  if(Territory.Level == "Salon - Sales Group") {
    return Territory;
  }
}
    
function isSalesOffice(Territory) {
  if(Territory.Level == "Salon - Sales Office") {
    return Territory;
  }
}


function respond(outbound,reply) {
  console.log("done");
  return reply(outbound); 
      
}





function getSalesData(request,response, client, parameters) {
  
    var outbound = {'SALES_DATA':[]};
   
    console.log('main body');
    
    console.log('mode: ' + apigee.getMode());
    
     var cache = apigee.getCache(parameters.cache.name,{
          resource: parameters.cache.resource,
          scope: parameters.cache.global,
          defaultTtl: parameters.cache.defaultTtl
        });
    
    
        
    var territoryKey = '';
    
    var sales_groups = parameters.territories.filter(isSalesGroup);
    var sales_offices = parameters.territories.filter(isSalesOffice);
    var sales_office = sales_offices[0].Territories;
    
      
      //loop
      //for each territory
      //strip out the SAP territory ID
      //make call to PI/BI for data
      //Add response to final response
   
        //
        var callTarget = parameters.clientOperation
        
        Async.each(sales_groups,function(element,callback){
          inbound.TERRITORY.DT_SALES_OFFICE = sales_office;
          inbound.TERRITORY.DT_SALES_GROUP = element.Territories;
          console.log("==============================================");
          console.log("==== Sales Group " + inbound.TERRITORY.DT_SALES_GROUP + " ====");
          
          territoryKey = parameters.cacheKeyPrefix +  '_' + sales_office + '_' + element.Territories;
          console.log(territoryKey);
          
          parameters.inbound = inbound
          parameters.outbound = outbound
          parameters.json2csv = json2csv
          parameters.territoryKey = territoryKey
          
          cache.get(territoryKey,function(err,data){
            if(err) {
              console.log(err);
              callback(err);
            }
            if(data) {
              console.log('use cache target');
              outbound.SALES_DATA.push(data);
              callback();
            }
            else {
              console.log('use back-end target');
              
              callTarget(client,request,response,cache,parameters,callback)
                 
            }
            
            
          });
          
          
        },function(err) {
          if(err) {
            console.log(err);
              var error = Boom.badRequest('Internal Error: Failed to call SOAP target');
              error.output.statusCode = 500;    // Assign a custom error code
              error.reformat();
              response.end(JSON.stringify(error));
          }
          
          //ensure any csv vs json conversion done here
          
          if(request.headers["content-type"]=="text/csv") {
                  console.log('csv requested');
                  response.set({'Content-Type':'text/csv'})
                  response.end(outbound.SALES_DATA[0])
            
          }
          else{
            response.end(JSON.stringify(outbound))  
          }
          
          
          
        });
        
        
        
      
 
}




