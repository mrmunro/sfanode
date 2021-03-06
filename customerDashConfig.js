var apigee = require('apigee-access')
var fs = require('fs')

module.exports = {

	setupDashboard : setupDashboard
}

var convertJSON2CSV = function(data, converter, request, fields, targetFields, csvDataOut) {
        converter({ data: data.RESPONSE.TERR[0].DASHB, fields: fields, fieldNames: targetFields, quotes: '', defaultValue: '' }, function(err, csv) {
        if (err) console.log(err);
        
        var res = csv.replace(/{}/g, "")
        console.log(res);
        csvDataOut.SALES_DATA.push(res);
        
        });
    }

var custDashboardTargetOperation = function(client,request,response,cache,parameters,callback) {
    
    client.SI_APIGEE_BI_CUSTOMER_DASHBOARD_I(parameters.inbound, function(err,result) {
        if(err) {
            console.log(err)
            fs.writeFileSync("err.log", err.body)
            callback(err)
        }
        
        
        
        
        console.log(request.headers);
        
        //csv conversion here
        if(request.headers["content-type"]=="text/csv") {
            console.log('csv requested');
            
            
            
            parameters.json2csv({ data: result.RESPONSE.TERR[0].DASHB, fields: parameters.fields, fieldNames: parameters.targetFields, quotes: '', defaultValue: '' }, function(err, csv) {
            if (err) console.log(err);
            
            var res = csv.replace(/{}/g, "")
            console.log(res);
            cache.put(parameters.territoryKey,res,600);
            parameters.outbound.SALES_DATA.push(res);
            
            });
            
            
        }
        else{
            //cache.put(parameters.territoryKey,result,600);
            parameters.outbound.SALES_DATA.push(result);
        }
        
        console.log("==============================================");
        callback(); 
    })
}

function setupDashboard(req) {
    var fields = ['RECTY', 'CUST', 'SGRP','SOFF','BRND','BRNDDSC', 'MATL','ACTCUSTST','POTCUSTST','PRCLVL','ISYTD','ISBDG','NETINVLC1','GSPERC','GSPOT','OPNPOT','ISBTS','JANCYIS','FEBCYIS','MARCYIS','APRCYIS','MAYCYIS','JUNCYIS','JULCYIS','AUGCYIS','SEPCYIS','OCTCYIS','NOVCYIS','DECCYIS','JANPYIS','FEBPYIS','MARPYIS','APRPYIS','MAYPYIS','JUNPYIS','JULPYIS','AUGPYIS','SEPPYIS','OCTPYIS','NOVPYIS','DECPYIS','QTYYTD', 'LASTORD','QTY','UOM']
    var targetFields = ['RECTY', 'CUST', 'SGRP','SOFF','BRND','BRNDDSC', 'MATL','ACTCUSTST','POTCUSTST','PRCLVL','ISYTD','ISBDG','NETINVLC1','GSPERC','GSPOT','OPNPOT','ISBTS','JANCYIS','FEBCYIS','MARCYIS','APRCYIS','MAYCYIS','JUNCYIS','JULCYIS','AUGCYIS','SEPCYIS','OCTCYIS','NOVCYIS','DECCYIS','JANPYIS','FEBPYIS','MARPYIS','APRPYIS','MAYPYIS','JUNPYIS','JULPYIS','AUGPYIS','SEPPYIS','OCTPYIS','NOVPYIS','DECPYIS','QTYYTD', 'LASTORD','QTY','UOM']
    var defaultServicePath = '/XISOAPAdapter/MessageServlet?senderParty=&senderService=BS_APIGEE&receiverParty=&receiverService=&interface=SI_APIGEE_BI_CUSTOMER_DASHBOARD_I&interfaceNamespace=APIGEE_BI_CUSTOMER_DASHBOARD'
    
    var customerDashboardFields = apigee.getVariable(req,'customerDashboardFields');
    var customerDashboardFieldsTarget = apigee.getVariable(req,'customerDashboardFieldsTarget');
    
    if(customerDashboardFields) {
      console.log(customerDashboardFields)    
      fields = customerDashboardFields.split(',')  
    }
    
    if(customerDashboardFieldsTarget) {
      console.log('target: ' + customerDashboardFieldsTarget)
      targetFields = customerDashboardFieldsTarget.split(',')  
    }
	
    var pathToService = apigee.getVariable(req,'customerDashboardServiceURL');
    if(!pathToService){
      pathToService = defaultServicePath
    }
    
    
    
    var parameters = {
        'wsdl': 'SI_APIGEE_BI_CUSTOMER_DASHBOARD_I.wsdl',
        'servicePath': pathToService,
        'fields': fields,
        'targetFields': targetFields,
        'cache': {'name': 'SFA2_CustomerDashboardCache', 'resource' : 'SFA2_CustomerDashboardHistory','scope': 'global',
          'defaultTtl': 30},
        'cacheKeyPrefix': 'customerDashboard',
        'clientOperation': custDashboardTargetOperation,
        'csvConversion': convertJSON2CSV
    }
    
    return parameters
}